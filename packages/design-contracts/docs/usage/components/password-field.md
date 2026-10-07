# PasswordField

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [PasswordField](../../password-field.md), `src/password-field.ts`(`passwordFieldRecipe`)
- 스토리북: `배포/컴포넌트/입력/비밀번호 입력`

## 언제 쓰나

비밀번호를 입력받고, 필요할 때만 값을 눈으로 확인하게 할 때 쓴다. 로그인, 가입,
비밀번호 변경, 이메일 계정 연결 화면의 비밀번호 칸이 여기에 속한다.

소셜 전용 제품의 이메일·비밀번호 칸은 스토어 심사자 폼뿐이다(루트 `docs/LOGIN_SCREEN_STANDARD.md` LS-07). 서버 env와
`review=1`이 모두 맞을 때만 [AuthScreenLayout](auth-screen-layout.md) `main` 카드 안, 개발 버튼 다음에 제목
(`Text variant="label"`)과 한 줄 설명을 붙여 그린다. 제출 버튼은 제공자 버튼보다 낮은 `tone="secondary"`, `size="medium"`이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 문자로 받은 숫자 인증번호 | [OtpField](otp-field.md) |
| 가릴 필요가 없는 일반 텍스트 | [Field](field.md)의 TextField |
| 소셜 로그인 | [AuthProviderButton](auth-provider-button.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `PasswordField` | 기본 | `@hjmds/react`, `/forms`, `/password-field` | `@hjmds/react-native`, `/inputs`, `/password-field` |

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
// Native — 로그인 폼: return 키로 아이디 → 비밀번호 → 제출(LS-10)
import { useRef } from "react";
import type { TextInput } from "react-native";
import { TextField } from "@hjmds/react-native/inputs";
import { PasswordField } from "@hjmds/react-native/password-field";

const passwordRef = useRef<TextInput>(null);

<>
<TextField
  label={t("auth.email")}
  keyboardType="email-address"
  autoCapitalize="none"
  textContentType="username"
  returnKeyType="next"
  onSubmitEditing={() => passwordRef.current?.focus()}
  value={email}
  onValueChange={setEmail}
/>
<PasswordField
  ref={passwordRef}
  label={t("auth.password")}
  autofillHint="current"
  revealLabel={t("auth.password.show")}
  concealLabel={t("auth.password.hide")}
  returnKeyType="go"
  onSubmitEditing={() => { if (canSubmit) void submit(); }}
  value={password}
  onValueChange={setPassword}
  {...(passwordError ? { error: passwordError } : {})}
/>
</>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` · `defaultValue` | 문자열 | 비제어 `""` | |
| `onValueChange` | `(value: string) => void` | — | Web은 DOM `onChange`도 함께 받는다 |
| `autofillHint` | `current`(로그인) · `new`(가입·변경) | 필수 | Web은 `current-password`/`new-password`, Native는 iOS `textContentType` `password`/`newPassword`로 번역된다 |
| `revealLabel` · `concealLabel` | 문자열 | 필수 | 토글의 접근성 이름. 각각 "누르면 보임"·"누르면 숨김" 행동 문구 |
| `revealed` · `defaultRevealed` | `boolean` | `false` | 가림 상태(제어·비제어). 값과 독립된 축이다 |
| `onRevealedChange` | `(revealed: boolean) => void` | — | 토글을 누를 때 |
| `size` | `medium` · `large` | `medium` | |
| `renderToggleIcon` | `(props: { name: "visibility" \| "visibilityOff"; color; size: number; revealed: boolean; disabled: boolean }) => ReactNode` | HJM 기본 아이콘 | 토글 아이콘을 바꿀 때 쓴다. `color`는 Web `"currentColor"`, Native 테마 색 문자열 |
| `description` · `error` | Web `ReactNode` · Native `string` | — | 규칙 안내·검증 실패 문구 |
| `layoutStyle` | 배치 전용 style 객체 | — | 필드 전체 배치. Web `style`은 안쪽 input에 붙는다 |
| `ref` | Web `HTMLInputElement` · Native `TextInput` | — | return 키로 다음 칸 focus를 옮길 때 쓴다 |

## 배치

Native는 제품 프로필의 `tokens.fontFamily.ui`를 실제 텍스트/입력 host에 연결한다. 기본 UI stack은 OS 서체를 유지하고, 제품이 지정한 첫 named font의 등록·글리프 확인은 제품이 맡는다.

Native `large`는 프로필의 `typography.bodyLarge`를 읽고 그 줄 높이로 프레임도 늘린다. recipe의 최소 높이가 큰 글자 프레임을 덮지 않으며 controlled textScale은 한 번만 적용한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 높이 `medium` 44(`fieldFrameContract.minHeight`) · `large` 52(`control.buttonHeight.large`). 토글 44×44 원형(`control.minTouchTarget`) | `passwordFieldRecipe.sizes`, `.hjm-password-field__toggle` |
| 간격 | 라벨·입력·설명·오류 사이 `spacing.xs` 8. 입력 좌우 `medium` 16(`spacing.md`) · `large` 20(`spacing.lg`) | `formSupportContract.gap`, `passwordFieldRecipe.sizes` |
| 순서·정렬 | 아이디(이메일) Field 바로 아래. 가입·변경은 새 비밀번호 → 확인. 토글은 입력 칸 **끝**(RTL에서는 시작) 안쪽 | `.hjm-password-field__toggle` |
| 고정·스크롤 | 폼 흐름 안. 제출은 이 칸 아래, 같은 폼의 행동이다(Web [Form](form.md) `actions`, Native는 Form 내장 버튼 또는 `Stack` + `Button`). 로그인·심사자 폼은 AuthScreenLayout `main` 카드 안에 두고 하단에 고정하지 않는다. 그 안에서는 바깥 `ScrollView`·`Container`·`KeyboardAvoidingView`로 다시 감싸지 않는다(키보드 inset·드래그 내리기·탭 유지는 레이아웃이 가진다, LS-10) | LS-07, LS-10, `authScreenRecipe` |
| 좁은 폭·큰 글자 | 폭은 같은 폼의 다른 Field와 맞춘다 | — |

## 꼭 지킬 것

- `revealLabel`(가려져 있을 때 = 누르면 보임)과 `concealLabel`(보일 때 = 누르면 숨김)은 **행동** 문구로 지역화한다. “숨겨짐” 같은 상태 문구를 넣지 않는다.
- `autofillHint`는 화면 목적에 맞게 제품이 정한다. 로그인 화면에 `new`를 주면 OS·브라우저 자동 채움이 깨진다.
- `type`·`autoComplete`(Web), `secureTextEntry`·`textContentType`(Native)은 Props에서 제외돼 있다. 직접 넘기지 않는다.
- 비밀번호 규칙 문구는 `description`, 검증 실패는 `error`에 지역화해 넣는다. 규칙 자체는 제품 소유다.
- 배치는 `layoutStyle`(Web은 `className`/`fieldClassName`도)로만 한다.
- 토글에 눌림·선택 상태를 덧붙이지 않는다. 이름이 이미 다음 행동("비밀번호 보이기/숨기기")을 말하므로 상태를 더하면
  "비밀번호 숨기기, 선택됨"처럼 두 답이 읽힌다(계약 [PasswordField](../../password-field.md) 2026-10-06 정정).
- Native 로그인 폼은 return 키를 잇는다(LS-10). 아이디 칸은 `returnKeyType="next"` + `onSubmitEditing`에서 PasswordField
  `ref.focus()`, PasswordField는 `returnKeyType="go"` + `onSubmitEditing`에서 제출하되 버튼의 disabled 조건을 그대로 따른다.
  Native `Form`은 밖에서 제출을 부를 수 없으므로 return 제출이 필요한 폼은 Form 대신 `Stack` + `Button`(`loading`)으로 짠다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이름 | `label` | `label` 또는 `accessibilityLabel`만 |
| 토글 | 다음 행동을 이름으로 가진 `<button>`(상태 속성 `aria-pressed` 없음), 토글 후 선택 영역 복원 | `button` + 다음 행동 `accessibilityLabel`, `accessibilityState`는 `disabled`만(`selected` 없음) |
| 이벤트 | `onValueChange`와 DOM `onChange` 둘 다 | `onValueChange` |
| ref·나머지 props | `HTMLInputElement`, `<input>` HTML 속성(`type`·`autoComplete` 제외) | `TextInput`, RN `TextInput` props(`returnKeyType`·`onSubmitEditing` 등, `secureTextEntry`·`textContentType`·`style` 제외) |

## 함정

- Native `error`·`description`은 `string`이라 `exactOptionalPropertyTypes`에서 `undefined`를 받지 않는다(Web은 `ReactNode`라 통과).
  값이 없을 수 있으면 위 예처럼 조건부 spread로 넘긴다.
