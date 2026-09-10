---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
---

단독(standalone) 링크가 두 축 모두 최소 터치 타깃을 지킨다.

`linkRecipe.variants.standalone`이 높이만 `control.minTouchTarget`으로 잡고 있어서 "닫기",
"Write"처럼 짧은 라벨은 폭이 36pt까지 좁아졌다. 소비 앱의 390pt 화면에서 실제로 36×44
링크가 확인됐다. 계약에 `minWidth`를 추가하고 웹 렌더러의 `.hjm-link[data-variant="standalone"]`에
`min-inline-size`와 `justify-content: center`를 적용한다. 문장 안(inline) 링크는 글줄을
따라가야 하므로 최소 크기를 강제하지 않는다.

마이그레이션: 없음. 짧은 라벨의 단독 링크가 좌우로 최소 44pt까지 넓어진다.
