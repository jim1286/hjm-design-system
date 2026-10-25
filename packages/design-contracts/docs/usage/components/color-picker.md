# ColorPicker

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-25
- 근거: [ColorPicker — sRGB 색상 입력](../../color-picker.md), recipe `colorPickerRecipe`(`src/color-picker.ts`)
- 스토리북: `배포/컴포넌트/입력/색상 선택기`

## 언제 쓰나

사용자가 콘텐츠 색(라벨 색, 태그 색, 손그림 펜 색, 테마 편집기의 사용자 값 등)을 sRGB HEX로 고를 때 쓴다.
채도·밝기 영역, 색조 막대, 선택적 불투명도 막대, HEX 입력, 프리셋 견본을 한 묶음으로 제공한다. Web과 Native의 모양과 동작이 같다.

자주 쓰는 색 몇 개를 한 줄로 빠르게 고르는 곳(그리기 도구 막대 등)에는 동반 부품 `ColorSwatchPicker`를 두고,
"더 많은 색" 행동으로 `ColorPicker`를 [Sheet](sheet.md)에 연다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 정해진 몇 가지 색 중 하나만 고름 | `ColorSwatchPicker`(이 문서). 색이 아닌 선택지는 [RadioGroup](radio-group.md), [SegmentedControl](segmented-control.md) |
| 숫자 하나를 범위에서 고름 | [Slider](slider.md) |
| 제품 브랜드·테마 색을 화면마다 바꾸기 | 컴포넌트가 아니다. 제품 테마 토큰(`brandPalette`)으로 한다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ColorPicker` | 기본 | `/color-picker` | `/color-picker` |
| `ColorSwatchPicker` | 동반(견본 하나 고르기) | `/color-picker` | `/color-picker` |
| `ColorPickerLabels`(타입) | 보조(문구 묶음) | `/color-picker` | `/color-picker` |

루트 barrel에는 없다. Native는 `react-native-svg`(선택 peer)가 필요하다. Chart와 같다.
Native 구현과 2026-10-25 개편은 개발 후보이며 패키지 게시·기기 검증은 별도다.

## 최소 사용 예

```tsx
// Web
import { ColorPicker } from "@hjmds/react/color-picker";

<ColorPicker
  label={t("label.color")}
  labels={{
    hex: "HEX", hue: t("color.hue"), saturation: t("color.saturation"), brightness: t("color.brightness"),
    opacity: t("color.opacity"), invalid: t("color.invalid"), presets: t("color.presets"),
  }}
  value={color}
  onValueChange={setColor}
  presets={["#b94627", "#338844"]}
/>
```

```tsx
// Native: 도구 막대의 빠른 색 줄 + 시트 안의 전체 선택기
import { ColorPicker, ColorSwatchPicker } from "@hjmds/react-native/color-picker";

<ColorSwatchPicker label={t("pen.color")} labelVisibility="hidden" layout="scroll"
  colors={quickColors} value={quickColors.includes(color) ? color : null} onValueChange={setColor} />
<Sheet open={open} onOpenChange={setOpen} title={t("color.more")} closeLabel={t("action.close")}>
  <ColorPicker label={t("pen.color")} labels={labels} value={color} onValueChange={setColor} />
</Sheet>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` + `onValueChange` | 소문자 `#rrggbb`(`alpha`면 `#rrggbbaa`) + `(value: string) => void` | 필수(controlled 전용) | 정규화한 값이 바뀔 때만 부른다. 영역·막대를 끄는 동안 연속으로 부른다 |
| `label` | `string` | 필수 | 묶음 이름(Web legend) |
| `labels` | `{ hex; hue; saturation; brightness; opacity; invalid; presets? }` | 필수 | 영역의 두 축·색조·불투명도 막대의 접근성 이름, HEX 입력, 오류, 프리셋 묶음 이름. `presets`는 `presets`가 있을 때 필수 |
| `alpha` | `boolean` | `false` | 켜면 0–100% 불투명도 막대와 % 표시가 생긴다. 3·6자리 HEX를 치면 현재 불투명도를 유지한다 |
| `disabled` | `boolean` | `false` | 영역·막대·HEX·프리셋을 모두 막는다 |
| `presets` | `readonly string[]`(HEX) | `[]` | 정규화 후 중복을 없앤다. `ColorSwatchPicker`로 그린다 |
| `getPresetLabel` | `(color) => string` | HEX 코드 | 견본의 접근성 이름. 제품이 지역화한 색 이름이 있으면 넘긴다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 묶음 배치 |
| HEX 입력 | — | — | Enter·blur(Native는 submit·blur)에 확정, Web Escape는 마지막 `value`로 되돌린다. 잘못된 입력은 `labels.invalid`를 보이고 외부 값은 바꾸지 않는다 |

`ColorSwatchPicker`

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 묶음 이름 |
| `colors` | `readonly string[]`(HEX) | 필수 | 정규화 후 중복 제거 |
| `value` + `onValueChange` | HEX 또는 `null` | 필수 | 현재 색이 견본에 없으면 `null`(아무 견본도 선택 표시 안 함). 이미 선택된 견본을 누르면 부르지 않는다 |
| `layout` | `"wrap"` \| `"scroll"` | `"wrap"` | `scroll`은 가로 한 줄 스크롤(도구 막대) |
| `labelVisibility` | `"visible"` \| `"hidden"` | `"visible"` | `hidden`이면 보조기술에만 묶음 이름을 준다 |
| `alpha`, `disabled`, `getColorLabel`, `layoutStyle` | — | — | `ColorPicker`와 같은 뜻 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채운다. 영역 4:3(`area.aspectRatio`), 영역 손잡이 24(흰 테두리 3), 막대 높이 24·손잡이 28, 미리보기 원 44, 견본 누름 영역 44·원 32·선택 고리 2(간격 2) | `colorPickerRecipe` |
| 간격 | 묶음 안쪽 16, 부품 사이 `spacing.md`, 견본 사이 2(Web 0.25rem·Native `spacing.xxs`) | `.hjm-color-picker*`, Native `color-picker.tsx` |
| 순서·정렬 | 위→아래 [label] → [채도·밝기 영역] → [색조 막대] → [불투명도 막대(`alpha`)] → [미리보기 원][HEX 입력][불투명도 %] → [오류] → [프리셋 견본] | `react/src/color-picker.tsx`, `react-native/src/color-picker.tsx` |
| 방향 | 영역과 막대는 RTL에서도 왼쪽→오른쪽이다(색 공간 좌표이지 읽기 순서가 아니다). HEX 입력도 LTR로 고정한다 | 같은 파일 주석 |
| 고정·스크롤 | 영역은 터치를 잡으면 상위 스크롤에 넘기지 않는다(Web `touch-action: none`, Native 응답자 종료 거절). 막대는 Slider처럼 가로 의도가 확인될 때까지 세로 스크롤에 양보한다 | 같은 파일, [Slider](slider.md) |
| 좁은 폭·큰 글자 | 영역·막대는 폭에 맞춰 줄고, HEX 입력이 남은 폭을 채운다. `wrap` 견본은 줄바꿈된다 | — |

## 꼭 지킬 것

- `label`과 `labels`의 문구는 모두 비어 있지 않아야 한다(`presets`가 있으면 `labels.presets`도). 하나라도 비면 렌더 중 `TypeError`가 난다.
- `value`와 `presets`는 유효한 HEX여야 한다. `alpha={false}`인데 불투명하지 않은 8자리 값을 주면 투명도를 버리지 않고
  `TypeError`를 던진다. 저장된 값을 넘기기 전에 제품 어댑터에서 형식을 맞춘다.
- 고른 색을 본문·배경에 쓸 때의 대비 검사는 제품이 한다. 견본 색은 콘텐츠 데이터이며 HJM 토큰이 아니다.
- 견본 줄을 제품이 버튼으로 다시 만들지 않는다. `ColorSwatchPicker`를 쓴다.
- 배치는 `layoutStyle`로 한다. `className`·`style` prop은 없다.

## 함정

- 검정·회색은 색조가 없고 검정은 채도도 없다. 컴포넌트는 직전 색조·채도를 기억해 손잡이가 빨강(0°)으로 튀지 않게 한다.
  외부에서 다른 색을 넣으면 그 색에서 다시 계산한다.
- `onValueChange`는 끄는 동안 여러 번 불린다. 저장·네트워크 전송은 제품이 시트를 닫을 때 등으로 모은다.

## 개편 근거 (2026-10-25)

Diairy 손그림 프로필에서 색 선택이 부족하다는 요청으로 Native를 추가했고, 같은 날 "다른 곳 사례를 참고해 개편" 요청으로 HSV 편집기로 바꿨다.
첫 Native 후보의 RGB 0–255 막대 세 개는 "조금 더 연한 분홍" 같은 생각을 세 막대 퍼즐로 만들었고, Web의 브라우저 색 팝업은 OS마다 모양이 달랐다.
Figma·Procreate Classic·iOS 색 선택기(Spectrum)처럼 채도·밝기 영역과 색조 막대를 기본으로 하고, React Aria `ColorSwatchPicker`처럼 견본 고르기를 별도 부품으로 분리했다.
Procreate처럼 자주 쓰는 색을 바깥 한 줄에 두는 구성은 견본 부품으로 제품이 짠다(최근 색 저장은 제품 데이터다).
