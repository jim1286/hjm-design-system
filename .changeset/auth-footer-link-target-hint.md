---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

`AuthScreenFooter` links take an optional `accessibilityHint` (Native `accessibilityHint`, Web visually hidden `aria-describedby` text; blank strings throw) and, on Web, `target`/`rel` for `href` links (`rel` defaults to `noreferrer noopener` for `_blank`, as on Link). The visible label stays the link name.
