# Toast

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: [Toast](../../toast.md), [Liquid Toast](../../../../react-native/docs/liquid-toast.md), `src/component-recipes.ts`(`toastRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/토스트`, `배포/컴포넌트/상태와 알림/리퀴드 토스트`, `배포/구성/피드백과 복구/백그라운드 작업 상태`

## 언제 쓰나

저장 완료의 한 줄형·대상 요약형 선택은 [저장 결과 구성](../compositions/save-feedback.md)을 따른다.
한 줄형은 `description`, 요약형은 기존 `title` + `description`을 사용한다. 카드형 저장 완료 예시는 제거했다.

방금 한 행동의 결과처럼 **무시해도 안전한 짧은 알림**에 쓴다. 저장 완료, 복사 완료, 백그라운드 작업 완료
알림이 여기에 속한다. 화면 흐름 밖에 떠서 3초 뒤 스스로 닫히고, 큐에 쌓인 다음 알림이 이어서 뜬다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 안에 계속 남아야 하는 안내·경고(점검 예정, 권한 없음, 폼 오류 요약) | [Notice](notice.md) |
| 사용자가 응답해야 진행되는 확인·삭제 확인·필수 선택 | [AlertDialog](alert-dialog.md) |
| 작업 결과를 화면 전체로 보여 줌 | [Result](result.md) |
| 헤더에 작업 상태를 상시 표시하고 눌러서 패널을 여닫음 | [ActivityChip](activity-chip.md) + 이 Toast 패널([구성](../compositions/activity-status.md)) |

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
| descriptor | `id`·`description`·`closeLabel` 필수, `title`·`tone`·`priority`·`durationMs`·`action`·`press`·`announcement`·`presentation`·`media`·`progress` 선택 | — | 문구는 모두 `string`(ReactNode 아님). `media`만 예외 |
| `media` | `unknown`(Web·Native에서 `ReactNode`를 넘긴다) | — | 미게시(1.17.2 이후). 장식 시각물(마스코트·아바타). tone 배지 자리를 44(`toastRecipe.media.size`) 원으로 대신하고 보조기술에서 숨긴다 |
| `progress` | `{ steps: readonly string[]; current: number }` | — | 미게시(1.17.2 이후). 단계 2~5개, `current`는 0부터. 설명 아래 점+이름 줄로 그리고, 기본 낭독 끝에 현재 단계 이름을 붙인다. 범위 밖이면 throw |
| `action` | `{ label, accessibilityLabel?, onAction: () => void, dismissOnAction? }` | — | 누르면 `onAction`, 기본으로 알림이 닫힌다 |
| `press` | `{ accessibilityLabel: string; onPress: () => void }` | 없음 | 미게시. 카드 본문·미디어·여백을 누르면 콜백 후 `press` 사유로 닫힌다. 실행·닫기 버튼과 스와이프는 열기 동작을 실행하지 않는다. Web은 Tab/Enter/Space, Native는 독립 접근성 버튼 |
| `tone` | `neutral` · `info` · `success` · `warning` · `danger` | `neutral` | — |
| `priority` | `normal` · `high` | — | 낭독 순서, 색과 무관 |
| `durationMs` | ms · `null` | 3000 | 더 짧게 줘도 3000으로 올라간다. `null`은 수동으로 닫을 때까지 유지, `action` 또는 `press`가 있으면 기본 유지 |
| `placement` | `bottom` · `top` · `top-start` · `top-end` · `bottom-start` · `bottom-end` | `bottom` | — |
| 큐 | `maxVisible` · `maxQueued` · `duplicatePolicy` · `timerUpdatePolicy` · `overflowPolicy` | 1 · 20 · `update` · `preserve` · `discard-oldest` | — |
| `publish` | Web `(descriptor, options?) => ToastPublishResult`, Native `(descriptor) => ToastPublishResult` | — | 결과는 `{ outcome: "added" \| "updated", id, position: "visible" \| "queued" }`, `{ outcome: "ignored", id, reason: "duplicate" \| "closing" }`, `{ outcome: "discarded", id, reason: "queue-overflow" }` 중 하나 |
| `dismiss` | Web `(id, reason) => boolean`, Native `(id, reason?) => boolean` | — | 닫았으면 `true`. Web은 `close(id)`도 있다. Native는 `pause`·`resume(id, reason?)`도 있다 |
| 닫힘 사유 `ToastDismissReason` | `timeout` · `action` · `press` · `close-action` · `escape` · `swipe` · `programmatic` · `queue-overflow` · `interrupted` | — | Web `Toast` `onDismissRequest`·Native `onDismiss`가 받는다 |
| `toasts`/`defaultToasts` + `onToastsChange`(Native `ToastRegion`) | `readonly ToastDescriptor[]`, `(toasts) => void` | — | 큐를 제품 상태로 제어할 때 |
| `safeAreaInsets`(Native) | `{ top?, bottom?, left?, right?, start?, end? }` | `{}` | — |
| `layoutStyle`(Native `Toast`·`ToastRegion`) | `HjmCompositionStyleProp` | — | Web Toast·ToastProvider에는 없다(떠 있는 층이라 배치 대상이 아님) |
| `style`·`toastStyle`(Native) | 지원하지 않음 | — | 제거된 속성 — `layoutStyle` 또는 `placement`·`safeAreaInsets`. 현재 공개 props에서 제거되었다 |

### 디자인 프로필 상속

2026-10-07 테마 소비 경로 점검에서 고정 foundation/recipe 값이 남은 곳을 보완했다.
Dialog/AlertDialog/Sheet의 모서리는 가장 가까운 Provider의 `designProfile.tokens.radius`를 읽는다.
일반 Toast는 승인된 알림 시안의 `toastRecipe.material.radius` 24를 사용한다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.

Native의 선택형 `/toast-liquid`도 가장 가까운 프로필의 `radius.xl`(패널 이전 `radius.lg`)과 `shadow.raised`를
읽는다. 일반 Toast의 `floating` 대신 `raised`를 유지하는 이유는 리퀴드 카드의 얕은 깊이를
정한 기존 검토다. RN 내용 clip과 Skia 카드 모서리를 함께 바꾸고 그림자의 위·아래·좌·우
여유를 확보한다. 프로필이 없으면 모서리 24(패널, 미게시 1.17.2 이후. 그전 12)와 foundation `raised`를 쓴다.
원형 시작점·큐·행동은 유지하며 Web은 일반 Toast fallback이다. 기존
`실험/구성/비교와 검증/테마 조합`의 Native ‘물방울 알림의 테마 비교’에서 같은 알림을
유지한 채 다음 테마로 바꿀 수 있다. 기기 시각·음성·제스처 검증은 별도로 남는다.


## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 카드 최대 폭 420(Web `min(420px, 100vw − 2×spacing.md)`, Native 화면 폭 − 안전 영역 − 2×16에서 420으로 자름). 최소 높이 56(`layout.rowHeight.singleLine`). 모서리 `toastRecipe.material.radius` 24. 한 줄 열은 [장식 아이콘 32 또는 `media` 44][문구][닫기 44]. 요약형은 장식 아이콘 없이 [제목·설명][닫기 44]이며 제품 `media`는 유지한다. `action`은 높이 44(`control.minTouchTarget`), 좌우 여백 `spacing.md` 16의 pill. `progress` 점 6(현재 단계 1.4배) | `toastRecipe.viewport`·`surface`·`icon`·`action`, `.hjm-toast`, `react-native/src/feedback.tsx` |
| 안쪽 여백 | 카드 위아래 `spacing.sm` 12, 좌우 양쪽 `spacing.md` 16(`toastRecipe.surface.padding`, 미게시). 닫기는 44 터치 영역을 유지하되 끝 쪽으로 (44 − 글리프 14)/2 = 15만큼 여백에 겹쳐(`close.inlineOverhang`) × 글리프 끝이 카드 끝에서 16 — 배지의 시작 여백 16과 같다. RTL에서도 논리 방향(시작·끝)으로 대칭이다. `action`·`progress`는 문구 열에 맞춘다 | `toastRecipe.surface`·`close`, `.hjm-toast`·`.hjm-toast__close`, `react-native/src/feedback.tsx` |
| 첫 줄 기준 | 배지 32 상자(`toastRecipe.anchor.blockSize`)가 기준선이다. 첫 줄(제목, 없으면 설명)은 (32 − 그 줄의 행간)/2만큼 내려 배지 가운데에 맞추고, 닫기는 위아래 −(44 − 32)/2 = −6(`close.blockOverhang`)으로 같은 가운데에 둔 채 행을 늘리지 않는다. 한 줄이면 12 + 32 + 12 = 56에 배지·글자·닫기 가운데가 모두 28. 여러 줄이면 배지·닫기는 첫 줄 옆에 남고 나머지 줄은 아래로 자란다(문구 덩어리 전체의 가운데에 맞추지 않는다). `media` 44는 같은 위쪽에서 시작하고 기준 상자가 아니다 — 제목을 media 가운데에 맞추면 설명이 아바타 아래로 밀려나서다. Web은 첫 줄의 `1lh`, Native는 body 토큰 행간 × 현재 글자 배율로 계산해 프로필·글자 확대에서도 맞는다 | `toastRecipe.anchor`·`close`, `.hjm-toast__content`, `react-native/src/feedback.tsx` |
| 간격 | 화면 가장자리에서 `spacing.md` 16 + 안전 영역(`safeAreaMode: "additive"`). 여러 장 사이 `spacing.sm` 12. 카드 안 열 간격 `spacing.sm` 12 | `toastRecipe.viewport`, `.hjm-toast-viewport` |
| 순서·정렬 | 기본은 아래 가운데(`placement="bottom"`). 위쪽 배치는 위에서 아래로, 아래쪽 배치는 가장자리부터 위로 쌓인다. 문구 열 안 순서는 제목 → 설명 → `progress` → `action`. `action`은 문구 아래 시작 쪽(`toastRecipe.action.align` `start`, 미게시 1.17.2 이후. 그전 둘째 줄 끝) | `toastRecipe.placements`, `.hjm-toast__action` |
| 고정·스크롤 | 화면 흐름 밖에 떠 있는 층이라 본문 레이아웃에 자리를 만들지 않는다. 하단 고정 바(BottomNavigation·BottomCTA)가 있으면 Web `bottomOffset`(px 또는 CSS 길이), Native `keyboardOffset`으로 그 위에 띄운다. Native 아래쪽 배치는 `avoidKeyboard`(기본 true)로 키보드 위에 선다 | `react/src/toast.tsx`, `react-native/src/feedback.tsx`(`ToastRegion`) |
| 좁은 폭·큰 글자 | 폭이 줄고 문구가 줄바꿈되어 카드가 세로로 자란다. 잘라 내지 않는다 | `.hjm-toast__content`(`overflow-wrap: anywhere`) |

```text
아래 배치(기본)                         하단 바가 있을 때
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ 본문(스크롤)                 │      │ 본문(스크롤)                 │
│                              │      │ ┌──────────────────────────┐ │
│ ┌──────────────────────────┐ │      │ │(●) 저장했어요        [×] │ │
│ │(●) 저장했어요        [×] │ │      │ │    [되돌리기]            │ │ ← action(선택), 문구 아래 시작 쪽
│ └──────────────────────────┘ │      │ └──────────────────────────┘ │
│   ↑ 16 + 안전 영역           │      │   ↑ bottomOffset/keyboardOffset
└──────────────────────────────┘      │ [홈] [검색] [내 정보]        │ ← 고정 바
  좌우 16, 최대 폭 420, 가운데         └──────────────────────────────┘
```

### 패널 — media·progress (미게시, 1.17.2 이후)

2026-10-10 사용자 요청으로 패널이 Toast의 모양이 됐다(기본·리퀴드 모두). 진행 중인 작업은 같은 `id`, `durationMs: null`로
열어 두고 단계가 바뀔 때마다 같은 `id`로 다시 `publish`해 제자리에서 갱신한다. 끝나면 `progress`를 빼고 결과 문구와
`action`으로 바꾼다. 여닫는 트리거는 [ActivityChip](activity-chip.md)이다.

```text
┌──────────────────────────────────────┐
│ (🐥)  도우미                      [×] │  ← media 44가 tone 배지 자리를 대신
│       앱을 다듬고 있어요.              │
│       ● 읽기  ◉ 다듬기  ○ 확인         │  ← progress: 완료·현재(굵게)·예정, 점 6
│       [결과 보기]                      │  ← action: 문구 아래 시작 쪽
└──────────────────────────────────────┘    모서리 radius.xl 24
```

## 꼭 지킬 것

- Provider/Region은 앱에 하나만 두고 화면마다 새로 만들지 않는다. 진행 상태를 바꿀 때는 같은 `id`로 다시 `publish`한다.
- 문구는 모두 i18n 키로 만든 일반 문자열이다(ReactNode 아님). 아이콘만 있는 닫기 버튼 때문에 `closeLabel`이 필수다.
- 색·모양은 tone이 정한다. 카드에 브랜드 색을 덮지 않는다. 문구·id·action은 제품 소유, 카드 모양·큐·타이머는 HJM 소유다.
- 가장자리 상태색 띠는 없다. tone은 배지(또는 `media`)와 문구가 전달한다. 띠를 숨기는 옵션·CSS·팔레트 덮어쓰기를 두지 않는다 —
  1.10.0에 띠를 없앴고, 미게시(1.32.0 예정)부터는 Web의 늘 숨겨져 있던 `.hjm-toast__tone-mark` 요소도 그리지 않는다.
  Native에서 `statusAccents`·`danger`를 바탕색으로 바꾸면 띠가 아니라 tone 아이콘에 넘기는 색(`renderToneIcon`의 `color`)이 지워진다.
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

- 2026-10-18 번뚝은 1.10.0에 이미 없어진 띠를 숨기려고 Web `.hjm-toast__tone-mark { display: none }`과 Native 토스트 영역의 팔레트 덮어쓰기를 유지하고 있었다. 띠 계약은 "없음"이며 `toastRecipe.toneMark`는 호환용으로만 남은 deprecated 값(너비 0)이다.

- `/toast-liquid`는 앱에 없을 수 있는 optional native peer `@shopify/react-native-skia`·`react-native-reanimated`·
  `react-native-worklets`를 import한다(peerDependenciesMeta에서 모두 optional). 2026-10에 이런 subpath가
  tsc·테스트는 통과했는데 기기 Metro에서 크래시가 났다. 세 peer가 개발 클라이언트 바이너리에 들어 있을 때만 import한다.
- 리퀴드는 `placement="top"`과 `maxVisible={1}`일 때만 동작하고, 아니면 `ToastRegion`이 `TypeError`를 던진다.
  어댑터는 render 밖에서 만들거나 memo한다.
- ToastRegion 배치는 `layoutStyle={{ flex: 1 }}`로 쓴다. Native 예제도 이 경로를 사용한다.
- Web `Toast` 단독 렌더는 나머지 HTML 속성(id·data-*·이벤트)을 루트에 전달한다(1.13.0 변경. 1.12.1은 `className`만 전달). `role`·`aria-labelledby`·`aria-describedby`·`data-tone`·`data-state`는 Toast가 정하므로 덮이지 않는다. 배치는 Provider를 쓴다.


### 고정 아이콘과 큰 글자

2026-10-06 최근 검색 삭제 기호가 큰 글자에서 잘린 재현에 따라 Native 내장 삭제·메뉴 기호는 고정 아이콘 틀의 크기를 유지한다. 주변 제목·라벨은 계속 확대한다. Chip의 체크와 Toast 닫기는 기존 비확대 경로를 유지하며 회귀 검사에 포함한다. 제품이 전달한 아이콘 슬롯은 제품이 같은 조건을 검증한다.

### 프로필 행간 소비 — 1.16.0 변경

2026-10-07 소비 감사에서 Web 제목/설명의 1.35/1.45 고정 행간이 `typography.body.lineHeight`를
우회하는 것을 확인했다. 두 slot은 기존 body 역할이므로 선택된 프로필의 `--hjm-type-body-line-height`를
기존 Provider/portal 토큰 경로로 읽는다. 프로필 없는 Provider와 독립 사용은 기존 1.35/1.45를 유지한다.
일괄 기본 행간 변경은 기존 알림 레이아웃까지 바꾸므로 채택하지 않았다. Native 본문 행간은 이미 body
토큰을 소비하며, 이번 Native 변경은 action 라벨의 ui 서체 역할만 명시한다. 알림 문구·큐·시간·닫기·
행동·초점 계약은 바꾸지 않는다.

### 카드에서 관련 화면 열기

댓글·답장·작업 완료 알림에서 `press: { accessibilityLabel: t("reply.open"), onPress: openReply }`를
같은 descriptor에 넣는다. `action`은 카드와 별개의 실행 버튼이 필요할 때만 함께 쓴다.
본문·이미지·카드 여백 전체가 열기 영역이며 실행·닫기 버튼은 각각 자기 동작만 수행한다.
Web은 전체 영역의 투명한 button과 두 제어 버튼을 형제로, Native는 뒤쪽 Pressable과 위쪽 제어 버튼을
독립적으로 배치한다. label은 동작 이름, 설명은 기존 알림 문구이며 기본 카드 배치와 크기는 바뀌지 않는다.
라우터는 HJM이 가져오지 않고 제품 콜백이 실행한다. 화면 이동 뒤 provider가 없어져도 중복 실행하지 않는다.

## 근거

2026-10-17 사용자 지적("기본 토스트 좌우랑 글자 라인이 안맞는데"). Web 402 한 줄 알림에서 카드 안쪽 기준으로 배지 가운데 28, 글자 32~33,
닫기 글리프 30이 서로 달랐고(배지 `start`·문구 `center`·닫기 `start`−4의 세 정렬), 시작 여백 16과 닫기 글리프 끝 여백 22가 비대칭이었다
(여백 12/8/12/16 안에 44 터치 영역). Native는 사방 16 여백과 문구 `center` 정렬로 따로 어긋났다. 첫 줄 기준과 대칭 여백을 recipe 값으로 두고
두 renderer가 같은 값을 읽게 바꿨다. 수정 후 한 줄·여러 줄·action·media·RTL 모두 가운데 28(테두리 포함 29), 양쪽 여백 16으로 측정됐다.

## 2026-10-20 라이트·다크 표면 갱신 (1.37.1)

승인된 알림 시안을 따라 일반 Toast는 프로필의 큰 모서리 대신 `toastRecipe.material.radius` 24를 사용한다.
위의 과거 프로필 모서리 설명은 선택형 리퀴드 표현에만 적용된다. 배지 색 면을 제거하고 한 줄의 아이콘과 본문은 primary 색,
제목 아래의 설명은 secondary 색으로 구분한다. 요약형은 장식 아이콘을 생략한다. 문구·타이머·큐·닫기·행동 API는 유지한다.
라이트는 우윳빛, 다크는 차콜이며 같은 material 값과 floating 그림자를 두 renderer가 사용한다.
웹은 지원 환경에서 backdrop blur와 0.96 fill을 사용한다. Native 기본 표현은 blur host를 요구하지 않는 불투명 표면이다.
이는 새 npm 게시나 운영 제품 배포를 뜻하지 않는다.
