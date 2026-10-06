# Radio

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts`(`selectionControlRecipe`). 별도 계약 문서는 없다
- 스토리북: `배포/컴포넌트/입력/라디오 버튼`

## 언제 쓰나

라디오 한 개를 제품이 직접 배치해야 할 때만 쓴다. 예: 선택지 사이에 다른 콘텐츠가 끼어 있어
한 묶음 목록으로 그릴 수 없는 경우. 선택 상태는 제품이 들고 `checked`로 내려 준다.
선택지가 한 곳에 모여 있으면 거의 항상 [RadioGroup](radio-group.md)이 맞다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 모여 있는 2개 이상 선택지 중 하나(그룹 상태·키보드 이동 포함) | [RadioGroup](radio-group.md) |
| 2~4개의 짧은 보기 전환(어떤 목록을 볼지) | [SegmentedControl](segmented-control.md) |
| 선택지가 많거나 화면 공간이 좁음 | [Select](select.md) |
| 켜고 끄기 | [Switch](switch.md), [Checkbox](checkbox.md) |
| 여러 개를 동시에 고름 | [CheckboxGroup](checkbox-group.md), [ToggleGroup](toggle-group.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Radio` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

## 최소 사용 예

```tsx
// Web
// 같은 묶음은 name을 같게 둔다
import { Radio } from "@hjmds/react/selection";

<Radio
  name="delivery"
  value="pickup"
  label={t("order.delivery.pickup")}
  checked={method === "pickup"}
  onCheckedChange={() => setMethod("pickup")}
/>
```

```tsx
// Native
import { Radio } from "@hjmds/react-native/inputs";

<Radio
  label={t("order.delivery.pickup")}
  checked={method === "pickup"}
  onCheckedChange={() => setMethod("pickup")}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | Web `ReactNode` · Native `string` | 필수 | 현지화 |
| `presentation` | `plain` · `card` · `grouped` | `card` | — |
| `size` | `small` · `medium` | `medium` | — |
| `checked` · `defaultChecked` | `boolean` | `false` | Web은 제어하면 `onCheckedChange` 필수 |
| `onCheckedChange` | `(checked: true) => void` | — | 라디오는 스스로 해제되지 않아 항상 `true`로만 불린다. 해제는 제품이 다른 항목을 선택해 `checked`를 내려서 한다 |
| `onChange`(Web) | `(event: ChangeEvent<HTMLInputElement>) => void` | — | 원시 input 이벤트 |
| `renderLeading` | Web `(appearance: { selected, color: "currentColor", size }) => ReactNode` · Native `(props: { checked, selected, disabled, readOnly, color, size }) => ReactNode` | — | 앞 제품 아이콘 |
| `renderIndicator`(Native) | `(props) => ReactNode`(위 Native 모양) | 기본 dot | `indicator="none"`이면 숨긴다 |
| `description`, `readOnly`, `disabled` | — | `readOnly` `false` | 두 renderer에 있다 |
| `layoutStyle` | 배치 전용 style 객체 | — | 행 배치. Web `style`은 안쪽 input에 붙는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 행 최소 높이 `medium` 56 · `small` 44. 표시 원 `medium` 24 · `small` 20. `plain`은 Native hitSlop `medium` 10 · `small` 12로 터치 영역을 넓힌다 | `selectionControlRecipe.sizes`, `control.selectionIndicator` |
| 간격 | 원과 글자 사이 `medium` `spacing.sm` 12 · `small` `spacing.xs` 8. `card`·`grouped` 안쪽 여백 `medium` 세로 `spacing.sm` 12·가로 `spacing.md` 16, `small` 세로 `spacing.xs` 8·가로 `spacing.sm` 12. `card` 모서리 `radius.md` 12, 테두리 1. `plain`은 여백·테두리 없음. 글자와 설명 사이 `spacing.xxs` 4 | `selectionControlRecipe.sizes`·`presentations`, `.hjm-choice`, `.hjm-choice__copy` |
| 순서·정렬 | 표시 원이 시작 쪽(LTR 왼쪽), 글자가 그 뒤, 설명은 글자 아래. RTL은 좌우가 바뀐다. 여러 개는 단독으로 늘어놓지 말고 [RadioGroup](radio-group.md)에 넣는다 | `.hjm-choice`, Native `inputs.tsx` |
| 고정·스크롤 | 고정되지 않는다. 폼·본문 스크롤 안에 둔다 | — |
| 좁은 폭·큰 글자 | Native는 부모 폭을 채운다(`alignSelf: "stretch"`). Web 단독 Radio는 내용 폭(`inline-flex`)이고 RadioGroup 세로 목록 안에서만 꽉 찬다. 글자가 커지면 행 높이가 늘어난다(최소 높이만 고정) | Native `inputs.tsx`, `.hjm-choice` |

## 꼭 지킬 것

- `label`은 i18n 문구로 넣는다. Native는 `string`만 받는다.
- 묶음의 접근성 이름(fieldset/radiogroup)은 Radio가 만들지 않는다. 단독 Radio 여러 개로 묶음을
  흉내 내지 말고 RadioGroup을 쓴다.
- 선택 표시는 indicator(dot)가 맡는다. 색만으로 선택을 알리도록 바꾸지 않는다.
- 배치는 `layoutStyle`로 한다. Native의 `style`·`controlStyle`·`labelStyle` 등 slot style은 deprecated(개발 모드 경고,
  다음 major 제거)다. 색·글자·radius·높이를 덮지 않는다([소비 정책 §3.1](../../consumer-policy.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `label`·`description` 타입 | `ReactNode` | `string` |
| 묶음 연결 | `name`(HTML input 속성) | 없음, 제품이 상태로 묶음 |
| `required`·`invalid`와 낭독 문구(`requiredLabel`·`invalidLabel`·`readOnlyLabel`) | `required`만 HTML 속성 | 있음 |
| indicator 숨김·교체 | 없음 | `indicator="none"`, `renderIndicator` |
| 앞 아이콘 | `renderLeading` | `leading`, `renderLeading` |
| 이벤트 | `onCheckedChange`, 원시 `onChange` | `onCheckedChange` |
| 배치 | `layoutStyle`(루트 `<label>`), `style`은 안쪽 input | `layoutStyle`(행) |
