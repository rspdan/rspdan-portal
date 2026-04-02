# STANDARD RULE — WEB/PRINT ARCHITECTURE
# Filed: Twosday 033026 | ◆ Stan (STN2_StanS_033026_1)
# Authority: Dan Sullivan (DPS) — "web VISIBLE ONLINE, print ACCESSIBLE OFFLINE"
# Status: CANON — applies to all NEST deliverables with dual distribution

---

## THE RULE

Every deliverable that needs to exist in both web and print form
follows this architecture:

```
SOURCE (Bridge — .md canonical file)
       ↓                    ↓
RENDER 1 (Web)        RENDER 2 (Print)
Astro page            PDF in /public/
rspdan.com/[name]     rspdan.com/[name].pdf
Always current        Crystallized snapshot
↑ auto-deploys from git push
```

The web page is the living version. The PDF is a crystallized render.
The web page hosts the PDF download button.
The URL is permanent. The content updates when the source updates.

## WHY

- Manual PDF re-uploads every time content changes = the wrong layer as source
- PDF as source of truth = content locked in a binary, not version-controlled
- Web page as source = searchable, linkable, always current, accessible on any device
- PDF as render = offline use, print, formal documentation, email attachment

## HOW TO BUILD

1. Write canonical content to Bridge as .md
2. Build Astro page at `src/pages/[name].astro` — web render
3. Build PDF at `public/[name].pdf` — print render
4. Add download button on the web page pointing to `[name].pdf`
5. Commit both in one push — web + print always in sync

## APPLIES TO

- Longweird Field Guide (first implementation, 033026)
- NOW ANTHROPOLOGY issues
- Proof of Work documents
- Survival Toolkit
- Any NEST document with both "living" and "reference" use cases

## WHAT STAYS MANUAL (exceptions)

- One-off documents that won't update (historical records)
- Documents where the PDF IS the final form (signed, certified, etc.)
- Files too large for /public/ (use external link instead)

---

*"Web side VISIBLE ONLINE. Print version ACCESSIBLE OFFLINE."*
*— Dan Sullivan (DPS), Twosday 033026*

Filed: Twosday 033026 | STN2_StanS_033026_1
