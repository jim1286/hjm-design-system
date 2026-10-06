# Checkbox

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `selectionControlRecipe`(`src/component-recipes.ts`), behavior `checkbox`
- 스토리북: `배포/컴포넌트/입력/체크박스`

## 언제 쓰나

독립된 예/아니오 하나를 고르는 항목에 쓴다. "기억하기", 목록 전체 선택처럼 부분 선택(`mixed`)이
필요한 상위 항목도 여기에 속한다. 값은 제출이나 저장 때 반영되는 선택이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 같은 질문의 여러 선택지를 묶어 고름 | [CheckboxGroup](checkbox-group.md) |
| 하나만 고름 | [RadioGroup](radio-group.md) |
| 누르는 즉시 적용되는 설정 켜기·끄기 | [Switch](switch.md) |
| 약관·개인정보 동의(필수/선택 구분, 전체 동의) | [Agreement](agreement.md) |
| 필터 줄의 작은 선택 | [Chip](chip.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Checkbox` | 기본 | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` |

## 최소 사용 예

```tsx
// Web
import { Checkbox } from "@hjmds/react/selection";

<Checkbox
  label={t("signup.rememberMe")}
  checked={remember}
  onCheckedChange={setRemember}
/>
```

```tsx
// Native
import { Checkbox } from "@hjmds/react-native/inputs";

<Checkbox
  label={t("signup.rememberMe")}
  checked={remember}
  onCheckedChange={setRemember}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `presentation` | `card` · `plain` · `grouped` | `card` | — |
| `size` | `medium` · `small` | `medium` | — |
| `checked` · `defaultChecked` | Web `boolean` · Native `boolean \| "mixed"` | `defaultChecked` `false` | `checked`를 주면 제어, 없으면 비제어다 |
| 부분 선택 | Web `indeterminate: boolean` · Native `checked="mixed"` | Web `false` | Native에서 `mixed`를 누르면 `true`가 된다 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 두 renderer 모두 `boolean`만 넘긴다(`"mixed"`는 오지 않는다) |
| Web `onChange` | `(event: ChangeEvent<HTMLInputElement>) => void` | — | 원시 이벤트가 필요할 때만. 값은 `onCheckedChange`로 받는다 |
| `readOnly` | `boolean` | `false` | 값을 바꾸지 않고 포커스·읽기는 유지한다 |
| `renderLeading` | Web `(appearance: { selected, color: "currentColor", size }) => ReactNode` · Native `(props: { checked, selected, disabled, readOnly, color, size }) => ReactNode` | — | 라벨 앞 아이콘 |
| Native `renderIndicator` · `indicator` | `(props: { checked, selected, disabled, readOnly, color, size }) => ReactNode` · `"default" \| "none"` | `indicator` `"default"` | 체크 표시 교체·숨김 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 행(Web 바깥 `label`, Native 행) 배치 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 행 최소 높이 `medium` 56(`layout.rowHeight.singleLine`) · `small` 44(`control.minTouchTarget`). 표시 `medium` 24(`control.selectionIndicator`) · `small` 20, Native hitSlop 10 · 12 | `selectionControlRecipe.sizes`, `.hjm-choice` |
| 간격 | `card`·`grouped` 안쪽 `medium` 위아래 `spacing.sm` 12 · 좌우 `spacing.md` 16, `small` `spacing.xs` 8 · `spacing.sm` 12. 표시↔라벨 `medium` `spacing.sm` 12 · `small` `spacing.xs` 8. `plain`은 안쪽 여백 0. 라벨↔설명 `spacing.xxs` 4 | `selectionControlRecipe.sizes`·`presentations`, `.hjm-choice*` |
| 순서·정렬 | 시작 쪽부터 [체크 표시] → [leading] → [라벨 / 설명]. 표시는 첫 줄에 맞춰 위쪽 정렬. 여러 개면 [CheckboxGroup](checkbox-group.md)으로 묶는다. `card`는 `canvas` 배경·테두리 1px·`radius.md` 12 | `selectionControlRecipe.slots`, `.hjm-choice__indicator` |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 라벨·설명이 줄바꿈되고 행 높이가 늘어난다. 표시 크기는 그대로다 | `.hjm-choice__copy` |

## 꼭 지킬 것

- `label`(필수)과 `description`은 i18n 키로 넣는다. Native는 둘 다 `string`만 받는다.
- 선택 아이콘을 바꾸려면 `renderLeading`(Native는 `renderIndicator`도)을 쓴다. 색·테두리를 직접 칠하지 않는다.
- 배치는 `layoutStyle`로 한다. Native의 `style`·`controlStyle`·`indicatorStyle`·`leadingStyle`·`contentStyle`·
  `labelStyle`·`descriptionStyle`은 deprecated — `layoutStyle` 또는 `presentation`·`size`·`renderIndicator`를 쓴다
  (개발 모드 1회 경고, 다음 major 제거. [이관 문서](../../migration-native-legacy-removal.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 부분 선택 | `indeterminate` | `checked`/`defaultChecked`에 `"mixed"` |
| `label`·`description` 타입 | `ReactNode` | `string` |
| 필수·오류 표시 | 없음(HTML `required`는 input에 전달) | `required`·`invalid` + `requiredLabel`·`invalidLabel`(접근성 hint로 합침) |
| 읽기 전용 안내 | `aria-readonly` | `readOnlyLabel`을 hint로 읽음 |
| 고정 leading 노드 | 없음 | `leading` |
| 원시 change 이벤트 | `onChange` | 없음 |

## 함정

- Web은 `className`·`layoutStyle`이 바깥 `label`에, 나머지 HTML 속성(`style`, `name`, `onFocus` 등)은 숨은
  `input`에 붙는다. 배치용 `style`을 넘기면 보이는 행이 아니라 input에 적용되므로 `layoutStyle`을 쓴다.
