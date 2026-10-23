# AlertDialog

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-13
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
| `AlertDialogQueueProvider`·`useAlertDialogQueue` | 동반(명령형 확인과 대기열, 개발 소스·미게시) | `@hjmds/react/alert-dialog-queue` | `@hjmds/react-native/alert-dialog-queue` |

## 최소 사용 예

```tsx
// Web
import { AlertDialog } from "@hjmds/react/overlays";

<AlertDialog
  open={open}
  onOpenChange={(next) => setOpen(next)}
  returnFocusRef={openButtonRef}
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

Web의 외부 열기 버튼과 `returnFocusRef`에 같은 `useRef<HTMLButtonElement>(null)`을 연결한다.
macOS WebKit에서는 버튼 클릭만으로 호출 위치에 초점이 남지 않을 수 있다. 삭제 성공으로 버튼도
제거될 때는 목록 제목 등 작업을 이어갈 유효한 위치를 복귀 대상으로 정한다([Dialog 초점 복귀](dialog.md#최소-사용-예)).

```tsx
// Native
import { AlertDialog } from "@hjmds/react-native/overlays";

<AlertDialog
  open={open}
  onOpenChange={(next) => setOpen(next)}
  onResult={(result) => { if (result.outcome === "confirmed") router.back(); }}
  size="small"
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
| `confirmDisabled` | boolean | false | checkout·미게시. 제품의 확인 불가 조건만 잠그며 외부 잠금만으로 취소·실패 세션을 초기화하지 않는다 |
| `size` | `small` · `medium` · `large` | Web `medium` · Native `small` | 각 플랫폼 recipe의 최대 폭·안쪽 여백을 선택한다 |
| Web `modalPriority` | `number` | `0` | 높은 우선순위 모달이 뒤에 열린 낮은 모달 위에서 동작한다 |
| Native `contentStyle` | 배치 key(margin·width·flex·`alignSelf`)만 | — | `HjmCompositionStyleProp` 배치 전용 타입. 색·radius·padding은 받지 않으며 크기는 `size`로 지정한다 |

### 디자인 프로필 상속

2026-10-07 테마 소비 경로 점검에서 고정 foundation/recipe 값이 남은 곳을 보완했다.
모서리의 recipe 역할은 유지하고 값은 가장 가까운 Provider의 `designProfile.tokens.radius`를
읽는다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.


## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web `size` `medium` `min(36rem, 100%)` · `small` 28rem · `large` 48rem, 최대 높이 `100dvh − 32`. Native는 폭 100%, 최대 폭은 `small` 320 · `medium` 420 · `large` 640이며 기본은 `small`이다. 아이콘 원 44(`control.minTouchTarget`). Native 행동 버튼 최소 폭 96 | `.hjm-alert-dialog`, `alertDialogRecipe`·`dialogRecipe.sizes`, `react-native/src/overlays.tsx` |
| 간격 | 화면 가장자리와 최소 `spacing.md` 16. 안쪽 여백은 Native `small` `spacing.lg` 20, `medium`·`large` `spacing.xl` 24이다. 요소 사이 Web `spacing.sm` 12 · Native `dialogRecipe.content.gap` `spacing.md` 16. 행동 사이 `spacing.xs` 8, 세로로 쌓이면 `spacing.xs` 8. Native 버튼 좌우 `spacing.md` 16 | `.hjm-overlay`, `.hjm-alert-dialog__actions`, `alertDialogRecipe.actions` |
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
| 크기·우선순위·portal | `size`, `modalPriority`, `portalContainer` | `size`와 RN `Modal` props 일부. `modalPriority`·`portalContainer`는 없다 |
| 초점 복귀 | `returnFocusRef`(없으면 trigger) | `returnFocusRef` |
| 배치 prop | 없음(`layoutStyle` 제외 대상) | `contentStyle` 배치 key만 |

## 함정

- `onConfirm`은 Promise가 resolve되면 확인 성공으로 처리한다. 제품 command가 실패를 자체
  snapshot에 기록하고 Promise를 resolve하는 경우 그대로 연결하지 않는다. 2026-10-07 Utilverse
  삭제·신고 조사에서 이 차이를 확인했다. 작업까지 대화상자가 기다리는 경로는 receipt/실패를
  명시적으로 변환하는 adapter가 필요하다. 사용자 동의만 받는 경로는 `onConfirm` 없이 확인을
  마치고, Native `onResult`에서 제품 작업을 시작한다. 이때 `confirmed`는 동의 결과이며 서버
  삭제·Apple 인증·로컬 정리의 성공을 뜻하지 않는다. 처리 결과는 제품 상태 화면이 계속 보여 준다.
- Native에서 매우 긴 확인 문구는 본문이 스크롤되도록 바뀌었지만 큰 글자 실기기 검증은 끝나지 않았다([Dialog](../../dialog.md)).
  문구를 자르거나 글자 크기 상한으로 피하지 않는다.

### 명령형 확인과 대기열 — `useAlertDialogQueue` (개발 소스·미게시)

화면 곳곳에서 "지울까요?"를 묻고 결과를 기다려야 하면 대화상자 상태를 화면마다 두지 않고 앱 루트(라우터 안)에 공급자를 한 번 둔다.
제품의 AppDialog 대기열·결과 Promise·route scope 구현을 이것으로 바꾼다(2026-10-23 번뚝 웹·앱).

```tsx
// 루트: route가 바뀌면 이전 화면의 질문은 interrupted로 끝난다.
<AlertDialogQueueProvider scope={pathname}>{children}</AlertDialogQueueProvider>

// 화면
const { open } = useAlertDialogQueue();
const result = await open({ mode: "confirm", tone: "danger", title: t("delete.title"), description: t("delete.body"),
  confirmLabel: t("delete"), cancelLabel: t("cancel"), onConfirm: () => remove(id), fallbackErrorMessage: t("delete.failed") });
if (result.outcome === "confirmed") showDone();
```

| 항목 | 값 | 설명 |
| --- | --- | --- |
| `open(request, options?)` | `Promise<AlertDialogResult>` | 앞선 질문이 끝난 뒤 순서대로 뜬다. `{ outcome: "confirmed" }` 또는 `{ outcome: "cancelled", reason }`(`cancel-action`·`escape`·`back`·`programmatic`·`interrupted`) |
| `options` | Web `{ icon?, size? }`, Native `{ size?, returnFocusRef? }` | 요청별 표현. 문구·행동은 `request` |
| 공급자 `scope` | string | 질문의 주인(보통 route). 바뀌면 다른 scope 질문이 화면에서 내려가고 `interrupted` |
| 공급자 `modalPriority`·`portalContainer`(Web) | number · HTMLElement | 대기열 대화상자의 층(기본 0)과 portal. 필수 gate는 더 높은 우선순위 모달로 둔다 |

- `request.onConfirm`이 Promise면 처리 중에는 닫히지 않고, 실패하면 열린 채 `fallbackErrorMessage`를 보이며 `open`은 성공하거나 취소될 때까지 기다린다.
- 대화상자가 떠 있는 동안 trigger를 disabled로 두지 않는다. 배경은 이미 inert이고, disabled trigger로는 닫힌 뒤 초점이 돌아가지 못한다.
- 공급자 밖의 `useAlertDialogQueue`는 throw한다. 한 번에 하나의 Dialog·Sheet를 여는 `useDialog`/`useSheet`(`/overlay-stack`, Web)와는 별개다([계약](../../overlay-stack.md#결과를-돌려주는-확인-대기열--alertdialogqueueprovider-2026-10-23-개발-소스미게시)).

### 외부 확인 잠금 (checkout, 미게시)

`confirmDisabled`(기본 false)는 요청 제한 시간 등 제품이 판단한 확인 불가 조건이다. Web·Native 모두 확인 행동만 차단하며 취소는 유지한다. 비동기 처리 중 중복 실행·닫힘·실패 상태는 기존 세션이 계속 소유한다. 잠금을 해제해도 열린 세션과 실패 안내를 초기화하지 않는다. Spint의 내 글 내리기 재시도 제한을 공통 확인창에서도 보존하기 위해 추가했다.
