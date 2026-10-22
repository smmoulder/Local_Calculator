# Continue here: Local Model Calculator

Last wrap-up: October 21, 2026 (Pacific).

## Current state

GitHub `main` is the development baseline. Tonight's completed work replaces the old AI-letter app icon with the mint calculator artwork in the Windows executable, packaged window resource, and APPX tiles. No calculator behavior changed.

The user reports submitting version **1.0.1.0** to Microsoft Store product **9NGJC64ZM2BP**. Approval/public availability of this revision has not been independently checked. Do not submit it again just to resume development. The previous approved 1.0.0.0 archive remains untouched.

- Runtime source used for the new package: `5ff89145f5f88896c416eea69f685bf2ed071fa4`.
- Package archive and verification-record commit: `ebeced5bb8225ee43daf9841a94f226af2a5cc6b`.
- [Download the exact 1.0.1.0 APPX, checksum and original build provenance](https://github.com/smmoulder/Local_Calculator/releases/tag/store-9NGJC64ZM2BP-1.0.1.0).
- [Build/setup instructions](docs/BUILD-WINDOWS.md).
- [Submission record and subsequent status](docs/submissions/9NGJC64ZM2BP/1.0.1.0/README.md).

The APPX is 164019259 bytes. SHA-256: `4e71da95d1a6b65016f889ce0c861b661733abea68bdb0a5e2287ef7797d612f`. GitHub's release asset size and digest were checked against this record during wrap-up.

## Validation and open items

All existing tests passed tonight, including live Hugging Face metadata checks, calculator/import tests, and desktop external-link tests. The Store package passed archive-integrity, manifest identity/version, tile-image and window-icon-resource checks; its embedded runtime entry point and version matched source.

Native app launch verification is still incomplete on this computer: initial launch reported an Electron cache access error and subsequent isolated-profile launch exited without a persistent window. A Windows ZIP and APPX were successfully built, but no fresh Windows App Certification Kit result or new Store approval is claimed. Dependency setup reports eight moderate audit findings; dependency upgrades were outside this icon-only task.

## Resume on either computer

1. Open or clone `https://github.com/smmoulder/Local_Calculator.git`. Inspect `git status` and preserve local work before updating from `origin/main`. Do not overwrite another computer's changes.
2. Read this file, `README.md`, `docs/BUILD-WINDOWS.md`, the applicable submission record and any AGENTS.md instructions. Use main for current development; the Store release tags are historical build snapshots.
3. Run `npm ci` and `npm test` as needed. For future Store builds use the version-specific output folder and documented SDK workaround. No rebuild is needed merely to retrieve the archived upload.
4. There is no unfinished feature request. Next session: ask Stuart what he wants to work on; optionally confirm the 1.0.1.0 Store approval when asked. Keep the native-launch issue visible if further desktop verification is needed.

## End-of-session handoff

Push finished source and documentation to GitHub before declaring work complete. Archive release packages with checksums and their source commit in GitHub Releases, not only a local folder. Update this note with current status, limitations and the next action. Do not auto-commit unrelated/unfinished changes. The 11 PM Pacific reminder is configured separately in the Codex app, not in this repository; cross-computer continuation depends on GitHub, not chat availability.
