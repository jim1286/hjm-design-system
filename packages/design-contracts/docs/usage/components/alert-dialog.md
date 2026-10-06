# AlertDialog

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `AlertDialogRequest`·`createAlertDialogSession`(`src/alert-dialog.ts`), recipe `alertDialogRecipe`, Popover와의 경계 [ConfirmPopover 결정](../../confirm-popover.md), Native 긴 문구 처리 [Dialog](../../dialog.md)
- 스토리북: `배포/컴포넌트/오버레이/확인 대화상자`

## 언제 쓰나

삭제·결제·탈퇴처럼 되돌릴 수 없는 행동 직전의 확인(`mode="confirm"`)과, 사용자가 반드시 읽고
닫아야 하는 짧은 알림(`mode="alert"`)에 쓴다. 비동기 확인 중 중복 누름·닫힘 차단·실패 문구를 세션이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 폼·자유 콘텐츠가 들어가는 모달 | [Dialog](dialog.md) |
| 되돌릴 수 있는 가벼운 확인 | [Popover](popover.md), `InlineConfirm`([Button](button.md) 확장) |
| 화면을 막지 않는 결과 알림 | [Toast](toast.md) |
| 화면 안에 남는 안내 | [Notice](notice.md) |
| 아래에서 올라오는 선택지 | [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `AlertDialog` | 기본 | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/overlays` |
| `AlertDialogRequest` 타입 | 보조(문구·행동 descriptor) | `@hjmds/design-contracts/components/alert-dialog` | 같음 |

## 최소 사용 예

```tsx
// Web
import { AlertDialog } from "@hjmds/react/overlays";

<AlertDialog
  open={open}
  onOpenChange={(next) => setOpen(next)}
  request={{
    mode: "confirm",
    tone: "danger",
    title: t("post.delete.title"),
    description: t("post.delete.body"),
    confirmLabel: t("post.delete.confirm"),
    cancelLabel: t("common.cancel"),
    onConfirm: () => deletePost(id),
    fallbackErrorMessage: t("post.delete.failed"),
  }}
/>
```

```tsx
// Native
import { AlertDialog } from "@hjmds/react-native/overlays";

<AlertDialog
  open={open}
  onOpenChange={(next) => setOpen(next)}
  onResult={(result) => { if (result.outcome === "confirmed") router.back(); }}
  request={request}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `request` | `{ mode, tone?, title, description, confirmLabel, cancelLabel?, onConfirm?, fallbackErrorMessage?, resolveErrorMessage? }`(`AlertDialogRequest`) | 필수 | `mode`에 따라 허용 key가 갈린다(아래) |
| `request.mode` | `alert` · `confirm` | — | alert는 확인 버튼 하나, confirm은 취소 + 확인(`cancelLabel` 필수) |
| `request.tone` | `attention` · `info` · `success` · `danger` | `attention` | `danger`는 `confirm` 모드에서만 허용된다(타입으로 막힌다) |
| `request.onConfirm` | `() => void \| Promise<void>` | — | confirm 모드만. 주면 `fallbackErrorMessage: string`도 필수, 선택 `resolveErrorMessage: (error: unknown) => string` |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | 제어가 기본 |
| `onOpenChange` | `(open: boolean, detail: { reason: "trigger" \| "confirm" \| "cancel-action" \| "escape" \| "back" \| "programmatic" \| "interrupted" }) => void` | — | 닫힌 이유를 `detail.reason`으로 받는다 |
| Native `onResult` | `(result: { outcome: "confirmed" } \| { outcome: "cancelled", reason }) => void` | — | 결과 한 번 |
| 첫 초점 | — | — | `alert`는 확인, `confirm`은 취소 버튼 |
| 닫기 | — | — | 바깥 누름으로 닫히지 않는다. Escape(Web)·뒤로(Native)는 취소로 끝난다. 처리 중(`busy`)에는 닫을 수 없다 |
| `request.onConfirm` 실패 | — | — | 열린 채로 `resolveErrorMessage` 또는 `fallbackErrorMessage`를 보여 준다 |
| Web `trigger` | `ReactNode` | — | 비제어면 필수 |
| Web `size` | `small` · `medium` · `large` | `medium`(Dialog recipe) | — |
| Web `modalPriority` | `number` | `0` | 높은 우선순위 모달이 뒤에 열린 낮은 모달 위에서 동작한다 |
| Native `contentStyle` | 배치 key(margin·width·flex·`alignSelf`)만 | — | 색·radius·padding 등 시각 key는 deprecated(개발 모드 1회 경고, 다음 major에서 배치 key로 좁힘) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web `size` `medium` `min(36rem, 100%)` · `small` 28rem · `large` 48rem, 최대 높이 `100dvh − 32`. Native는 recipe 기본 `small`로 최대 폭 320, 폭 100%. 아이콘 원 44(`control.minTouchTarget`). Native 행동 버튼 최소 폭 96 | `.hjm-alert-dialog`, `alertDialogRecipe`·`dialogRecipe.sizes`, `react-native/src/overlays.tsx` |
| 간격 | 화면 가장자리와 최소 `spacing.md` 16. 안쪽 여백 `spacing.lg` 20(Web·Native small). 요소 사이 Web `spacing.sm` 12 · Native `dialogRecipe.content.gap` `spacing.md` 16. 행동 사이 `spacing.sm` 12, 세로로 쌓이면 `spacing.xs` 8. Native 버튼 좌우 `spacing.md` 16 | `.hjm-overlay`, `.hjm-alert-dialog__actions`, `alertDialogRecipe.actions` |
| 순서·정렬 | 화면 가운데. 위→아래 [아이콘] → 제목 → 설명 → 오류 문구 → 행동. 행동은 끝 정렬 한 줄 [취소][확인]. 버튼 수는 `mode`가 정한다(alert 1 · confirm 2) | `.hjm-overlay`, `alertDialogRecipe.slots` |
| 고정·스크롤 | 배경막(`backdrop.modal`)이 화면 전체를 덮고 하단 고정 바보다 위에 쌓인다(Web z-index `layer.modal` 900). 내용이 길면 대화상자 안에서 스크롤한다 | `.hjm-overlay`, `.hjm-alert-dialog` |
| 좁은 폭·큰 글자 | 폭 < 600(`breakpoint.medium`)이면 행동을 세로로 쌓고 **확인이 위**에 온다(Web DOM은 [취소][확인] 유지). Native는 글자 배율 1.6 이상(`largeTextThreshold`)에서도 쌓는다 | `alertDialogRecipe.actions.stackBelow`·`stackedOrder`, `react-native/src/overlays.tsx` |

```text
넓은 폭                                  폭 < 600 또는 Native 큰 글자
┌────────────────────────────┐           ┌──────────────────────┐
│ (!)                        │           │ (!)                  │
│ 제목                        │           │ 제목                  │
│ 설명                        │           │ 설명                  │
│ 오류 문구(실패 시)          │           │ [       삭제       ] │ ← confirm(위)
│               [취소] [삭제]│           │ [       취소       ] │
└────────────────────────────┘           └──────────────────────┘
```

## 꼭 지킬 것

- `title`·`description`·`confirmLabel`·`cancelLabel`·`fallbackErrorMessage`는 i18n 문구로 넣는다. 빈 문자열이면 `TypeError`.
- `onConfirm`을 주면 `fallbackErrorMessage`도 필수다. 확인 버튼에 별도 Spinner를 얹지 않는다(세션이 `loading`을 그린다).
- 열림은 제어(`open` + `onOpenChange`)로 두는 것이 기본이다. 비제어 Web은 `trigger`가 필수다.
  Native는 제어/비제어를 마운트 뒤 바꾸면 throw한다.
- 버튼 색·배치는 tone과 recipe가 정한다. Web은 `layoutStyle`이 없는 제외 대상(위치를 recipe가 고정)이고, `className`으로 색·radius를 덮지 않는다.
  Native `contentStyle`에는 배치 key만 넣는다([소비 정책 §3](../../consumer-policy.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 여는 요소 | `trigger`(선택, 비제어면 필수) | 없음. `open`/`defaultOpen`으로만 연다 |
| 결과 콜백 | 없음(`onOpenChange` 사유 `confirm`/`cancel-action`/`escape`) | `onResult({ outcome })` |
| 아이콘 | `icon` | 없음 |
| 크기·우선순위·portal | `size`, `modalPriority`, `portalContainer` | 없음(RN `Modal` props 일부를 그대로 받는다) |
| 초점 복귀 | `returnFocusRef`(없으면 trigger) | `returnFocusRef` |
| 배치 prop | 없음(`layoutStyle` 제외 대상) | `contentStyle` 배치 key만 |

## 함정

- Native에서 매우 긴 확인 문구는 본문이 스크롤되도록 바뀌었지만 큰 글자 실기기 검증은 끝나지 않았다([Dialog](../../dialog.md)).
  문구를 자르거나 글자 크기 상한으로 피하지 않는다.
