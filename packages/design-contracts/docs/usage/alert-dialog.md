# AlertDialog 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: `AlertDialogRequest`·`createAlertDialogSession`(`src/alert-dialog.ts`), recipe `alertDialogRecipe`.
Popover와의 경계는 [ConfirmPopover 결정](../confirm-popover.md), Native 긴 문구 처리는 [Dialog](../dialog.md)에 있다.

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `AlertDialog` | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/overlays` | 기본 |
| `AlertDialogRequest` 타입 | `@hjmds/design-contracts/components/alert-dialog` | 같음 | 문구·행동 descriptor |

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

- `request.mode`: `alert`(확인 버튼 하나) · `confirm`(취소 + 확인, `cancelLabel` 필수).
- `request.tone`: `attention`(기본) · `info` · `success` · `danger`. `danger`는 `confirm` 모드에서만 허용된다.
- 첫 초점: `alert`는 확인, `confirm`은 취소 버튼.
- 바깥 누름으로 닫히지 않는다. Escape(Web)·뒤로(Native)는 취소로 끝난다. 처리 중(`busy`)에는 닫을 수 없다.
- `onConfirm`이 실패하면 열린 채로 `resolveErrorMessage` 또는 `fallbackErrorMessage`를 보여 준다.
- Web `size`: 기본 `medium`(Dialog recipe). Web `modalPriority`: 기본 `0`.

## 꼭 지킬 것

- `title`·`description`·`confirmLabel`·`cancelLabel`·`fallbackErrorMessage`는 i18n 문구로 넣는다. 빈 문자열이면 `TypeError`.
- `onConfirm`을 주면 `fallbackErrorMessage`도 필수다. 확인 버튼에 별도 Spinner를 얹지 않는다(세션이 `loading`을 그린다).
- 열림은 제어(`open` + `onOpenChange`)로 두는 것이 기본이다. 비제어 Web은 `trigger`가 필수다.
  Native는 제어/비제어를 마운트 뒤 바꾸면 throw한다.
- 버튼 색·배치는 tone과 recipe가 정한다. Web `className`, Native `contentStyle`로 색·radius를 덮지 않는다([소비 정책 §3](../consumer-policy.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 여는 요소 | `trigger`(선택, 비제어면 필수) | 없음. `open`/`defaultOpen`으로만 연다 |
| 결과 콜백 | 없음(`onOpenChange` 사유 `confirm`/`cancel-action`/`escape`) | `onResult({ outcome })` |
| 아이콘 | `icon` | 없음 |
| 크기·우선순위·portal | `size`, `modalPriority`, `portalContainer` | 없음(RN `Modal` props 일부를 그대로 받는다) |
| 초점 복귀 | `returnFocusRef`(없으면 trigger) | `returnFocusRef` |

## 함정

- Native에서 매우 긴 확인 문구는 본문이 스크롤되도록 바뀌었지만 큰 글자 실기기 검증은 끝나지 않았다([Dialog](../dialog.md)).
  문구를 자르거나 글자 크기 상한으로 피하지 않는다.
