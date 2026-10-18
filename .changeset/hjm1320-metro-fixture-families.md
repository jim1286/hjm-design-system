---
"@hjmds/design-contracts": patch
---

Native Metro bundle check runs again: the fixture imports every peer-free public family (16 families were missing, so the check
stopped before bundling since 1.31). The real graph then showed that `/media-transport`, `/toggle-feedback`,
`/authoring-tools` (BezierEditor curve) and `/data-workflows` (composes BarChart) need the optional `react-native-svg`
peer like `/chart`; they now sit in the check's optional-peer boundary, and the authoring-tools and data-workflows
contract docs state the peer.
