# Toast 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Toast](../toast.md), 리퀴드 표현: [Liquid Toast](../../../react-native/docs/liquid-toast.md),
recipe `toastRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

방금 한 행동의 결과처럼 **무시해도 안전한 짧은 알림**에 쓴다. 저장 완료, 복사 완료, 백그라운드 작업 완료
알림이 여기에 속한다. 화면 흐름 밖에 떠서 3초 뒤 스스로 닫히고, 큐에 쌓인 다음 알림이 이어서 뜬다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 안에 계속 남아야 하는 안내·경고(점검 예정, 권한 없음, 폼 오류 요약) | [Notice](notice.md) |
| 사용자가 응답해야 진행되는 확인·삭제 확인·필수 선택 | [AlertDialog](alert-dialog.md) |
| 지난 알림을 모아 다시 보는 목록 | [NotificationInboxScreen](notification-inbox-screen.md), [NotificationItem](notification-item.md) |
| 작업 결과를 화면 전체로 보여 줌 | [Result](result.md) |

선택 기준: 사용자가 놓쳐도 되고 자리를 차지하면 안 되면 Toast, 그 화면을 보는 동안 계속 보여야 하거나
읽지 않으면 다음 행동을 잘못할 수 있으면 Notice다. Toast에는 그 알림에서만 할 수 있는 행동을 두지 않는다.

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Toast` | `@hjmds/react`, `/toast` | `@hjmds/react-native`, `/feedback` | 알림 한 장(controlled) |
| `ToastProvider`·`useToast` | `@hjmds/react`, `/toast` | 없음 | Web 큐·viewport |
| `ToastRegion`·`useToastRegion` | 없음 | `@hjmds/react-native`, `/feedback` | Native 큐·영역 |
| `createLiquidToastPresentation` | 없음 | `/toast-liquid`만(root 재노출 없음) | 선택형 리퀴드 표현 |

## 최소 사용 예

```tsx
// Web: 앱 루트에 한 번
import { ToastProvider, useToast } from "@hjmds/react/toast";

<ToastProvider label={t("common.notifications")}>{children}</ToastProvider>

const toast = useToast();
toast.publish({
  id: "profile-save",
  description: t("profile.saved"),
  tone: "success",
  closeLabel: t("common.closeNotification"),
});
```

```tsx
// Native: 앱 루트에 한 번
import { ToastRegion, useToastRegion } from "@hjmds/react-native/feedback";

<ToastRegion safeAreaInsets={insets} accessibilityLabel={t("common.notifications")}>
  {children}
</ToastRegion>

const toast = useToastRegion();
toast.publish({
  id: "profile-save",
  description: t("profile.saved"),
  tone: "success",
  closeLabel: t("common.closeNotification"),
});
```

## 축과 기본값

- descriptor: `id`·`description`·`closeLabel` 필수. `title`, `action`, `announcement`는 선택.
- `tone`: `neutral`(기본) · `info` · `success` · `warning` · `danger`. `priority`: `normal` · `high`(낭독 순서, 색과 무관).
- `durationMs`: 기본 3000. 더 짧게 줘도 3000으로 올라간다. `null`은 수동으로 닫을 때까지 유지, `action`이 있으면 기본 유지.
- `placement`: `bottom`(기본) · `top` · `top-start` · `top-end` · `bottom-start` · `bottom-end`.
- 큐: `maxVisible` 1, `maxQueued` 20, `duplicatePolicy` `update`, `timerUpdatePolicy` `preserve`, `overflowPolicy` `discard-oldest`.

## 꼭 지킬 것

- Provider/Region은 앱에 하나만 두고 화면마다 새로 만들지 않는다. 진행 상태를 바꿀 때는 같은 `id`로 다시 `publish`한다.
- 문구는 모두 i18n 키로 만든 일반 문자열이다(ReactNode 아님). 아이콘만 있는 닫기 버튼 때문에 `closeLabel`이 필수다.
- 색·모양은 tone이 정한다. 카드에 브랜드 색을 덮지 않는다. 문구·id·action은 제품 소유, 카드 모양·큐·타이머는 HJM 소유다.
- Native는 `safeAreaInsets`를 제품이 넘긴다(기본 `{}`). 하단 고정 바가 있으면 Web `bottomOffset`, Native `keyboardOffset`으로 띄운다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 영역 이름 | `label` 필수(빈 문자열이면 throw) | `accessibilityLabel` 선택 |
| 키보드 | `hotkey`+`hotkeyHelp`(둘 다 주거나 둘 다 생략), Escape로 닫기 | `avoidKeyboard`(기본 true) |
| `Toast` 단독 닫힘 콜백 | `onDismissRequest` 필수 | `onDismiss` 선택 |
| tone 아이콘 교체 | 없음 | `renderToneIcon` |
| 모달 위 가림 | 없음 | `occluded` |
| `presentation: "liquid"` | 무시하고 기본 카드 | `presentationAdapter`가 있을 때만 리퀴드 |

## 함정

- `/toast-liquid`는 앱에 없을 수 있는 optional native peer `@shopify/react-native-skia`·`react-native-reanimated`·
  `react-native-worklets`를 import한다(peerDependenciesMeta에서 모두 optional). 2026-10에 이런 subpath가
  tsc·테스트는 통과했는데 기기 Metro에서 크래시가 났다. 세 peer가 개발 클라이언트 바이너리에 들어 있을 때만 import한다.
- 리퀴드는 `placement="top"`과 `maxVisible={1}`일 때만 동작하고, 아니면 `ToastRegion`이 `TypeError`를 던진다.
  어댑터는 render 밖에서 만들거나 memo한다.
- Web `Toast` 단독 렌더는 `HTMLAttributes` 타입을 받지만 실제로는 `className`만 전달한다. 배치는 Provider를 쓴다.
