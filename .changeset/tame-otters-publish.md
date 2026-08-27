---
"@hjm/design-contracts": patch
"@hjm/react": patch
"@hjm/react-native": patch
---

Publish to the npm registry after the tag and consumer evidence gate pass, so consumers install a semver range instead of vendoring a tarball or pinning a Git ref and package path. Also fix the yajalal consumer release gate's stale `develop` default branch and a Chromium background-tab timer throttling flake in the Tooltip browser test.
