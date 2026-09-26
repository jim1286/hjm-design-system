---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

AlertDialog 버튼이 세로로 쌓일 때 확인을 위, 취소를 아래에 둡니다.

폰 너비(`alertDialogRecipe.actions.stackBelow` 미만)나 큰 글자에서 버튼이 세로로 쌓이면 1.5.0까지는 소스
순서대로 취소가 위에 그려졌습니다. 플랫폼 경고창 관례와 반대라 소비 제품이 거꾸로라고 보고했습니다
(2026-09-27). 이제 `alertDialogRecipe.actions`에 `stackedOrder: "confirm-first"`와 `stackedGap`(`spacing.xs`)이
있고, 쌓인 상태에서는 확인이 먼저·간격은 좁게 그려집니다. 가로 배치는 그대로 [취소][확인]입니다.

- React Native: 쌓이면 확인 버튼을 먼저 렌더해 화면·스크린리더·포커스 순서가 같습니다. 취소 버튼 바탕은
  `surfaceAlt` 대신 `bg`입니다 — 브랜드가 `surfaceAlt`를 칠하면 취소가 색 판처럼 보여 확인과 경쟁했습니다.
- Web: 600px 미만에서 `column-reverse`로 쌓습니다. DOM은 [취소][확인]을 유지해 첫 포커스(취소)와 가로 배치가
  그대로이고, 쌓인 상태에서 Tab은 화면상 위로 이동합니다.

소비자 migration은 없습니다. 제품이 취소 순서·간격을 직접 덮어 둔 스타일이 있다면 지워도 됩니다.
