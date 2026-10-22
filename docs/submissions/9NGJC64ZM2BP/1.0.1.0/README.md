# Prepared Store update: 1.0.1.0

Product: **Local Model Calculator**, `9NGJC64ZM2BP`.

This is a prepared unsigned x64 APPX for manual submission, not a submitted, approved, or certified Store update. The existing 1.0.0.0 release remains untouched.

Change: replace the AI-letter icon with the preserved mint calculator artwork in the executable, window icon resource, and APPX tiles. No calculator logic or interface behavior changed. Package version is 1.0.1.0 (npm 1.0.1).

Built runtime source commit: `5ff89145f5f88896c416eea69f685bf2ed071fa4`. See provenance.json and SHA256SUMS.txt for package identity, size and checksum. The release tag also includes this verification record and build instructions.

All existing tests passed. The APPX passed ZIP integrity checks; its manifest identity, publisher and version were checked, all four tile PNGs and resources/icon.ico matched the current assets byte-for-byte, and its embedded app.asar entry point/version matched the source. The executable icon was embedded by electron-builder. Native launch on this computer remains unverified after the earlier cache-access/exit problem. Windows App Certification Kit and Store certification have not been run for this update.

Download **Local-Model-Calculator-1.0.1-x64.appx** from the GitHub Release tagged `store-9NGJC64ZM2BP-1.0.1.0`. Upload this APPX to the existing product's new submission in Partner Center when ready. Do not upload or replace the archived 1.0.0.0 artifact.
