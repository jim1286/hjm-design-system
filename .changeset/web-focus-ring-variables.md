---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Web에서 키보드 포커스 표시가 그려지지 않던 결함을 고칩니다.

1.4.0까지 `styles.css`는 `--hjm-color-focus`·`--hjm-focus-width`·`--hjm-focus-offset`을 30곳에서 대체값 없이
읽었지만 어떤 코드도 이 변수를 설정하지 않았습니다. 정의되지 않은 변수를 참조한 선언은 계산 시점에 무효가
되므로 Chip·Sheet·Popover·Calendar·DatePicker·DataTable·Tree·CommandPalette·TagsInput 등 21개 family의
포커스 외곽선이 없었습니다. 이제 Provider가 공용 `focusIndicatorContract`에서 세 변수를 내보내고, 기본 포커스
규칙도 같은 변수를 씁니다. 같은 원인으로 색이 비던 BottomNavigation 누름 배경(recipe `pressedBackground`),
Statistic 성공·경고 추세, Steps 완료, UploadItem 성공 색과 `--hjm-stroke-*`도 정의된 값으로 연결합니다.

`test/css-variables.ssr.test.tsx`가 대체값 없는 모든 `var(--hjm-*)` 참조가 renderer가 실제로 설정하는 이름인지
검사하고, `test/focus-ring.browser.test.tsx`가 실제 브라우저에서 외곽선이 그려지는지 확인합니다.
