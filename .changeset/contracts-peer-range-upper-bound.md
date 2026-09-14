---
"@hjmds/react": patch
"@hjmds/react-native": patch
---

두 renderer의 `@hjmds/design-contracts` peer 범위를 0.10 train으로 옮긴다
(`>=0.9.0 <0.10.0` → `>=0.10.0 <0.11.0`).

범위는 여전히 정확히 한 minor train이다. train을 올리는 release에서는 버전 PR보다 먼저
범위를 옮겨야 한다. 순서를 뒤집으면 contracts의 minor bump가 아직 이전 train을 가리키는
peer 범위를 벗어나고, changesets가 그 변경을 dependents의 major로 승격시켜 `fixed` 그룹
전체가 1.0.0으로 올라간다. 실제로 그렇게 나왔다. 판단 근거는
docs/RELEASE_GOVERNANCE.md의 "Contracts peer 범위"에 있다.
