# ColorPicker — Web sRGB 색상 입력

2026-09-30: 사용자가 남은 세 후보의 개발을 명시적으로 요청하여 기존 수요 대기 결정을 대체했다.
React Native와 Flutter 구현은 포함하지 않는다. 계약은 HEX sRGB를 저장값으로 선택했다.
HSV/RGB 입력기를 동시에 만드는 대신 브라우저 색상 선택기와 HEX 입력을 연결해 값 표현을 하나로 유지한다.

`@hjmds/react/color-picker`의 `ColorPicker`는 controlled `value`와 `onValueChange`를 받는다.
`label`과 `labels.color`, `labels.hex`, `labels.opacity`, `labels.invalid`는 제품에서 번역하여 전달한다.
`alpha`가 false면 `#rrggbb`, true면 `#rrggbbaa`를 내보낸다. 3·4자리 축약 HEX도 입력할 수 있다. alpha가 켜진 상태에서 3·6자리 HEX를 입력하면 색만 바꾸고 현재 투명도를 유지한다(네이티브 색상 입력과 같다).
alpha를 끈 상태에서 불투명하지 않은 값을 전달하면 투명도를 조용히 버리지 않고 거부한다.

- HEX는 Enter/blur에 확정한다. 잘못된 입력은 오류를 보여주고 외부 값은 유지한다.
  Escape는 마지막 controlled 값으로 복구하며 Enter가 상위 폼을 제출하지 않게 한다.
- 브라우저 색상 선택기는 RGB를 선택하고 기존 alpha를 보존한다. 정확한 선택기 모양은 OS 소유다.
- 불투명도 range는 0–100%이며 키보드 화살표/Home/End를 지원한다. 8비트 alpha로 반올림한다.
- `presets`는 HEX 배열이며 색상값을 읽을 수 있는 버튼이다. 중복값은 정규화 후 제거한다.
- `disabled`는 fieldset을 통해 모든 입력과 팔레트를 비활성화한다.
- 제어부는 HJM canvas·border·focus 토큰을 사용한다. 견본의 사용자 색상은 콘텐츠 데이터다.
  선택색을 제품의 본문/배경으로 사용할 때의 대비는 제품이 확인한다.

```tsx
<ColorPicker label={t('color.title')} labels={{
  color: t('color.choose'), hex: t('color.hex'), opacity: t('color.opacity'), invalid: t('color.invalid'),
}} value={color} onValueChange={setColor} alpha presets={['#b94627ff', '#338844ff']} />
```

계약: [color-picker.ts](../src/color-picker.ts). UI: [renderer](../../react/src/color-picker.tsx).
사용 예제: [Web additions](../../../showcase/web/src/patterns/WebAdditions.stories.tsx).
검증: [계약 회귀](../test/web-additions.test.ts), [브라우저 동작](../../react/test/web-additions.browser.test.tsx),
[환경 행렬](../../react/test/scenario-matrix.browser.test.tsx). 브라우저/OS 색상 팝업 자체의 내부 UI는 HJM 검증 대상이 아니다.
