# PasswordField 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [PasswordField](../password-field.md), recipe `passwordFieldRecipe`(`src/password-field.ts`)

## 언제 쓰나

비밀번호를 입력받고, 필요할 때만 값을 눈으로 확인하게 할 때 쓴다. 로그인, 가입,
비밀번호 변경, 이메일 계정 연결 화면의 비밀번호 칸이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 문자로 받은 숫자 인증번호 | [OtpField](otp-field.md) |
| 가릴 필요가 없는 일반 텍스트 | [Field](field.md)의 TextField |
| 소셜 로그인 | [AuthProviderButton](auth-provider-button.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `PasswordField` | `@hjmds/react`, `/forms`, `/password-field` | `@hjmds/react-native`, `/inputs`, `/password-field` | 기본 |

## 최소 사용 예

```tsx
// Web
import { PasswordField } from "@hjmds/react/password-field";

<PasswordField
  label={t("auth.password")}
  autofillHint="current"
  revealLabel={t("auth.password.show")}
  concealLabel={t("auth.password.hide")}
  value={password}
  onValueChange={setPassword}
  error={passwordError}
/>
```

```tsx
// Native
import { PasswordField } from "@hjmds/react-native/password-field";

<PasswordField
  label={t("auth.password")}
  autofillHint="current"
  revealLabel={t("auth.password.show")}
  concealLabel={t("auth.password.hide")}
  value={password}
  onValueChange={setPassword}
  error={passwordError}
/>
```

## 축과 기본값

- `autofillHint`: `current`(로그인) · `new`(가입·변경), 필수. Web은 `current-password`/`new-password`,
  Native는 iOS `textContentType` `password`/`newPassword`로 번역된다.
- 가림 상태: `revealed`+`onRevealedChange`(제어) 또는 `defaultRevealed`(기본 `false`). 값과 독립된 축이다.
- `size`: `medium`(기본) · `large`.
- 토글 아이콘을 바꾸려면 `renderToggleIcon`을 쓴다. 기본 아이콘은 HJM이 그린다.

## 꼭 지킬 것

- `revealLabel`(가려져 있을 때 = 누르면 보임)과 `concealLabel`(보일 때 = 누르면 숨김)은 **행동** 문구로 지역화한다. “숨겨짐” 같은 상태 문구를 넣지 않는다.
- `autofillHint`는 화면 목적에 맞게 제품이 정한다. 로그인 화면에 `new`를 주면 OS·브라우저 자동 채움이 깨진다.
- `type`·`autoComplete`(Web), `secureTextEntry`·`textContentType`(Native)은 Props에서 제외돼 있다. 직접 넘기지 않는다.
- 비밀번호 규칙 문구는 `description`, 검증 실패는 `error`에 지역화해 넣는다. 규칙 자체는 제품 소유다.
- 배치는 Native `layoutStyle`, Web `className`/`fieldClassName`으로만 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이름 | `label` | `label` 또는 `accessibilityLabel`만 |
| 토글 | `aria-pressed` 버튼, 토글 후 선택 영역 복원 | `button` + `accessibilityState.selected` |
| 이벤트 | `onValueChange`와 DOM `onChange` 둘 다 | `onValueChange` |
