---
"@hjmds/design-contracts": patch
---

AuthScreenLayout 계약 모듈 한 개만큼 import 그래프 예산을 올립니다.

여섯 진입점(`./recipes/all`·`./behaviors`·`./catalog`·`./showcase`·`./evidence`·루트)의 그래프가
각각 모듈 1개, raw 약 2.8kB, gzip 약 1kB 늘었습니다. 증가분의 정체는 `auth-screen.ts` 하나이며
기존 helper만 재사용하고 외부 의존성을 들이지 않습니다. 공개 API는 바뀌지 않습니다.
