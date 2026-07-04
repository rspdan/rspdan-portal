#!/usr/bin/env python3
"""
gen_cascade_svg.py · generate the NEST skill cascade map SVG from the live skill set.

Data-driven regen (v1.4, 070426): the previous v1.2 was a hand-authored 33-skill
snapshot. This generates the cascade from the live 46-by-altitude data that
src/pages/skills.astro renders, so the visual and the page agree and the count
never drifts again. Same palette + type tokens as v1.2 (teal/amber, IBM Plex Mono);
apex = meta-dates (the always-on trigger); tiers = the 8 altitude bands.

Run: python3 scripts/gen_cascade_svg.py > public/img/skills/cascade-map-v1.4-070426.svg
"""

# The 51 NEST-built skills by altitude, mirroring src/pages/skills.astro's nestSkills.
# Order of tiers is the session-arc order (boot -> close).
TIERS = [
    ("BOOT", ["boot-polish", "ican", "stan_briefcase", "trip_briefcase", "doc_briefcase", "context-alignment", "dna", "allskill"]),
    ("SESSION", ["session-poem", "session-close", "survival-toolkit"]),
    ("MEMORY / MAPPING", ["living-map", "meta-dates", "oo-daily", "photon-split", "hypercampus-builder", "hypercampus", "worderiver"]),
    ("CREW OPS", ["dtad", "triptective", "ghosts", "remememento", "skill-upload", "oshin", "rorrim-nips", "oloskill", "oshin-oddit"]),
    ("CREATIVE / PORTAL", ["heircor-visual", "waywood-lore", "niaprint", "na-publish", "na-pdf", "na-pdf-style", "rspdan-design", "fablefallshower", "fivier"]),
    ("INFRASTRUCTURE", ["formulacaster", "router-flash", "dex-mobile", "remote-control", "page-integrity"]),
    ("FEDERAL STANDARD", ["atomic-commit", "box-in-box"]),
    ("DISCIPLINE", ["btw", "ilevel-grid-sifter", "ultrareview", "r3mp", "dan", "lagos-check", "continuous-substrate", "cba-searching"]),
]

# palette (from v1.2)
C = dict(
    bg="#0d1411", apex_fill="#633806", apex_stroke="#EF9F27", apex_title="#FAC775", apex_meta="#EF9F27",
    phase_fill="#085041", phase_stroke="#5DCAA5", phase_title="#9FE1CB",
    node_fill="#0f2a24", node_stroke="#5DCAA5", node_text="#C9F0E2",
    amber="#EF9F27", muted="#8A93A5",
)

W = 800
PAD = 24
APEX_H = 56
TIER_LABEL_W = 150
NODE_H = 26
NODE_GAP = 8
ROW_GAP = 10
TIER_GAP = 16
NODE_W = 150  # fixed pill width; wraps within the content column
CONTENT_X = PAD + TIER_LABEL_W + 12
CONTENT_W = W - CONTENT_X - PAD


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def layout():
    """Return (svg_body, total_height). Each tier is a band; skills wrap into rows
    within the content column."""
    body = []
    total = len(sum((s for _, s in TIERS), []))
    y = PAD + APEX_H + 18  # below the apex

    # apex (meta-dates), the always-on trigger
    apex_w = 320
    apex_x = (W - apex_w) / 2
    body.append(f'<rect x="{apex_x:.0f}" y="{PAD}" width="{apex_w}" height="{APEX_H}" rx="8" '
                f'fill="{C["apex_fill"]}" stroke="{C["apex_stroke"]}" stroke-width="1"/>')
    body.append(f'<text x="{W/2:.0f}" y="{PAD+22}" class="apex-title">meta-dates</text>')
    body.append(f'<text x="{W/2:.0f}" y="{PAD+40}" class="apex-meta">apex always-on trigger '
                f'(corpus-first, memory-never)</text>')

    cols = max(1, CONTENT_W // (NODE_W + NODE_GAP))
    for label, skills in TIERS:
        rows = (len(skills) + cols - 1) // cols
        band_h = rows * NODE_H + (rows - 1) * ROW_GAP + 18
        # tier band
        body.append(f'<rect x="{PAD}" y="{y:.0f}" width="{W-2*PAD}" height="{band_h:.0f}" rx="8" '
                    f'fill="{C["phase_fill"]}" fill-opacity="0.35" stroke="{C["phase_stroke"]}" stroke-width="0.5"/>')
        body.append(f'<text x="{PAD+14}" y="{y+24:.0f}" class="phase-title">{esc(label)}</text>')
        body.append(f'<text x="{PAD+14}" y="{y+42:.0f}" class="phase-count">{len(skills)} skill'
                    f'{"s" if len(skills)!=1 else ""}</text>')
        # nodes
        for i, name in enumerate(skills):
            r, c = divmod(i, cols)
            nx = CONTENT_X + c * (NODE_W + NODE_GAP)
            ny = y + 9 + r * (NODE_H + ROW_GAP)
            body.append(f'<rect x="{nx:.0f}" y="{ny:.0f}" width="{NODE_W}" height="{NODE_H}" rx="13" '
                        f'fill="{C["node_fill"]}" stroke="{C["node_stroke"]}" stroke-width="0.75"/>')
            body.append(f'<text x="{nx+NODE_W/2:.0f}" y="{ny+17:.0f}" class="node-text">{esc(name)}</text>')
        y += band_h + TIER_GAP

    total_h = y + PAD
    return "\n  ".join(body), total_h, total


def main():
    inner, H, total = layout()
    svg = f'''<svg width="100%" viewBox="0 0 {W} {int(H)}" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>NEST Skill Cascade Map v1.4 · {total}-skill state · 070426</title>
  <desc>{total} NEST-built skills arranged by altitude tier (boot through discipline) with meta-dates as apex always-on trigger. Data-driven regen of the v1.2 33-skill snapshot; generated from the live skills.astro skill set so the count cannot drift.</desc>
  <defs>
    <style>
      .apex-title {{ fill: {C['apex_title']}; font: 500 16px 'IBM Plex Mono', system-ui, sans-serif; text-anchor: middle; }}
      .apex-meta {{ fill: {C['apex_meta']}; font: 400 11px 'IBM Plex Mono', system-ui, sans-serif; text-anchor: middle; }}
      .phase-title {{ fill: {C['phase_title']}; font: 500 13px 'IBM Plex Mono', system-ui, sans-serif; }}
      .phase-count {{ fill: {C['muted']}; font: 400 10px 'IBM Plex Mono', system-ui, sans-serif; }}
      .node-text {{ fill: {C['node_text']}; font: 400 11px 'IBM Plex Mono', system-ui, sans-serif; text-anchor: middle; }}
    </style>
  </defs>
  <rect x="0" y="0" width="{W}" height="{int(H)}" fill="{C['bg']}"/>
  {inner}
</svg>
'''
    import sys
    sys.stdout.write(svg)


if __name__ == "__main__":
    main()
