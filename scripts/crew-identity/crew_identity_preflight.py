#!/usr/bin/env python3
"""Conservative, explicit preflight for authored text, not a chat interceptor.

This checks paragraph-level identity ambiguity. It does not solve anaphora or
rewrite anybody's pronouns. A paragraph containing an identity whose policy is
name-only must use names throughout if it would otherwise contain a gendered
pronoun. Separate another subject into a clearly named paragraph when needed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys


DEFAULT_REGISTRY = Path(__file__).with_name("crew_identity_registry.json")
GENDERED = frozenset({"she", "her", "hers", "herself", "he", "him", "his", "himself"})
PRONOUN_RE = re.compile(r"(?<!\w)(she|her|hers|herself|he|him|his|himself)(?!\w)", re.I)
PARAGRAPH_BREAK = re.compile(r"\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*")


class PreflightInputError(ValueError):
    """Input or policy could not be checked; callers must not treat this as pass."""


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _registry(path: str | Path | None):
    try:
        raw = Path(path or DEFAULT_REGISTRY).read_bytes()
        data = json.loads(raw.decode("utf-8"))
    except (OSError, UnicodeError, ValueError) as exc:
        raise PreflightInputError(f"Cannot read identity policy: {exc}") from exc
    if not isinstance(data, dict) or data.get("version") != 1:
        raise PreflightInputError("Identity policy version must be 1")
    entities = data.get("entities")
    if not isinstance(entities, list) or not entities:
        raise PreflightInputError("Identity policy must contain a nonempty entities list")
    by_alias = {}
    by_name = {}
    for entry in entities:
        if not isinstance(entry, dict):
            raise PreflightInputError("Each identity entry must be an object")
        name = entry.get("name")
        aliases = entry.get("aliases")
        pronouns = entry.get("gendered_pronouns")
        policy = entry.get("policy")
        if not isinstance(name, str) or not name.strip() or name != name.strip():
            raise PreflightInputError("Each identity requires a nonempty canonical name")
        if name.casefold() in by_name:
            raise PreflightInputError(f"Duplicate identity: {name}")
        if entry.get("kind") not in {"crew", "human", "engine"} or policy not in {"name-only", "stated"}:
            raise PreflightInputError(f"Invalid identity kind or policy: {name}")
        if (not isinstance(pronouns, list)
                or any(not isinstance(p, str) or p not in GENDERED for p in pronouns)):
            raise PreflightInputError(f"Invalid gendered pronoun set: {name}")
        if policy == "name-only" and pronouns:
            raise PreflightInputError(f"Name-only identity cannot authorize gendered pronouns: {name}")
        if policy == "stated" and not pronouns:
            raise PreflightInputError(f"Stated identity requires an explicit pronoun set: {name}")
        if (not isinstance(aliases, list) or not aliases
                or any(not isinstance(a, str) or not a.strip() or a != a.strip() for a in aliases)):
            raise PreflightInputError(f"Invalid aliases: {name}")
        excluded = entry.get("excluded_references", [])
        if (not isinstance(excluded, list)
                or any(not isinstance(a, str) or not a.strip() or a != a.strip() for a in excluded)
                or (excluded and entry["kind"] != "engine")):
            raise PreflightInputError(f"Invalid engine reference exclusions: {name}")
        by_name[name.casefold()] = entry
        for alias in dict.fromkeys([name, *aliases]):
            key = alias.casefold()
            if key in by_alias and by_alias[key]["name"] != name:
                raise PreflightInputError(f"Conflicting identity alias: {alias}")
            by_alias[key] = entry
    for entry in entities:
        if any(reference.casefold() in by_alias for reference in entry.get("excluded_references", [])):
            raise PreflightInputError("Engine reference exclusions cannot override a registered identity")
    aliases = sorted(by_alias, key=len, reverse=True)
    # Engine identity permission must not extend to model identifiers such as
    # Qwen-VL merely because their product names contain the engine's name.
    patterns = []
    for alias in aliases:
        boundary = r"[\w-]" if by_alias[alias]["kind"] == "engine" else r"\w"
        patterns.append(r"(?<!" + boundary + ")" + re.escape(alias) + r"(?!" + boundary + ")")
    pattern = re.compile("|".join(patterns), re.I)
    return by_alias, pattern, _sha256(raw)


def _paragraphs(text: str):
    start = 0
    for separator in PARAGRAPH_BREAK.finditer(text):
        if text[start:separator.start()].strip():
            yield start, separator.start(), text[start:separator.start()]
        start = separator.end()
    if text[start:].strip():
        yield start, len(text), text[start:]


def _line_column(text: str, offset: int):
    return text.count("\n", 0, offset) + 1, offset - text.rfind("\n", 0, offset)


def _named_at_start(paragraph: str, match: re.Match) -> bool:
    # Only formatting may precede an explicit new subject. An incidental later
    # mention must not silently reset an unresolved preceding identity.
    prefix = paragraph[:match.start()]
    return bool(re.fullmatch(r"[\s#>*+_`\[\](\)\"'“‘-]*(?:\d+[.)]\s*)?", prefix))


def _outside_engine_scope(paragraph, entries):
    """Explicit exclusions clear engine context without assigning another identity."""
    for entry in entries:
        if entry["kind"] != "engine" or entry["policy"] != "stated":
            continue
        excluded = [r"(?<!\w)" + re.escape(name) + r"(?!\w)"
                    for name in entry.get("excluded_references", [])]
        # Product/version suffixes are not aliases for the engine identity.
        excluded.extend(r"(?<!\w)" + re.escape(alias) + r"(?:[-_][\w.-]+|\d[\w.-]*)(?!\w)"
                        for alias in entry["aliases"])
        if excluded and re.search("|".join(excluded), paragraph, re.I):
            return True
    return False


def validate_text(text: str, registry_path: str | Path | None = None,
                  subject: str | None = None, strict: bool = False) -> dict:
    """Return an exact-text receipt; invalid policy/input raises PreflightInputError.

    Findings use zero-based character offsets and one-based line/column numbers.
    End offsets are exclusive. Paragraph bounds let a diff consumer retain full
    context rather than attempting independent added-line identity inference.
    """
    if not isinstance(text, str):
        raise PreflightInputError("Text must be a Unicode string")
    try:
        encoded = text.encode("utf-8")
    except UnicodeError as exc:
        raise PreflightInputError("Text must encode as UTF-8") from exc
    by_alias, name_re, policy_hash = _registry(registry_path)
    context = []
    if subject is not None:
        if not isinstance(subject, str) or subject.casefold() not in by_alias:
            raise PreflightInputError("Context subject is not in the identity policy")
        context = [by_alias[subject.casefold()]]
    findings = []
    checked_names = set(e["name"] for e in context)
    for start, end, paragraph in _paragraphs(text):
        named = list(name_re.finditer(paragraph))
        entries = list({by_alias[m.group(0).casefold()]["name"]:
                        by_alias[m.group(0).casefold()] for m in named}.values())
        checked_names.update(e["name"] for e in entries)
        protected = [e for e in entries if e["policy"] == "name-only"]
        if protected:
            effective = protected
        elif entries and (not context or _named_at_start(paragraph, named[0])):
            effective = entries
        elif context:
            effective = context
        else:
            effective = entries
        outside_engine_scope = _outside_engine_scope(paragraph, effective)
        # Keep the complete previous effective subject across blank lines and
        # long text. There is no 200-character expiry or quote/keyword bypass.
        if outside_engine_scope:
            context = []
        elif effective:
            context = effective
        protected_effective = [e for e in effective if e["policy"] == "name-only"]
        for pronoun_match in PRONOUN_RE.finditer(paragraph):
            pronoun = pronoun_match.group(0)
            if not effective and not strict:
                continue
            if outside_engine_scope:
                reason = ("An explicitly excluded reference or model identifier cannot inherit engine "
                          "pronoun authorization. Name the intended subject in a separate paragraph.")
                implicated = effective
            elif not effective:
                reason = ("A gendered pronoun has no explicit subject in this draft. "
                          "Name the subject or supply --subject; missing context is not a pass.")
                implicated = []
            elif protected_effective:
                reason = ("Name-only identity shares a paragraph or unresolved continuation with a gendered "
                          "pronoun. Use the name, or give a different subject its own explicitly named paragraph.")
                implicated = protected_effective
            elif any(pronoun.casefold() not in e["gendered_pronouns"] for e in effective):
                reason = ("Pronoun is not authorized for every named or continuing subject in this paragraph. "
                          "Use names or separate explicitly named subjects; the checker does not resolve anaphora.")
                implicated = effective
            else:
                continue
            absolute_start = start + pronoun_match.start()
            absolute_end = start + pronoun_match.end()
            line, column = _line_column(text, absolute_start)
            end_line, end_column = _line_column(text, absolute_end)
            findings.append({"line": line, "column": column, "end_line": end_line,
                             "end_column": end_column, "start": absolute_start, "end": absolute_end,
                             "paragraph_start": start, "paragraph_end": end,
                             "entities": [e["name"] for e in implicated], "pronoun": pronoun,
                             "reason": reason})
    return {"version": 1, "status": "blocked" if findings else "pass",
            "text_sha256": _sha256(encoded), "policy_sha256": policy_hash,
            "checked_entities": sorted(checked_names), "subject": subject,
            "strict": strict,
            "findings": findings,
            "scope": "Only the supplied exact text was checked. This is not an automatic hosted-chat interceptor."}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--text-file", required=True, type=Path)
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    parser.add_argument("--subject", help="Explicit subject for a continuation that does not repeat a name")
    parser.add_argument("--strict", action="store_true",
                        help="For Crew summaries: also reject gendered references without a known subject")
    args = parser.parse_args(argv)
    try:
        raw = args.text_file.read_bytes()
        text = raw.decode("utf-8")
        result = validate_text(text, args.registry, args.subject, strict=args.strict)
    except (OSError, UnicodeError, PreflightInputError) as exc:
        print(json.dumps({"version": 1, "status": "error", "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result["findings"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
