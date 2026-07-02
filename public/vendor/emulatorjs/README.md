# Vendored EmulatorJS runtime (Nest Console game mode on /drw)

Self-hosted copy of the EmulatorJS browser emulator runtime so rspdan.com/drw
has no runtime CDN dependency for its game-console mode.

- Source: https://cdn.emulatorjs.org/stable/data/ (EmulatorJS stable channel)
- Version: 4.2.3 (per data/version.json), pulled 2026-07-02
- Upstream project: https://github.com/EmulatorJS/EmulatorJS (GPL-3.0, see LICENSE)
- Cores vendored: mgba (GBA, plus -legacy non-WebGL2 variant) and gambatte
  (GB/GBC, plus -legacy). The core .data bundles carry their upstream
  emulator-core licenses (mGBA is MPL-2.0, Gambatte is GPL-2.0).
- compression/ holds the extractors the runtime uses to unpack the 7z-packed
  core bundles and zipped ROMs.

NO ROM and NO save file is vendored here. Cartridges load from the operator's
own disk at runtime and never leave the browser.

To update: re-pull the same file list from the stable CDN path and bump the
version note above.
