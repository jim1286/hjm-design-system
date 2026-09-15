---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
---

웹 렌더러가 `environment.textScale`의 large-text 전환을 받게 한다.

`segmentedControlRecipe.adaptive.stackAtFontScale`은 계약이 선언한 축인데, 웹에서 그 전환을
일으키는 것은 스타일시트의 `@media (max-width: 11em)`(브라우저 기본 글꼴 크기)뿐이었다.
제품이 provider에 `textScale`을 선언하는 경로는 전환을 받지 못했다 — 같은 계약을 React
Native만 구현한 상태였다 (#20).

- `largeTextThreshold`(1.6)를 `foundations`에 이름 붙였다. `segmentedControlRecipe.adaptive
  .stackAtFontScale`과 `topBarRecipe.largeTextThreshold`가 각자 적어 두었던 같은 값이다.
  `design-system-provider`는 `isLargeTextScale(textScale)`로 그 판정을 공개한다.
- `HjmProvider`와 portal host(`overlays`·`toast`·`AnchoredPortal`)가 임계값을 넘을 때
  `data-large-text="true"`를 내보낸다. `data-text-scale`은 숫자라 속성 선택자로 `>= 1.6`을
  표현할 수 없다.
- SegmentedControl의 스택 규칙이 그 플래그도 트리거로 받는다. 기존 미디어 쿼리는 그대로
  둔다 — 브라우저 기본 글꼴은 provider가 모르는 별개의 신호다.

렌더러 번들 비용은 0이다. 같은 판정을 렌더러가 직접 하면 `./selection` 같은 granular
entry가 provider 모듈을 통째로 끌어와 gzip 기준 24% 커진다(측정치는 이슈에 있다).
`./provider` 예산만 raw 12_500 -> 12_700 · gzip 3_400 -> 3_600으로 올렸고 module 수는 3으로
그대로다.

topBar·description-list의 large-text 분기는 React Native 표면이며 이번 변경에 포함되지 않는다.
