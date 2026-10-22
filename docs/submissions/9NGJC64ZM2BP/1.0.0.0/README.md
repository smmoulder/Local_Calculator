# Microsoft Store Submission 1: Local Model Calculator

- Product: `9NGJC64ZM2BP`
- Partner Center submission: `1152921505702187975`
- Version: `1.0.0.0`; x64; Windows Desktop minimum `10.0.19041.0`
- Identity: `SMMOULDERPRODUCTIONS.LocalModelCalculator`
- Publisher: `CN=FB6B7576-2633-4EE7-9626-01886E83B443`
- Original unsigned upload: `Local-Model-Calculator-1.0.0-x64.appx`
- Exact length: `163899043` bytes
- SHA-256: `e10b8a6a42849dfcab915ab451903e634ef607ee37249579c46f48fb0452b811`
- Release tag: `store-9NGJC64ZM2BP-1.0.0.0`
- Recovered source commit: [`58eac6cc7403bf90ca9b5e603004c63d6a957f4e`](https://github.com/smmoulder/Local_Calculator/commit/58eac6cc7403bf90ca9b5e603004c63d6a957f4e)
- Original historical producer commit: unavailable; the original working tree was uncommitted. The recovered commit records the verified source after the build.

## Provenance and limitations

The original package was built on this Windows PC during October 20, 2026 work, from uncommitted desktop additions over Git base `a1158f07caee613425b709f1fabc0e45d6089adb`. **There was no committed historical producer of that exact working tree.** The recovered-source commit is recorded in `provenance.json` after archival; it is a verified recovery, not a claim that a later commit existed when the binary was built.

On October 21, 2026, the signed-in Partner Center overview showed **In Microsoft Store** and its read-only Submission 1 Packages page showed this filename, version, architecture, minimum Windows version and a rounded size of **156.3 MB**. No update was started. The portal exposed neither a server-side upload checksum nor an original-package download; therefore the evidence does not assert a server-side cryptographic match. The original upload copies in this chat's outputs, the original build's release folder, and the user's Downloads all have the exact SHA-256 above.

The APPX archive was checked for ZIP integrity. Its manifest is saved here unchanged. Its actual embedded `app/resources/app.asar` matches the locally extracted submission archive. All 14 embedded runtime code/icon files match the recovered working source byte-for-byte; their hashes and the ASAR hash are in `provenance.json`. The remaining embedded file is electron-builder's generated `package.json`; its six runtime metadata fields match the development package metadata, while build/scripts/development-dependency fields are stripped by packaging.

## Comparison with GitHub main before recovery

Remote main was `e572309a803e303eb03cf192294505bdcfb1da81`: browser sources based on `a1158f0`, plus the later published `PRIVACY.md`. It lacked the Electron entry point, external-link guard, coffee-button script, package metadata and lockfile, build generator, package icons and Store identity/build configuration.

The submitted interface differs from the browser-only main by its Content Security Policy/local font fallback, header coffee button and support script inclusion. Those are existing submission changes, not behavior introduced by archival. Some other runtime files have Windows CRLF line endings instead of GitHub's LF; their normalized text is unchanged. `.gitattributes` preserves the mixed bytes of the recovered Windows runtime without rewriting its logic.

The working directory was backed up before reconciliation and left unchanged. Recovery starts from the current GitHub main and preserves its published privacy policy. Post-package build/preparation changes and later listing icons are retained separately from the historical runtime. The uploaded APPX is not rebuilt or modified. New artwork does not replace the package's original AI-letter icon.

## Continue and verify

See [Windows build instructions](../../../BUILD-WINDOWS.md). Download the exact binary and listing assets from the tagged GitHub Release, then run `python scripts/verify-submission.py PATH_TO_APPX` from the archived source checkout. `SHA256SUMS.txt` and `AppxManifest.xml` in this directory describe the original upload. `provenance.json` is the machine-readable record.

This record documents an existing submission. It neither publishes another Store update nor claims a completed Windows App Certification Kit report; the earlier SDK layout attempt exited with code 1001. Native launch, calculation/theme controls, metadata loading and subsequent real app screenshots were observed in this chat, but those are not a substitute for formal certification results.

Recovery validation: the six existing test scripts and desktop coffee/external-link tests passed on October 21, 2026. The archive verification script passed against the unchanged original APPX and the recovered runtime files. A new package was not built.
