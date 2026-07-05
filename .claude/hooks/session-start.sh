#!/bin/bash
# rspdan-portal boot hook: installs the NEST pre-commit gate net for the PUBLIC face
# (per the Fable harness, 060926: the public-deploy surface gets the same code-gates;
# anything that must hold on Fable lives in the hook layer, not in recall).
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
if [ -d "$REPO/.git" ]; then
  cat > "$REPO/.git/hooks/pre-commit" <<'PRECOMMIT_EOF'
#!/bin/bash
# NEST pre-commit gates (portal). FAIL-OPEN (only blocks on a gate exit 1).
PY=""
for c in python3 python py; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c "import sys" >/dev/null 2>&1; then PY="$c"; break; fi
done
[ -z "$PY" ] && exit 0
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
for g in precommit_no_emdash_gate.py precommit_no_agos_gate.py precommit_lexicon_radar.py; do
  GATE="$ROOT/ENGINE/$g"
  [ -f "$GATE" ] || continue
  "$PY" "$GATE"; rc=$?
  [ "$rc" = "1" ] && exit 1
done
exit 0
PRECOMMIT_EOF
  chmod +x "$REPO/.git/hooks/pre-commit" 2>/dev/null || true
  echo "[NEST portal hook] pre-commit gates installed (em-dash + retired-acronym + lexicon-radar) for the PUBLIC face"
  # SHALLOW-HEAL (Dan-direct 070526 "fix this branch shit forever, lose nothing"): a shallow
  # clone makes `git merge-base` return empty, which reads as "unrelated histories / orphan"
  # (the false-orphan-panic). Unshallow ONCE in the background so no seat working the portal
  # ever misreads depth as a lineage break. Idempotent (no-op once full), non-blocking.
  if [ "$(git -C "$REPO" rev-parse --is-shallow-repository 2>/dev/null)" = "true" ]; then
    ( git -C "$REPO" fetch --unshallow origin >/dev/null 2>&1 & ) 2>/dev/null || true
  fi
fi
