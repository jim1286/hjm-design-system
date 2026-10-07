# Toast

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Toast](../../toast.md), [Liquid Toast](../../../../react-native/docs/liquid-toast.md), `src/component-recipes.ts`(`toastRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/토스트`, `배포/컴포넌트/상태와 알림/리퀴드 토스트`

## 언제 쓰나

방금 한 행동의 결과처럼 **무시해도 안전한 짧은 알림**에 쓴다. 저장 완료, 복사 완료, 백그라운드 작업 완료
알림이 여기에 속한다. 화면 흐름 밖에 떠서 3초 뒤 스스로 닫히고, 큐에 쌓인 다음 알림이 이어서 뜬다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 안에 계속 남아야 하는 안내·경고(점검 예정, 권한 없음, 폼 오류 요약) | [Notice](notice.md) |
| 사용자가 응답해야 진행되는 확인·삭제 확인·필수 선택 | [AlertDialog](alert-dialog.md) |
| 작업 결과를 화면 전체로 보여 줌 | [Result](result.md) |

선택 기준: 사용자가 놓쳐도 되고 자리를 차지하면 안 되면 Toast, 그 화면을 보는 동안 계속 보여야 하거나
읽지 않으면 다음 행동을 잘못할 수 있으면 Notice다. Toast에는 그 알림에서만 할 수 있는 행동을 두지 않는다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Toast` | 기본(알림 한 장, controlled) | `@hjmds/react`, `/toast` | `@hjmds/react-native`, `/feedback` |
| `ToastProvider`·`useToast` | 동반(Web 큐·viewport) | `@hjmds/react`, `/toast` | — |
| `ToastRegion`·`useToastRegion` | 동반(Native 큐·영역) | — | `@hjmds/react-native`, `/feedback` |
| `createLiquidToastPresentation` | 확장(선택형 리퀴드 표현) | — | `/toast-liquid`만(root 재노출 없음) |

## 최소 사용 예

```tsx
// Web: 앱 루트에 한 번
import { ToastProvider, useToast } from "@hjmds/react/toast";

<ToastProvider label={t("common.notifications")}>{children}</ToastProvider>;

// 화면 컴포넌트 안에서 알림을 낸다
function useProfileSavedToast() {
  const toast = useToast();
  return () =>
    toast.publish({
      id: "profile-save",
      description: t("profile.saved"),
      tone: "success",
      closeLabel: t("common.closeNotification"),
    });
}
```

```tsx
// Native: 앱 루트에 한 번
import { ToastRegion, useToastRegion } from "@hjmds/react-native/feedback";

<ToastRegion safeAreaInsets={insets} accessibilityLabel={t("common.notifications")}>
  {children}
</ToastRegion>;

function useProfileSavedToast() {
  const toast = useToastRegion();
  return () =>
    toast.publish({
      id: "profile-save",
      description: t("profile.saved"),
      tone: "success",
      closeLabel: t("common.closeNotification"),
    });
}
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| descriptor | `id`·`description`·`closeLabel` 필수, `title`·`tone`·`priority`·`durationMs`·`action`·`announcement`·`presentation` 선택 | — | 모두 `string`(ReactNode 아님) |
| `action` | `{ label, accessibilityLabel?, onAction: () => void, dismissOnAction? }` | — | 누르면 `onAction`, 기본으로 알림이 닫힌다 |
| `tone` | `neutral` · `info` · `success` · `warning` · `danger` | `neutral` | — |
| `priority` | `normal` · `high` | — | 낭독 순서, 색과 무관 |
| `durationMs` | ms · `null` | 3000 | 더 짧게 줘도 3000으로 올라간다. `null`은 수동으로 닫을 때까지 유지, `action`이 있으면 기본 유지 |
| `placement` | `bottom` · `top` · `top-start` · `top-end` · `bottom-start` · `bottom-end` | `bottom` | — |
| 큐 | `maxVisible` · `maxQueued` · `duplicatePolicy` · `timerUpdatePolicy` · `overflowPolicy` | 1 · 20 · `update` · `preserve` · `discard-oldest` | — |
| `publish` | Web `(descriptor, options?) => ToastPublishResult`, Native `(descriptor) => ToastPublishResult` | — | 결과는 `{ outcome: "added" \| "updated", id, position: "visible" \| "queued" }`, `{ outcome: "ignored", id, reason: "duplicate" \| "closing" }`, `{ outcome: "discarded", id, reason: "queue-overflow" }` 중 하나 |
| `dismiss` | Web `(id, reason) => boolean`, Native `(id, reason?) => boolean` | — | 닫았으면 `true`. Web은 `close(id)`도 있다. Native는 `pause`·`resume(id, reason?)`도 있다 |
| 닫힘 사유 `ToastDismissReason` | `timeout` · `action` · `close-action` · `escape` · `swipe` · `programmatic` · `queue-overflow` · `interrupted` | — | Web `Toast` `onDismissRequest`·Native `onDismiss`가 받는다 |
| `toasts`/`defaultToasts` + `onToastsChange`(Native `ToastRegion`) | `readonly ToastDescriptor[]`, `(toasts) => void` | — | 큐를 제품 상태로 제어할 때 |
| `safeAreaInsets`(Native) | `{ top?, bottom?, left?, right?, start?, end? }` | `{}` | — |
| `layoutStyle`(Native `Toast`·`ToastRegion`) | `HjmCompositionStyleProp` | — | Web Toast·ToastProvider에는 없다(떠 있는 층이라 배치 대상이 아님) |
| `style`·`toastStyle`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle` 또는 `placement`·`safeAreaInsets`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

### 디자인 프로필 상속

2026-10-07 테마 소비 경로 점검에서 고정 foundation/recipe 값이 남은 곳을 보완했다.
모서리의 recipe 역할은 유지하고 값은 가장 가까운 Provider의 `designProfile.tokens.radius`를
읽는다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.

Native의 선택형 `/toast-liquid`도 가장 가까운 프로필의 `radius.lg`와 `shadow.raised`를
읽는다. 일반 Toast의 `floating` 대신 `raised`를 유지하는 이유는 리퀴드 카드의 얕은 깊이를
정한 기존 검토다. RN 내용 clip과 Skia 카드 모서리를 함께 바꾸고 그림자의 위·아래·좌·우
여유를 확보한다. 프로필이 없으면 기존 모서리 12와 foundation `raised`를 유지한다.
원형 시작점·큐·행동은 유지하며 Web은 일반 Toast fallback이다. 기존
`실험/구성/비교와 검증/테마 조합`의 Native ‘물방울 알림의 테마 비교’에서 같은 알림을
유지한 채 다음 테마로 바꿀 수 있다. 기기 시각·음성·제스처 검증은 별도로 남는다.


## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 카드 최대 폭 420(Web `min(420px, 100vw − 2×spacing.md)`, Native 화면 폭 − 안전 영역 − 2×16에서 420으로 자름). 최소 높이 56(`layout.rowHeight.singleLine`). 열은 [아이콘 배지 32][문구][닫기 44]. `action`은 높이 44(`control.minTouchTarget`), 좌우 여백 `spacing.md` 16의 pill | `toastRecipe.viewport`·`surface`·`icon`·`action`, `.hjm-toast`, `react-native/src/feedback.tsx` |
| 간격 | 화면 가장자리에서 `spacing.md` 16 + 안전 영역(`safeAreaMode: "additive"`). 여러 장 사이 `spacing.sm` 12. 카드 안 열 간격 `spacing.sm` 12 | `toastRecipe.viewport`, `.hjm-toast-viewport` |
| 순서·정렬 | 기본은 아래 가운데(`placement="bottom"`). 위쪽 배치는 위에서 아래로, 아래쪽 배치는 가장자리부터 위로 쌓인다. `action`은 둘째 줄 끝 | `toastRecipe.placements`, `.hjm-toast__action` |
| 고정·스크롤 | 화면 흐름 밖에 떠 있는 층이라 본문 레이아웃에 자리를 만들지 않는다. 하단 고정 바(BottomNavigation·BottomCTA)가 있으면 Web `bottomOffset`(px 또는 CSS 길이), Native `keyboardOffset`으로 그 위에 띄운다. Native 아래쪽 배치는 `avoidKeyboard`(기본 true)로 키보드 위에 선다 | `react/src/toast.tsx`, `react-native/src/feedback.tsx`(`ToastRegion`) |
| 좁은 폭·큰 글자 | 폭이 줄고 문구가 줄바꿈되어 카드가 세로로 자란다. 잘라 내지 않는다 | `.hjm-toast__content`(`overflow-wrap: anywhere`) |

```text
아래 배치(기본)                         하단 바가 있을 때
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ 본문(스크롤)                 │      │ 본문(스크롤)                 │
│                              │      │ ┌──────────────────────────┐ │
│ ┌──────────────────────────┐ │      │ │(●) 저장했어요        [×] │ │
│ │(●) 저장했어요        [×] │ │      │ │              [되돌리기]  │ │ ← action(선택)
│ └──────────────────────────┘ │      │ └──────────────────────────┘ │
│   ↑ 16 + 안전 영역           │      │   ↑ bottomOffset/keyboardOffset
└──────────────────────────────┘      │ [홈] [검색] [내 정보]        │ ← 고정 바
  좌우 16, 최대 폭 420, 가운데         └──────────────────────────────┘
```

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
- ToastRegion 배치는 `layoutStyle={{ flex: 1 }}`로 쓴다. Native 예제도 이 경로를 사용한다.
- Web `Toast` 단독 렌더는 나머지 HTML 속성(id·data-*·이벤트)을 루트에 전달한다(미게시(1.12.1 이후). 1.12.1은 `className`만 전달). `role`·`aria-labelledby`·`aria-describedby`·`data-tone`·`data-state`는 Toast가 정하므로 덮이지 않는다. 배치는 Provider를 쓴다.


### 고정 아이콘과 큰 글자

2026-10-06 최근 검색 삭제 기호가 큰 글자에서 잘린 재현에 따라 Native 내장 삭제·메뉴 기호는 고정 아이콘 틀의 크기를 유지한다. 주변 제목·라벨은 계속 확대한다. Chip의 체크와 Toast 닫기는 기존 비확대 경로를 유지하며 회귀 검사에 포함한다. 제품이 전달한 아이콘 슬롯은 제품이 같은 조건을 검증한다.

### 프로필 행간 소비 — 미게시

2026-10-07 소비 감사에서 Web 제목/설명의 1.35/1.45 고정 행간이 `typography.body.lineHeight`를
우회하는 것을 확인했다. 두 slot은 기존 body 역할이므로 선택된 프로필의 `--hjm-type-body-line-height`를
기존 Provider/portal 토큰 경로로 읽는다. 프로필 없는 Provider와 독립 사용은 기존 1.35/1.45를 유지한다.
일괄 기본 행간 변경은 기존 알림 레이아웃까지 바꾸므로 채택하지 않았다. Native 본문 행간은 이미 body
토큰을 소비하며, 이번 Native 변경은 action 라벨의 ui 서체 역할만 명시한다. 알림 문구·큐·시간·닫기·
행동·초점 계약은 바꾸지 않는다.
