# ColorPicker 사용 지침

적용: `@hjmds/react` 1.12.1(Web 전용) · 검토일: 2026-10-06 ·
계약: [ColorPicker — Web sRGB 색상 입력](../color-picker.md), recipe `colorPickerRecipe`(`src/color-picker.ts`)

## 언제 쓰나

사용자가 콘텐츠 색(라벨 색, 태그 색, 테마 편집기의 사용자 값 등)을 sRGB HEX로 고르는 폼 입력에 쓴다.
브라우저 색상 선택기, HEX 텍스트 입력, 선택적 불투명도 슬라이더, 프리셋 견본을 한 fieldset으로 묶는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 정해진 몇 가지 색 중 하나만 고름 | [RadioGroup](radio-group.md), [SegmentedControl](segmented-control.md) |
| 숫자 하나를 범위에서 고름 | [Slider](slider.md) |
| 제품 브랜드·테마 색을 화면마다 바꾸기 | 컴포넌트가 아니다. 제품 테마 토큰(`brandPalette`)으로 한다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ColorPicker` | `/color-picker` | 없음 | 기본 |
| `ColorPickerLabels`(타입) | `/color-picker` | 없음 | 문구 묶음 |

루트 barrel에는 없다. React Native 구현은 없다.

## 최소 사용 예

```tsx
// Web
import { ColorPicker } from "@hjmds/react/color-picker";

<ColorPicker
  label={t("label.color")}
  labels={{
    color: t("color.choose"), hex: t("color.hex"),
    opacity: t("color.opacity"), invalid: t("color.invalid"),
  }}
  value={color}
  onValueChange={setColor}
  presets={["#b94627", "#338844"]}
/>
```

## 축과 기본값

- controlled 전용: `value` + `onValueChange`. 내보내는 값은 소문자 `#rrggbb`, `alpha`면 `#rrggbbaa`.
- `alpha`: 기본 `false`. 켜면 0–100% 불투명도 슬라이더가 생긴다. 3·6자리 HEX를 치면 현재 불투명도를 유지한다.
- `disabled`: 기본 `false`. fieldset으로 모든 입력과 프리셋을 막는다.
- `presets`: 기본 `[]`. HEX 배열이며 정규화 후 중복을 없앤다. 선택된 견본은 `aria-pressed`.
- HEX 입력은 Enter·blur에 확정, Escape는 마지막 `value`로 되돌린다. 잘못된 입력은 `labels.invalid`를 alert로 보이고
  외부 값은 바꾸지 않는다.

## 꼭 지킬 것

- `label`과 `labels`의 네 문구는 모두 비어 있지 않아야 한다. 하나라도 비면 렌더 중 `TypeError`가 난다.
- `value`와 `presets`는 유효한 HEX여야 한다. `alpha={false}`인데 불투명하지 않은 8자리 값을 주면 투명도를 버리지 않고
  `TypeError`를 던진다. 저장된 값을 넘기기 전에 제품 어댑터에서 형식을 맞춘다.
- 고른 색을 본문·배경에 쓸 때의 대비 검사는 제품이 한다. 견본 색은 콘텐츠 데이터이며 HJM 토큰이 아니다.
- `className`·`style`·`layoutStyle` prop이 없다. 배치는 감싸는 레이아웃(`Stack`, `Field` 영역 등)이 한다.

## 함정

- 브라우저 색상 팝업은 RGB만 고른다. 팝업 모양과 동작은 OS·브라우저 소유이며 HJM 검증 대상이 아니다.
