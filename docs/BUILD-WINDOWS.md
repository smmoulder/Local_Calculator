# Windows build and continuation

The Store product is **Local Model Calculator**, ID `9NGJC64ZM2BP`. Its interface and executable retain the **Local AI Workbench** name. This repository now includes the desktop sources recovered from Submission 1. No Store update is part of this archival change.

## Continue on another computer

Clone `https://github.com/smmoulder/Local_Calculator.git` and use `main` for continued development. Use the release tag `store-9NGJC64ZM2BP-1.0.0.0` for the archived baseline. Read [the submission record](submissions/9NGJC64ZM2BP/1.0.0.0/README.md) before changing version, identity, package assets, or runtime files.

Install Git, Python 3.11+ for artifact verification, and Node.js 24 LTS with npm on Windows x64. The original environment used Node.js `24.19.0`; the lockfile pins Electron `44.9.3` and electron-builder `26.15.3`. An internet connection is needed to install dependencies and download build tools. End users do not need Node.js or Python.

```powershell
git clone https://github.com/smmoulder/Local_Calculator.git
cd Local_Calculator
git checkout store-9NGJC64ZM2BP-1.0.0.0
npm ci
npm test
npm start
```

The live metadata test needs Hugging Face connectivity. The other existing tests use synthetic data. Runtime dependencies and notices are included by Electron packaging; retain the bundled Electron/Chromium license files.

## Verify the exact archived upload

Download `Local-Model-Calculator-1.0.0-x64.appx` from the tagged GitHub Release. This is the original upload, not a rebuild or a Microsoft-signed Store download.

```powershell
python scripts/verify-submission.py C:\path\to\Local-Model-Calculator-1.0.0-x64.appx
```

This checks its complete SHA-256, file length, ZIP integrity, manifest, embedded ASAR hash, and each recovered runtime source/icon file. Run against the archived tag to verify historical source; future behavior changes on main are expected to fail that comparison.

## Build from source

Exact original package artwork is checked in under `build/`. **Do not regenerate it to verify Submission 1.** Current development builds use the mint calculator artwork in `desktop/assets/`, generated from the preserved 300px listing icon with `npm run icons`. The window icon, executable resource, and future APPX tiles all use these current assets. This does not alter the archived 1.0.0.0 upload. `build-assets.ps1` is the original generator, retained for reference; running it can vary raster output with Windows font/rendering versions. The mint calculator/chip icons under `assets/store-listing/` remain unchanged. They were not the historical submission icons; they now also supply artwork for future development builds.

```powershell
npm ci
npm test
npm run build:win
npm run build:store
```

`build:win` produces a portable ZIP in `release/`. `build:store` produces an unsigned APPX for the reserved identity in `desktop/store-identity.json`. No command uploads to Partner Center. To package an already-built runtime directory:

```powershell
$env:STORE_PREPACKAGED = (Resolve-Path release/win-unpacked).Path
npm run build:store
```

The original Store package was made with `STORE_PREPACKAGED` pointing at the verified `release/win-unpacked` directory. The original build used an extracted Electron distribution when sandbox cache renames failed, and set `ELECTRON_BUILDER_WINDOWS_KITS_PATH` to the x64 tools from `windows-kits-bundle-10_0_26100_0.zip` (electron-builder toolset `win-codesign@1.1.0`, SHA-256 `284f18a2fde66e6ecfbefc3065926c9bfdf641761a9e6cd2bd26e18d1e328bf7`). Normal Windows environments can let electron-builder download its tools. Its `--config.electronDist=C:\path\to\electron-dist` option can select an already extracted Electron distribution for `--win --dir --x64` builds.

Source/runtime equivalence is verified, but byte-for-byte reproducibility of a fresh APPX is not promised: build metadata, packaging tools, timestamps, fonts and archive compression can differ. Use the archived binary and checksum when the original submission is needed. Do not sign, replace, or upload the archive as part of verification. A future Store update is a separate task requiring a new version and validation.

## Preserved newer work

The public `PRIVACY.md` committed after desktop construction remains authoritative. The earlier `PRIVACY.txt` and `STORE-SUBMISSION.txt` are historical drafts/preparation notes; their pending checklists are not current Store status. Store screenshots and later logo artwork are provided as Release assets. None of these listing/privacy changes alter the recovered app behavior.
