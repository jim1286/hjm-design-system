---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Publish the renderers under the `@hjmds` npm scope. The previous `@hjm` scope is
owned by another account, so the registry rejected every publish attempt. The
release now targets `@hjmds`, which this project owns. The first registry version
uses a one-time CI credential; subsequent releases authenticate through npm
Trusted Publishing (OIDC) without a long-lived publish token.
