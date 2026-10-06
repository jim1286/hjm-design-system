# OtpField

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [OtpField](../../otp-field.md), `src/otp-field.ts`(`otpFieldRecipe`)
- 스토리북: `배포/컴포넌트/입력/인증번호 입력`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `OtpField` | 기본 | `@hjmds/react`, `/forms`, `/otp-field` | `@hjmds/react-native`, `/inputs`, `/otp-field` |

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
  {...(codeError ? { error: t("verify.code.invalid") } : {})}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `length` | 2 이상의 정수 | 필수 | 값은 숫자만 남기고 `length`로 자른다(붙여넣은 하이픈·공백 허용) |
| `value` · `defaultValue` | 숫자 문자열 | 비제어 `""` | 숫자가 아니거나 `length`보다 긴 제어값은 던진다 |
| `onValueChange` | `(value: string) => void` | — | 정리된 숫자 문자열 |
| `onComplete` | `(value: string) => void` | — | 값이 `length`에 **도달하는 순간** 한 번 호출된다. 처음부터 꽉 찬 값으로 마운트하면 호출되지 않는다 |
| `size` | `medium` · `large` | `medium` | |
| `presentation` | `boxes` · `underline` | `boxes` | |
| `busy` | `boolean` | `false` | 서버 확인 중. 입력은 포커스를 유지한 채 읽기 전용이 된다 |
| `description` · `error` | Web `ReactNode` · Native `string` | — | Native는 `undefined`를 받지 않아 조건부 spread로 넘긴다(위 예) |
| `layoutStyle` | 배치 전용 style 객체 | — | 필드 전체(라벨·칸) 배치. Native는 1.13부터 숨은 TextInput이 아니라 바깥 frame에 붙는다. Web `style`은 안쪽 input에 붙는다 |

자동 채움은 고정이다: Web `autoComplete="one-time-code"`·`inputMode="numeric"`, Native `textContentType="oneTimeCode"`·`keyboardType="number-pad"`.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 칸 `medium` 44(`control.minTouchTarget`) · `large` 52(`control.buttonHeight.large`). 전체 폭 최대 칸 × `length` + 간격 × (`length` − 1)(6자리 `medium` 304), 부모가 좁으면 칸이 줄어든다 | `otpFieldRecipe.sizes`, `.hjm-otp-field__control`, Native `maxWidth` |
| 간격 | 칸 사이 `medium` 8(`spacing.xs`) · `large` 12(`spacing.sm`). 라벨·칸·설명·오류 사이 `spacing.xs` 8 | `otpFieldRecipe`, `formSupportContract.gap` |
| 순서·정렬 | 안내 문구 아래, 다시 보내기·확인 행동 위. 칸 묶음은 시작 쪽, 가운데 정렬은 부모가 한다. RTL에서도 숫자는 왼쪽→오른쪽(`direction: ltr`) | `.hjm-otp-field__control`, Native `direction: "ltr"` |
| 고정·스크롤 | 본문 흐름 안. `onComplete`로 자동 확인하면 확인 버튼을 생략할 수 있다. 확인 버튼을 두면 단독 화면 폼은 [BottomCTA](bottom-cta.md), Card 안 구성은 [인증번호 확인과 다시 입력](../compositions/stea-otp-verify.md)처럼 필드 아래 본문에 둔다 | — |
| 좁은 폭·큰 글자 | Native 칸 높이 = max(칸 크기, 줄 높이 × 글자 배율 + 위아래 `spacing.xs`) | `react-native/src/inputs.tsx`(`OtpField`) |

## 꼭 지킬 것

- 칸마다 별도 input을 만들거나 OtpField를 칸별로 쪼개 쓰지 않는다. 접근성 이름·값이 하나여야 한다([계약](../../otp-field.md)).
- `onComplete`에서 확인 요청을 보내고 `busy`로 잠근다. 실패하면 `error`에 지역화 문구를 넣고 값 초기화 여부는 제품이 정한다.
- 숫자가 아닌 `value`, `length`보다 긴 `value`를 제어값으로 넣으면 던진다.
- 배치는 `layoutStyle`(Web은 `className`도)로만 한다. 칸 색·테두리는 recipe 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이름 | `label` | `label` 또는 `accessibilityLabel`만 |
| 칸 스타일 통로 | 없음 | `slotStyle`, `slotTextStyle`은 deprecated(개발 모드 경고, 다음 major 제거). 외형은 `size`·`presentation` |
| busy 표현 | read-only + `aria-busy` | `editable={false}` + `accessibilityState.busy` |
