# Field

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `fieldRecipe`(`src/base-recipes.ts`), GestureSheetInput: [Optional presentation adapters](../../optional-adapters.md)
- 스토리북: `배포/컴포넌트/입력/입력 필드`

## 언제 쓰나

라벨·도움말·오류를 가진 입력 칸에 쓴다. 한 줄 텍스트 입력은 `TextField`를 쓰고, `Field`는 HJM에 없는
제품 고유 컨트롤(예: 직접 만든 선택기)에 같은 라벨·도움말·오류 틀과 접근성 연결을 씌울 때 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 줄 입력 | [TextArea](text-area.md) |
| 비밀번호·인증 코드·숫자 | [PasswordField](password-field.md), [OtpField](otp-field.md), [NumberField](number-field.md) |
| 검색어 입력 | [SearchField](search-field.md) |
| 목록에서 고르기·날짜 | [Select](select.md), [Combobox](combobox.md), [DatePicker](date-picker.md) |
| 입력 묶음의 submit·오류 포커스 | [Form](form.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Field` | 기본 — 커스텀 컨트롤용 틀 | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` |
| `TextField` | 동반 — 한 줄 텍스트 입력 | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/inputs` |
| `GestureSheetInput` | 확장 — GestureSheet 안의 키보드 추적 입력 | 없음 | `/sheet-gesture` |

## 최소 사용 예

```tsx
// Web
import { TextField, Field } from "@hjmds/react/forms";

<TextField
  label={t("profile.nickname")}
  description={t("profile.nicknameHint")}
  error={nicknameError ? t(nicknameError) : undefined}
  required
  value={nickname}
  onValueChange={setNickname}
/>

<Field controlId="profile-color" label={t("profile.color")} error={colorError}>
  {(control) => <ProductColorPicker {...control} value={color} onChange={setColor} />}
</Field>
```

```tsx
// Native
import { TextField } from "@hjmds/react-native/inputs";
import { Field } from "@hjmds/react-native/forms";

<TextField label={t("profile.nickname")} description={t("profile.nicknameHint")} required
  value={nickname} onValueChange={setNickname} {...(nicknameError ? { error: t(nicknameError) } : {})} />

<Field label={t("profile.color")} {...(colorError ? { error: t(colorError) } : {})}>
  {(control) => <ProductColorPicker {...control} value={color} onChange={setColor} />}
</Field>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant`(`TextField`) | `surface` · `inset` | `surface` | — |
| `shape`(`TextField`) | `medium` · `large` · `full` | `medium` | — |
| `align`(`TextField`) | `start` · `center` | `start` | `center`는 닉네임·코드처럼 짧은 한 값 |
| `onValueChange`(`TextField`) | `(value: string) => void` | — | Web·Native 같은 이름·모양. Web은 DOM `onChange`(이벤트)도 함께 불린다. 공용 폼 코드는 `onValueChange`를 쓴다 |
| `children`(`Field` render-prop) | `(control: FieldControlProps) => ReactNode` 또는 `ReactNode` | — | Web `FieldControlProps`는 `{ id, required, disabled, "aria-invalid"?: true, "aria-describedby"? }`, Native는 `{ accessibilityLabel, accessibilityHint?, accessibilityState: { disabled } }`(hint는 오류 우선) |
| `busy`(Native `TextField`) | `boolean` | `false` | 편집을 막고 접근성 busy를 싣는다 |

- 상태 테두리는 recipe가 정한다: 기본 `borderControl`, 포커스 `contentBrand`, 오류 `danger`.
- 도움말은 오류가 생겨도 사라지지 않고 둘 다 보인다(Web은 `aria-describedby`로 둘 다 연결).
- 비활성(`disabled`)은 라벨과 컨트롤만 흐리고 도움말·오류는 원래 대비 그대로 둔다(`fieldRecipe.disabledScope`).
  흐림 정도는 컴포넌트 recipe에 `states.disabledOpacity`가 있으면 그 값(SearchField·PasswordField·OtpField·NumberField·Select
  0.5), 없으면 `fieldRecipe.disabledOpacity` 0.6(TextField·TextArea·Mentions·Field·NativeSelect·Combobox·DatePicker·TagsInput)이다.
  2026-10-06 전에는 틀 전체가 흐려져 잠긴 이유를 적은 도움말까지 대비가 떨어졌다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 컨트롤 최소 높이 44(`control.minTouchTarget`), 안쪽 여백 좌우 `spacing.md`(16)·위아래 `spacing.sm`(12), 테두리 1. 여러 줄 입력은 최소 80(`fieldRecipe.multilineMinHeight`)이고 `minVisibleLines`를 줘도 이 하한 아래로 내려가지 않는다(한 줄 시작은 MessageComposer 내부만). 폭은 부모를 채운다 | `base-recipes.ts` `fieldRecipe`, `styles.css` `.hjm-field__control` |
| 간격 | 라벨과 컨트롤 사이 `spacing.xs`(8). 컨트롤과 도움말·오류 사이는 Web `spacing.xs`(8), Native 내장 필드 6(`fieldRecipe.support.gap`)이다. 필드 사이 간격은 [Form](form.md) `density`가 정한다(`comfortable` `spacing.lg` 20). Form 없이 쌓을 때는 Stack `gap`으로 같은 값을 쓴다 | `styles.css` `.hjm-field`, `react-native/src/internal/field-frame.tsx` |
| 순서·정렬 | 위→아래 순서는 라벨 → 컨트롤 → 도움말 → 오류다. 필드 여러 개는 Form 안에 세로로 쌓는다 | `react-native/src/internal/field-frame.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 큰 글자에서는 컨트롤 높이가 줄 높이에 따라 커진다. 라벨·도움말은 줄바꿈하며 자르지 않는다 | `base-recipes.ts` `fieldRecipe` |

## 꼭 지킬 것

- 라벨·도움말·오류·placeholder는 i18n 키로 넣는다. 오류 문장에 도움말을 다시 쓰지 않는다.
- 라벨을 숨기면 접근성 이름을 준다. Web `TextField`는 `label` 또는 `aria-label`, Native는 `label` 또는
  `accessibilityLabel`이 없으면 `TypeError`를 던진다.
- 정렬·높이는 `align`·`variant`·`shape` 축으로 바꾼다. Native `TextField`는 `style`을 받지 않고 배치는 `layoutStyle`로만 한다.
- 커스텀 컨트롤에는 render-prop 값을 그대로 펼쳐 라벨 연결을 끊지 않는다. Web `Field`는 `controlId`가 필수다.
- 비활성인 이유는 도움말(`description`)에 적는다. 도움말·오류는 흐려지지 않으므로 제품에서 따로 흐리게 하거나 색을 바꾸지 않는다.

### GestureSheetInput (Native optional-extension)

`GestureSheet` 안에서 키보드를 따라 움직이는 입력이다. `BottomSheetTextInput`의 props를 그대로 받고
TextField와 같은 테두리·글꼴·placeholder 색을 입힌다. 라벨·도움말·오류 틀은 없으므로 접근성 이름을 직접 준다.
`/sheet-gesture`만 이 optional peer를 요구한다: `@gorhom/bottom-sheet` `5.2.14`, `react-native-reanimated`(이 파일이
직접 import), 그리고 문서 기준 Gesture Handler `2.32.0`·Worklets `0.10.1`과 `GestureHandlerRootView`·`GestureSheetProvider`
설정. 없으면 tsc는 통과하고 기기 번들에서 실패한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 콜백 | `onValueChange`(+ DOM `onChange`) | `onValueChange` |
| `TextField` 앞뒤 슬롯 | `leading`, `trailing` | 없음 |
| `TextField` 진행 중 | 없음 | `busy`(편집 막음, 접근성 busy) |
| `Field` 라벨 | `label` ReactNode + `controlId` | `label` string, `controlId` 없음 |
| 비활성 커스텀 `Field` | 틀이 라벨과 자식 컨트롤을 함께 흐린다 | 라벨만 흐린다. 컨트롤은 감싸는 View 없이 틀의 직계 자식이라 `accessibilityState.disabled`를 보고 스스로 흐린다 |
| 배치 | `layoutStyle`(틀 `.hjm-field`) · `fieldClassName`(틀) · `className`·`style`(안쪽 `<input>`) | `layoutStyle`(`Field`·`TextField` 모두). `TextField`는 `style`을 받지 않는다 |
| 나머지 props·ref | `<input>` HTML 속성(`type`·`autoComplete`·`inputMode` 등)과 ref(`HTMLInputElement`) 전달 | RN `TextInput` props(`keyboardType`·`autoCapitalize`·`textContentType`·`returnKeyType`·`onSubmitEditing` 등)와 ref(`TextInput`) 전달. `style`·`onChangeText`는 받지 않는다 |

## 함정

- Web `TextField`의 `style`은 틀이 아니라 안쪽 `<input>`에 붙는다. 필드 전체의 바깥 여백·폭은 `layoutStyle`로 준다.
- Native `TextField`·`Field`의 `error`·`description`은 `string`이라 `exactOptionalPropertyTypes`에서 `undefined`를 받지
  않는다(TS2375). 위 예처럼 조건부 spread로 넘긴다. Web은 `ReactNode`라 `undefined`를 그대로 넘겨도 된다.
- Web `Field`는 `controlId`가 필수이고, Native `Field`에는 `controlId`가 없다. 공용 코드에서 같은 props 객체를 넘기지 않는다.

### 날짜 조각 직접 입력 (실험·미게시)

알고 있는 날짜를 년·월·일로 직접 편집하려면 `DateEntry`를 사용한다.
Web `@hjmds/react/date-entry`, Native `@hjmds/react-native/date-entry`의 Field 확장이다.
원문 초안·입력 순서·오류 대상을 공유하며 입력은 기존 TextField로 렌더링한다.
[날짜 직접 입력 지침](../compositions/date-entry.md)에 배치·props·날짜 파싱 소유권이 있다.
달력에서 날짜를 고르는 경우에는 기존 DatePicker를 쓴다.
