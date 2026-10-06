# Field 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `fieldRecipe`(`src/base-recipes.ts`), GestureSheetInput: [Optional presentation adapters](../optional-adapters.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Field` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` | 커스텀 컨트롤용 틀 |
| `TextField` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/inputs` | 한 줄 텍스트 입력 |
| `GestureSheetInput` | 없음 | `/sheet-gesture` | GestureSheet 안의 키보드 추적 입력 |

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
  value={nickname} onValueChange={setNickname} layoutStyle={{ marginTop: 12 }} />

<Field label={t("profile.color")} error={colorError}>
  {(control) => <ProductColorPicker {...control} value={color} onChange={setColor} />}
</Field>
```

## 축과 기본값

- `TextField` `variant`: `surface`(기본) · `inset`. `shape`: `medium`(기본) · `large` · `full`.
  `align`: `start`(기본) · `center`(닉네임·코드처럼 짧은 한 값).
- 상태 테두리는 recipe가 정한다: 기본 `borderControl`, 포커스 `contentBrand`, 오류 `danger`.
- 도움말은 오류가 생겨도 사라지지 않고 둘 다 보인다(Web은 `aria-describedby`로 둘 다 연결).
- `Field`의 render-prop은 컨트롤에 줄 접근성 값을 넘긴다. Web은 `id`·`required`·`disabled`·`aria-invalid`·
  `aria-describedby`, Native는 `accessibilityLabel`·`accessibilityHint`(오류 우선)·`accessibilityState`.

## 꼭 지킬 것

- 라벨·도움말·오류·placeholder는 i18n 키로 넣는다. 오류 문장에 도움말을 다시 쓰지 않는다.
- 라벨을 숨기면 접근성 이름을 준다. Web `TextField`는 `label` 또는 `aria-label`, Native는 `label` 또는
  `accessibilityLabel`이 없으면 `TypeError`를 던진다.
- 정렬·높이는 `align`·`variant`·`shape` 축으로 바꾼다. Native `TextField`는 `style`을 받지 않고 배치는 `layoutStyle`로만 한다.
- 커스텀 컨트롤에는 render-prop 값을 그대로 펼쳐 라벨 연결을 끊지 않는다. Web `Field`는 `controlId`가 필수다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 콜백 | `onValueChange`(+ DOM `onChange`) | `onValueChange` |
| `TextField` 앞뒤 슬롯 | `leading`, `trailing` | 없음 |
| `TextField` 진행 중 | 없음 | `busy`(편집 막음, 접근성 busy) |
| `Field` 라벨 | `label` ReactNode + `controlId` | `label` string, `controlId` 없음 |
| 배치 | `className`(input) · `fieldClassName`(틀) | `layoutStyle`(`Field`·`TextField` 모두) |

## GestureSheetInput (Native optional-extension)

`GestureSheet` 안에서 키보드를 따라 움직이는 입력이다. `BottomSheetTextInput`의 props를 그대로 받고
TextField와 같은 테두리·글꼴·placeholder 색을 입힌다. 라벨·도움말·오류 틀은 없으므로 접근성 이름을 직접 준다.
`/sheet-gesture`만 이 optional peer를 요구한다: `@gorhom/bottom-sheet` `5.2.14`, `react-native-reanimated`(이 파일이
직접 import), 그리고 문서 기준 Gesture Handler `2.32.0`·Worklets `0.10.1`과 `GestureHandlerRootView`·`GestureSheetProvider`
설정. 없으면 tsc는 통과하고 기기 번들에서 실패한다.
