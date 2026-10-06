# Checkbox 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `selectionControlRecipe`(`src/component-recipes.ts`), behavior `checkbox`

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Checkbox` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

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

- `presentation`: `card`(기본) · `plain` · `grouped`. `size`: `medium`(기본) · `small`.
- `checked`를 주면 제어, 없으면 `defaultChecked`(기본 `false`)로 비제어다.
- 부분 선택: Web은 `indeterminate`, Native는 `checked="mixed"`. Native에서 `mixed`를 누르면 `true`가 된다.
- `onCheckedChange`는 두 renderer 모두 `boolean`만 받는다.
- `readOnly`는 값을 바꾸지 않고 포커스·읽기는 유지한다.

## 꼭 지킬 것

- `label`(필수)과 `description`은 i18n 키로 넣는다. Native는 둘 다 `string`만 받는다.
- 선택 아이콘을 바꾸려면 `renderLeading`(Native는 `renderIndicator`도)을 쓴다. 색·테두리를 직접 칠하지 않는다.
- `layoutStyle`은 없다. Native의 `style`·`controlStyle`·`labelStyle` 같은 슬롯 스타일은 배치에만 쓰고
  색·radius·글꼴을 덮지 않는다([소비 정책 §3](../consumer-policy.md)).

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

- Web은 `className`이 바깥 `label`에, 나머지 HTML 속성(`style`, `name`, `onFocus` 등)은 숨은
  `input`에 붙는다. 배치용 `style`을 넘기면 보이는 행이 아니라 input에 적용된다.
