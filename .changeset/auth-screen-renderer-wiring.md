---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

AuthScreenLayout의 렌더러 배선을 마칩니다.

두 렌더러의 granular export(`./auth-screen`), evidence claim과 실행 가능한 default 사례,
Metro fixture, package boundary 목록, 그리고 새 진입점의 명시적 그래프 예산을 더했습니다.
1.3.1은 계약·렌더러 소스만 담고 이 배선이 빠져 있어 릴리스 검증에서 막혔습니다.

공개 API는 1.3.1과 같습니다 — 빠져 있던 진입점이 실제로 열립니다.
