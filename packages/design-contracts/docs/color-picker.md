# ColorPicker — sRGB 색상 입력

2026-09-30: 사용자가 남은 세 후보의 개발을 명시적으로 요청하여 기존 수요 대기 결정을 대체했다. 처음에는 Web만 포함했다.
2026-10-25: Diairy 손그림 프로필 요청으로 Native 개발 후보를 추가했고, 같은 날 사용자 요청("다른 곳 인사이트를 얻으며 개편")으로
브라우저 색 팝업(Web)·RGB 막대(Native)를 HSV 편집기로 바꿨다. 저장값은 그대로 HEX sRGB다. HSV는 편집할 때만 쓰는 좌표다.

`ColorPicker`는 controlled `value`와 `onValueChange`를 받는다. `label`과 `labels.hex`·`hue`·`saturation`·`brightness`·`opacity`·`invalid`
(프리셋이 있으면 `presets`)는 제품에서 번역하여 전달한다. `alpha`가 false면 `#rrggbb`, true면 `#rrggbbaa`를 내보낸다.
3·4자리 축약 HEX도 입력할 수 있다. alpha가 켜진 상태에서 3·6자리 HEX를 입력하면 색만 바꾸고 현재 투명도를 유지한다.
alpha를 끈 상태에서 불투명하지 않은 값을 전달하면 투명도를 조용히 버리지 않고 거부한다.

- 채도·밝기 영역: 가로가 채도, 세로가 밝기다. 누른 자리로 바로 이동하고 끄는 동안 연속으로 바뀐다. 상위 스크롤에 터치를 넘기지 않는다.
  Web은 영역 안의 두 range(채도·밝기)로 키보드·보조기술을 지원한다. Native는 adjustable 하나로 밝기 증감, 사용자 정의 행동으로 채도 증감을 준다.
- 색조 막대 0–360°, 불투명도 막대 0–100%. Web은 range, Native는 HJM Slider의 제스처·접근성 로직을 내부 색 트랙으로 재사용한다.
- 검정·회색에서 사라지는 색조·채도는 직전 값을 유지한다(`pickerHsv(value, previous)`). HEX ↔ HSV는 모든 HEX가 원래 값으로 돌아온다(계약 테스트).
- HEX는 Enter/blur(Native submit/blur)에 확정한다. 잘못된 입력은 오류를 보여주고 외부 값은 유지한다.
  Escape는 마지막 controlled 값으로 복구하며 Enter가 상위 폼을 제출하지 않게 한다.
- `presets`는 `ColorSwatchPicker`(라디오 의미의 둥근 견본)로 그린다. 중복값은 정규화 후 제거한다.
- `disabled`는 모든 입력과 견본을 비활성화한다.
- 제어부는 HJM canvas·border·focus 토큰을 사용한다. 손잡이의 흰 테두리·그림자와 투명 체크 무늬는 어떤 색 위에서도 보이게 하는 고정값이다.
  견본의 사용자 색상은 콘텐츠 데이터다. 선택색을 제품의 본문/배경으로 사용할 때의 대비는 제품이 확인한다.

```tsx
<ColorPicker label={t('color.title')} labels={{
  hex: 'HEX', hue: t('color.hue'), saturation: t('color.saturation'), brightness: t('color.brightness'),
  opacity: t('color.opacity'), invalid: t('color.invalid'), presets: t('color.presets'),
}} value={color} onValueChange={setColor} alpha presets={['#b94627ff', '#338844ff']} />
```

계약: [color-picker.ts](../src/color-picker.ts). UI: [Web](../../react/src/color-picker.tsx), [Native](../../react-native/src/color-picker.tsx).
사용 지침: [usage/components/color-picker.md](usage/components/color-picker.md).
사용 예제: [Web additions](../../../showcase/web/src/patterns/WebAdditions.stories.tsx), [Native](../../../showcase/native/src/ColorPicker.stories.tsx).
검증: [계약 회귀](../test/web-additions.test.ts), [Web 동작](../../react/test/web-additions.browser.test.tsx),
[Native 동작](../../react-native/test/color-picker.test.tsx), [환경 행렬](../../react/test/scenario-matrix.browser.test.tsx).
Native는 `react-native-svg`가 필요하며 패키지 게시·기기 검증은 별도다.
