---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Web Dialog·Sheet·Toast·Button·Field의 표현 값을 recipe에서 만든 CSS 변수로 읽습니다. **Web 화면이 바뀝니다.**

손으로 쓴 `styles.css`가 recipe 값을 베껴 적으면서 Native와 어긋나 있었습니다. 이번 minor에서 Web을 recipe(=Native)에 맞춥니다.

- Dialog·Sheet 배경: `surface`(밝은 테마 `#f2f4f6`) → recipe `canvas`(`#ffffff`). 그림자: `0 16px 48px 28%` → `shadow.floating`.
  Sheet 모서리: `lg` → recipe `xl`. 아래 Sheet 최대 크기: `min(88dvh, 48rem)`·폭 48rem → recipe `maxHeightRatio 0.9`(90dvh)·`web.maxWidth 640px`.
  핸들 색: `border-control` → recipe `content.secondary`. detent 높이는 `sheetRecipe.sizes`에서 옵니다.
- Toast 테두리: `border` → recipe `border.strong`. 그림자: `0 8px 24px 18%` → `shadow.floating`. 닫힘 전환: 160ms `ease` → `motionPreset.exit`(120ms, exit 곡선, 모션 줄이기 시 0ms).
- Button 누름: `scale(0.98)` → Native와 같은 `opacity.pressed`(0.86). 비활성 불투명도와 Field 테두리·포커스 링·비활성 값은 이미 같았고, 이제 recipe 변수를 읽습니다.
- 새 CSS 변수: `--hjm-shadow-*`, `--hjm-dialog-*`, `--hjm-sheet-*`, `--hjm-toast-*`, `--hjm-button-*-opacity`, `--hjm-field-*`.
  그림자 토큰은 react-native-web과 같은 방식으로 변환합니다(radius를 blur로 그대로 씀).

z-index는 바꾸지 않았습니다. Web의 쌓임 순서(toast > tooltip > modal > menu > select)는 layer 토큰과 같습니다.
숫자는 제품 페이지의 z-index와 함께 쓰이므로 이번 변경에서 옮기지 않습니다.

`test/recipe-alignment.browser.test.tsx`가 밝은·어두운 테마에서 실제 계산 스타일을 recipe 값과 비교합니다.
제품 CSS로 Sheet·Dialog 내부를 덮어쓴 앱(다에리 Web 등)은 새 값과 겹치지 않는지 확인이 필요합니다.
