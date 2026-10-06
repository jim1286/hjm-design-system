# OtpField 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [OtpField](../otp-field.md), recipe `otpFieldRecipe`(`src/otp-field.ts`)

## 언제 쓰나

문자·메일로 받은 **숫자 인증번호**를 칸 모양으로 입력받을 때 쓴다. 화면에는 칸이 여러 개 보이지만
실제 입력은 하나라서 붙여넣기·지우기·SMS 자동 채움이 플랫폼 기본 동작으로 처리된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 비밀번호·PIN처럼 가려야 하는 값 | [PasswordField](password-field.md) |
| 영문이 섞인 코드(쿠폰·초대 코드) | [Field](field.md)의 TextField (`align="center"`) |
| 범위가 있는 수량 | [NumberField](number-field.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `OtpField` | `@hjmds/react`, `/forms`, `/otp-field` | `@hjmds/react-native`, `/inputs`, `/otp-field` | 기본 |

## 최소 사용 예

```tsx
// Web
import { OtpField } from "@hjmds/react/otp-field";

<OtpField
  label={t("verify.code")}
  length={6}
  value={code}
  onValueChange={setCode}
  onComplete={submitCode}
  busy={verifying}
  error={codeError ? t("verify.code.invalid") : undefined}
/>
```

```tsx
// Native
import { OtpField } from "@hjmds/react-native/otp-field";

<OtpField
  label={t("verify.code")}
  length={6}
  value={code}
  onValueChange={setCode}
  onComplete={submitCode}
  busy={verifying}
  error={codeError ? t("verify.code.invalid") : undefined}
/>
```

## 축과 기본값

- `length`: 2 이상의 정수, 필수. 값은 숫자만 남기고 `length`로 자른다(붙여넣은 하이픈·공백 허용).
- `size`: `medium`(기본) · `large`. `presentation`: `boxes`(기본) · `underline`.
- `busy`: 서버 확인 중. 입력은 포커스를 유지한 채 읽기 전용이 된다.
- `onComplete`는 값이 `length`에 **도달하는 순간** 한 번 호출된다. 처음부터 꽉 찬 값으로 마운트하면 호출되지 않는다.
- 자동 채움은 고정이다: Web `autoComplete="one-time-code"`·`inputMode="numeric"`, Native `textContentType="oneTimeCode"`·`keyboardType="number-pad"`.

## 꼭 지킬 것

- 칸마다 별도 input을 만들거나 OtpField를 칸별로 쪼개 쓰지 않는다. 접근성 이름·값이 하나여야 한다([계약](../otp-field.md)).
- `onComplete`에서 확인 요청을 보내고 `busy`로 잠근다. 실패하면 `error`에 지역화 문구를 넣고 값 초기화 여부는 제품이 정한다.
- 숫자가 아닌 `value`, `length`보다 긴 `value`를 제어값으로 넣으면 던진다.
- 배치는 Native `layoutStyle`, Web `className`으로만 한다. 칸 색·테두리는 recipe 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이름 | `label` | `label` 또는 `accessibilityLabel`만 |
| 칸 스타일 통로 | 없음 | `slotStyle`, `slotTextStyle`(색·크기 override 금지) |
| busy 표현 | read-only + `aria-busy` | `editable={false}` + `accessibilityState.busy` |
