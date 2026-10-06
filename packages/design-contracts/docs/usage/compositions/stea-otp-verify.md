# 인증번호 확인과 다시 입력

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [OtpField](../../otp-field.md), `showcase/web/src/patterns/stea-composition-previews.tsx`(`OtpVerifyRecover`), `showcase/native/src/stea-composition-previews.tsx`(`OtpVerifyRecover`, `Frame`), `showcase/shared/stea-compositions.ts`(`otpReducer`·`otpErrorMessage`), `src/otp-field.ts`, `src/result.ts`, `src/card.ts`, `src/container.ts`
- 스토리북: `배포/구성/입력과 작성/인증번호 확인과 다시 입력`

## 언제 쓰나

문자·메일로 받은 숫자 인증번호를 입력하고 서버 확인을 기다린 뒤, 틀리면 남은 횟수를 보여 주고 다시 받게 하는 흐름에 쓴다.
성공 화면은 서버가 번호를 확인한 뒤에만 나타나고, 입력 중에는 슬롯 위치가 움직이지 않는다.
비밀번호·한 줄 텍스트 입력은 [PasswordField](../components/password-field.md)·[Field](../components/field.md)를 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Card` | 제목("인증번호 확인")·설명을 가진 틀 | [Card](../components/card.md) |
| `ContentTransition` | 입력 폼 ↔ 성공 결과 전환(기본 `fade`). 입력 중엔 같은 subtree를 유지 | [ContentTransition](../components/content-transition.md) |
| `OtpField` | `length` 6 숫자 칸. 확인 중 `busy`, 잠김 `disabled`, 틀림·요청 실패 `error` | [OtpField](../components/otp-field.md) |
| 재전송 안내 문구 | 다시 받은 뒤 "새 인증번호를 보냈어요…", 재전송 실패 문구(muted, live) | [Text](../components/text.md) |
| `Button` primary | 확인. 확인 중 `loading` | [Button](../components/button.md) |
| `Button` ghost | 인증번호 다시 받기. 대기 시간 동안 `disabled`, 라벨이 남은 초를 보여 줌. 재전송 요청 중 `loading` | [Button](../components/button.md) |
| `Result` `status="success"` | 성공 결과 + 행동 하나. Web은 `icon`을 비우면 CSS가 ✓를 그린다. Native는 기본 glyph가 없으니 `renderIcon`으로 제품 glyph를 넘긴다(비우면 빈 원) | [Result](../components/result.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

## 배치

```text
Native 화면(ScrollView keyboardShouldPersistTaps="handled", 위아래 spacing.lg 20)
┌ Container gutter 16(폭 < 600) · 20(폭 ≥ 600) ────┐
│ ┌ Card ──────────────────────────────────┐       │  body padding spacing.md 16
│ │ 인증번호 확인              (title)     │       │
│ │ 문자로 받은 6자리 숫자를…  (muted)     │       │  제목–설명 spacing.xs 8
│ │ ┌ form ──────────────────────────────┐ │       │
│ │ │ 인증번호                           │ │       │
│ │ │ [2][4][6][8][1][ ]   ← OtpField    │ │       │  칸 44, 칸 사이 spacing.xs 8
│ │ │ 도움말 / 오류(남은 횟수)           │ │       │
│ │ │          ↕ spacing.md 16           │ │       │
│ │ │ 새 인증번호를 보냈어요 (재전송 후) │ │       │
│ │ │          ↕ spacing.md 16           │ │       │
│ │ │ [            확인              ]   │ │       │  ← 주 행동(primary), 위
│ │ │          ↕ spacing.md 16           │ │       │
│ │ │ [  8초 후 다시 받을 수 있어요  ]   │ │       │  ← 보조(ghost), 아래, 대기 중 disabled
│ │ └────────────────────────────────────┘ │       │
│ └────────────────────────────────────────┘       │
└──────────────────────────────────────────────────┘
  안전 영역·키보드: 화면 골격이 맡는다. 고정 영역 없음(행동은 본문 흐름 안)

성공 후 같은 Card 안
┌ Card ──────────────────────────────────┐
│        (✓)                             │  Result 위아래 spacing.xxxl 40, 좌우 spacing.xl 24
│   인증을 마쳤어요                      │
│   서버가 번호를 확인한 뒤에만…        │  ← description
│   [ 계속 ]                             │  ← Result 행동 하나(제품의 다음 단계)
└────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤). Native: `ScrollView` > `Container` | 이 구성은 바깥 폭·여백을 정하지 않는다. 스토리는 Card만 그린다. Web 단독 화면이면 [Container](../components/container.md) 같은 읽기 폭 컨테이너는 제품이 고른다. Native는 Card를 `ScrollView`(`keyboardShouldPersistTaps="handled"`) 안 `Container`에 둔다. 입력이 한 칸이라 [KeyboardFormScrollView](../components/keyboard-form-scroll-view.md)(실험, `react-native-keyboard-controller` 설치와 앱 루트 `KeyboardMotionProvider` 필요)는 기본값이 아니며, 여러 필드 폼 안에 이 구성을 넣을 때만 쓴다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`layout.pagePadding`) |
| 틀 | `Card` | 바깥 틀 안, 스크롤과 함께 | body padding `spacing.md` 16, 제목–설명 `spacing.xs` 8 |
| 입력 | `OtpField` medium | Card 머리 아래 맨 위 | 칸 `control.minTouchTarget` 44, 칸 사이 `spacing.xs` 8 (`large`: 52 / `spacing.sm` 12) |
| 재전송 안내 | Text muted | 입력 아래, 재전송 후·재전송 실패 때만 | `Stack gap="md"` 16 |
| 행동 | Button primary → ghost | 안내 아래, 세로로 꽉 찬 폭(`Stack` 기본 `align="stretch"`가 채우므로 Web `layoutStyle`·Native `fullWidth`를 따로 주지 않는다) | 높이 `control.buttonHeight.medium` 44, 사이 `spacing.md` 16 |
| 성공 | `Result` | 폼 자리를 대신함 | 위아래 `spacing.xxxl` 40, 좌우 `spacing.xl` 24, gap `spacing.sm` 12 |

- 확인이 위, 다시 받기가 아래다. 세로로 쌓은 행동은 주 행동이 위다([Button](../components/button.md) 좁은 폭 규칙과 같다). 이 구성의 primary는 확인 하나다.

## 흐름과 상태

1. 번호를 입력한다. 6자리가 차면 Web은 Enter·확인 버튼으로 제출하고, Native는 `onComplete`로 바로 제출한다.
2. 확인 중: 입력은 포커스를 유지한 채 읽기 전용(`busy`), 확인 버튼은 `loading`, 다시 받기는 `disabled`.
3. 틀리면 OtpField `error`에 "인증번호가 맞지 않아요. N번 더 시도할 수 있어요."가 나온다. 값을 고치기 시작하면 오류가 내려간다.
4. 3번 틀리면 잠긴다(`disabled`). 대기 시간이 끝난 뒤 "인증번호 다시 받기"로만 풀린다.
5. 다시 받으면 상태가 초기화되고(시도 횟수·대기 시간 재시작) 재전송 안내 문구가 나온다.
6. 서버가 맞다고 응답하면 `ContentTransition`이 폼을 `Result` success로 바꾼다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 빈 칸·채운 칸(채운 칸 테두리 `content.brand`), 확인은 6자리 전 `disabled`, 다시 받기는 대기 라벨 | 첫 칸 |
| 진행 중 | 확인 요청: 입력 읽기 전용(`busy`), 확인 `loading`, 다시 받기 `disabled` | 입력에 포커스 유지 |
| 실패 | 확인 요청 실패(네트워크·서버): 시도 횟수를 줄이지 않고 OtpField `error`에 재시도 문구, 값 유지. 확인은 다시 누를 수 있다 | 오류는 필드 설명으로 읽힌다 |
| 틀림 | OtpField `error`에 남은 횟수 | 오류는 필드 설명으로 읽힌다 |
| 잠김 | OtpField `disabled` + `error`에 "시도 횟수를 모두 썼어요. 인증번호를 다시 받아 주세요." | 다시 받기만 동작 |
| 재전송 대기 | ghost 라벨 "N초 후 다시 받을 수 있어요", `disabled` | 1초마다 라벨 갱신 |
| 재전송 요청 중 | 다시 받기 `loading`. 두 번 보내지 않는다 | — |
| 재전송 실패 | 대기 시간을 시작하지 않고 오류 문구(입력 아래 Text), 다시 받기는 바로 다시 누를 수 있다 | 실패 문구는 Web `role="status"`, Native live region |
| 재전송 완료 | 안내 문구(muted) | Web: 입력으로 포커스 이동. 문구는 Web `role="status"`, Native live region |
| 성공 | `Result` success, 행동 하나(제품의 다음 단계, 예 `otp.continue`). 스토리의 "다른 번호로 다시 해 보기"는 데모 초기화용 | Web: Result(`tabIndex={-1}`)로 포커스 이동 |

- 스토리의 정답 `246810`, 대기 10초(실서비스는 보통 30~60초), 지연 900ms는 데모 값이다. 시도 횟수·대기 시간·검증은 서버와 제품 소유다.
- 문구 키는 상태별 상수로 둔다(아래 `otpErrorKey`). 상태 이름으로 키를 조립하면 상태 표와 키가 어긋난다.

| 상태 | 문구 키 | 변수 |
| --- | --- | --- |
| 틀림 | `otp.wrong` | `left` |
| 잠김 | `otp.locked` | — |
| 확인 요청 실패 | `otp.requestFailed` | — |
| 재전송 실패 | `otp.resendFailed` | — |
| 재전송 대기 | `otp.resendWait` | `seconds` |
| 재전송 완료 | `otp.resent` | — |

## 코드 골격

```tsx
// Web
import { useEffect, useRef } from "react";
import { Button } from "@hjmds/react/actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Card } from "@hjmds/react/display";
import { Result } from "@hjmds/react/feedback";
import { OtpField } from "@hjmds/react/forms";
import { Stack, Text } from "@hjmds/react/layout";

// 상태 → 문구 키. 키를 상태 이름으로 조립하지 않는다.
const otpErrorKey = { wrong: "otp.wrong", locked: "otp.locked", requestFailed: "otp.requestFailed" } as const;
const error = errorKind ? t(otpErrorKey[errorKind], { left: attemptsLeft }) : undefined;

const inputRef = useRef<HTMLInputElement>(null);
const resultRef = useRef<HTMLDivElement>(null);
// 재전송 횟수를 의존성으로 둔다. 불리언 resent는 두 번째 재전송부터 값이 같아 실행되지 않는다.
useEffect(() => { if (resendCount > 0) inputRef.current?.focus(); }, [resendCount]);
useEffect(() => { if (verified) resultRef.current?.focus(); }, [verified]);

<Card title={t("otp.title")} description={t("otp.description")}>
  <ContentTransition stateKey={verified ? "verified" : "form"}>
    {verified
      ? <Result ref={resultRef} tabIndex={-1} status="success" title={t("otp.success")}
          description={t("otp.successBody")} actions={[{ label: t("otp.continue"), onAction: next }]} />
      : <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <Stack gap="md">
            <OtpField ref={inputRef} label={t("otp.field")} length={6} value={code}
              onValueChange={change} busy={verifying} disabled={locked}
              description={t("otp.hint")} {...(error ? { error } : {})} />
            {resendFailed ? <Text role="status" tone="muted">{t("otp.resendFailed")}</Text>
              : resendCount > 0 ? <Text role="status" tone="muted">{t("otp.resent")}</Text> : null}
            <Button type="submit" loading={verifying} disabled={!canSubmit && !verifying}>{t("otp.submit")}</Button>
            <Button type="button" tone="ghost" loading={resending} disabled={resendIn > 0 || verifying} onClick={resend}>
              {resendIn > 0 ? t("otp.resendWait", { seconds: resendIn }) : t("otp.resend")}
            </Button>
          </Stack>
        </form>}
  </ContentTransition>
</Card>;
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Card } from "@hjmds/react-native/data-display";
import { Result } from "@hjmds/react-native/feedback";
import { OtpField } from "@hjmds/react-native/inputs";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";

const otpErrorKey = { wrong: "otp.wrong", locked: "otp.locked", requestFailed: "otp.requestFailed" } as const;
const error = errorKind ? t(otpErrorKey[errorKind], { left: attemptsLeft }) : undefined;
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container size="reading" gutter={gutter}>
    <Card title={t("otp.title")} description={t("otp.description")}>
      <ContentTransition stateKey={verified ? "verified" : "form"}>
        {verified
          ? <Result status="success" title={t("otp.success")} description={t("otp.successBody")}
              actions={[{ label: t("otp.continue"), onAction: next }]}
              renderIcon={({ color }) => <CheckGlyph color={color} size={28} />} />
          : <Stack gap="md">
              <OtpField label={t("otp.field")} length={6} value={code} onValueChange={change}
                onComplete={submit} busy={verifying} disabled={locked}
                description={t("otp.hint")} {...(error ? { error } : {})} />
              {resendFailed ? <Text accessibilityLiveRegion="polite" tone="muted">{t("otp.resendFailed")}</Text>
                : resendCount > 0 ? <Text accessibilityLiveRegion="polite" tone="muted">{t("otp.resent")}</Text> : null}
              <Button loading={verifying} disabled={!canSubmit && !verifying} onPress={submit}>{t("otp.submit")}</Button>
              <Button tone="ghost" loading={resending} disabled={resendIn > 0 || verifying} onPress={resend}>
                {resendIn > 0 ? t("otp.resendWait", { seconds: resendIn }) : t("otp.resend")}
              </Button>
            </Stack>}
      </ContentTransition>
    </Card>
  </Container>
</ScrollView>;
```

상태 전이는 스토리의 `otpReducer`(편집 → 확인 중 → 틀림/잠김/성공, 재전송은 대기 후 초기화)를 참고해 제품이 소유한다.
확인 요청 실패·재전송 요청 중·실패는 스토리에 없으므로 제품이 상태를 더한다(시도 횟수를 줄이지 않는다).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제출 | `<form onSubmit>` + `type="submit"` 버튼(Enter 제출) | `onComplete`로 6자리 도달 시 자동 제출 + 확인 버튼 |
| 바깥 틀 | 제품 화면 레이아웃(문서 스크롤) | `ScrollView keyboardShouldPersistTaps="handled"` > `Container` |
| 재전송 후 포커스 | 입력으로 `focus()` | 이동하지 않음(스토리) |
| 성공 후 포커스 | `Result`(`tabIndex={-1}`)로 이동 | 이동하지 않음(스토리) |
| 성공 아이콘 | `icon`을 비우면 CSS가 ✓ | `renderIcon`으로 제품 glyph(비우면 빈 원) |
| 상태 문구 | `role="status"` | `accessibilityLiveRegion="polite"` |
| busy 표현 | read-only + `aria-busy` | `editable={false}` + `accessibilityState.busy` |
| 자동 채움 | `autoComplete="one-time-code"` | `textContentType="oneTimeCode"` |

## 함정

- 대기 타이머 effect 의존성에 `phase`를 넣으면 확인 요청마다 1초 타이머가 다시 시작돼 대기 시간이 줄지 않는다(2026-10-02 실측). 남은 초와 성공 여부만 의존성으로 둔다.
- 확인 중·잠김·성공 상태에서는 입력 값을 바꾸지 않는다. 응답과 다른 번호가 화면에 남는다.
- 성공 화면 전환은 서버 응답 뒤에만 한다. 6자리가 찼다는 이유로 미리 바꾸지 않는다.
- 네트워크·서버 실패를 "틀림"으로 처리해 시도 횟수를 줄이지 않는다. 사용자가 맞는 번호를 넣고도 잠긴다.
- 현재 스토리에는 확인 요청 실패·재전송 요청 중·재전송 실패 경로가 없다. 성공 행동 "다른 번호로 다시 해 보기"는 데모 초기화용이다.
