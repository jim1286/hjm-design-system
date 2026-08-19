# Utility — 새 컴포넌트를 만들지 않는다

## 이름이 이미 경고였다

"유틸"은 컴포넌트가 아니다. 먼저 antd의 실제 `Util` 페이지가 무엇인지 확인했다(공식
문서 확인, 아래 출처). antd `Util`은 UI 컴포넌트가 아니라 **`theme.useToken()` 훅으로
현재 테마의 design token 값을 자신의 커스텀 컴포넌트에서 읽는 방법**을 설명하는 문서
페이지다.

## 판정: 이 패키지 자체가 이미 그 역할이다

`useToken()`이 제공하는 것 — 현재 테마의 색·간격·타이포 값을 코드에서 직접 읽는 것 —
은 이 저장소에서는 **훅이 아니라 이미 export된 상수**로 존재한다: `spacing`, `radius`,
`typography`, `glyph`, `stroke`, `semanticColors`, `THEMES`(`foundations.ts`,
`semantic-colors.ts`, `colors.ts`). antd는 이 값들을 Context에 넣고 훅으로 꺼내야 하지만
(런타임 테마 스위칭이 Context 기반이므로), 이 패키지는 애초에 런타임 의존성이 없어 그
값들을 정적 module import로 바로 쓴다 — **"컴포넌트에서 토큰 값을 읽는 방법"이라는 antd
`Util` 페이지의 문제 자체가 이 패키지 구조에서는 발생하지 않는다.**

즉 `Utility`라는 이름 아래 모일 실체가 없다:

- 새 값 타입 없음 — 토큰은 이미 `foundations.ts`/`semantic-colors.ts`/`colors.ts`에 있다.
- 새 접근 패턴 없음 — `import { spacing } from "@hjm/design-system"`가 이미 `useToken()`이
  하는 일과 같은 결과를 낸다(테마별 실제 색 resolve는 `resolveColorReference`가 이미
  한다).
- 새 접근성·상태 축 없음 — 컴포넌트가 아니므로 애초에 대상이 아니다.

`ContextPanel`(`docs/context-panel.md`)과 같은 자리다 — crosswalk에 실체가 없는 이름이
목록에 먼저 올라간 경우.

## 결론

`src/utility.ts`, `test/utility.test.ts`는 만들지 않는다.

## 판정이 뒤집힐 조건

antd `Util` 페이지가 이후 실제 유틸리티 함수(단순 토큰 읽기를 넘어서는, 예를 들어 이
패키지가 아직 갖지 않은 계산 헬퍼)를 추가하고 그중 플랫폼 중립적으로 유용한 것이
확인되면, 그건 `Utility`라는 이름의 새 컴포넌트가 아니라 **그 헬퍼가 속한 기존 모듈**
(예: 숫자 관련이면 `number-field.ts`의 `clampToRange`류)에 함수로 추가하는 쪽을 권한다.

## 배선 명세 제안 (리드 적용)

`ContextPanel`과 같은 방식을 권한다.

**(a) 권고: catalog에서 제거.** `src/catalog.ts`의 `{ name: "Utility", category:
"utility", platform: "web", status: "planned", aliases: ["Util"] }`(`src/catalog.ts:127`)
행을 지운다. `component-definitions.ts`의 예약 ID는 무해하니 남겨도 된다.

**(b) 대안: catalog row 유지 + 이 문서만 링크.**

이 저작자 판단은 (a)다 — 대응할 실체가 없는 `planned` 행이 "곧 만들 컴포넌트"로
오인되는 비용이 검색 편의보다 크다고 봤다(`ContextPanel`과 같은 이유).
