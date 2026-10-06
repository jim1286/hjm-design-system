# 토스트 배치 비교

- 단계: 구성
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Toast](../../toast.md), `showcase/web/src/components/ToastLayout.stories.tsx`, `src/component-recipes.ts`(`toastRecipe`), `src/toast.ts`, `packages/react/src/styles.css`(`.hjm-toast-viewport`, `.hjm-toast`), `packages/react/src/toast.tsx`
- 스토리북: `배포/구성/비교와 검증/토스트 배치 비교`

## 언제 쓰나

Toast 카드 한 장의 내부 배치(톤 배지·제목·설명·닫기·실행 버튼)와 화면 위 위치를 좁은 폭·큰 글자·긴 문구·톤별로 확인하는 비교 스토리다.
소비자는 이 결과로 "문구를 얼마나 길게 둘지, 실행 버튼을 둘지, 어떤 tone을 쓸지"를 고른다.

| 스토리 | 비교하는 것 | 소비자가 고를 기준 |
| --- | --- | --- |
| 간결한 배치 | mobile1 viewport에서 설명 한 줄 카드 | 기본 알림은 `description` 한 줄로 끝낸다 |
| 리퀴드 효과 대체 표시 | `presentation: "liquid"` descriptor를 Web이 표준 카드로 그림 | 공유 descriptor에 `liquid`를 넣어도 Web은 표준 카드 + 실행 버튼을 유지한다 |
| 긴 문구와 실행 버튼 | 좁은 폭 + textScale 2 + 혼합 언어 긴 문구 + `dismissOnAction: false` | 긴 문구는 줄바꿈되고 잘리지 않는다. 실행 후에도 남아야 하는 행동(다시 시도)은 `dismissOnAction: false` |
| 상태별 비교 | neutral·success·info·warning·danger 다섯 장, 실행 버튼 유무 | tone은 결과의 의미로 고른다. 실행 버튼은 그 알림이 아니어도 할 수 있는 행동일 때만 둔다 |

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `ToastProvider` + `useToast` | 앱 루트에 하나. viewport·큐·타이머 | [Toast](../components/toast.md) |
| `Toast` | controlled 카드 한 장(스토리가 직접 그림) | [Toast](../components/toast.md) |
| descriptor `action` | 끝 정렬 알약 버튼 하나 | [Toast](../components/toast.md) |

## 배치

```text
화면(좁은 폭, placement="bottom" 기본)
┌──────────────────────────────────────┐
│                                      │
│          (콘텐츠, 스크롤)            │
│                                      │
│ ┌ Toast ───────────────────────────┐ │ ← 좌우 max(spacing.md 16, 안전 영역)
│ │ (●) 연결을 확인해 주세요     [×] │ │    배지 32 · 제목 굵게 · 닫기 44×44
│ │     Your changes remain …        │ │    설명(보조 색)
│ │                  [ 다시 시도 ]   │ │ ← 실행 버튼: 둘째 줄, 끝 정렬, 높이 44
│ └──────────────────────────────────┘ │
│   ↕ max(spacing.md 16, 하단 안전 영역) + bottomOffset
└──────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | `ToastProvider` viewport(앱 루트 하나) | 화면 콘텐츠·스크롤 위에 `position: fixed`로 떠 있다. 콘텐츠 스크롤과 무관하고 콘텐츠 여백을 바꾸지 않는다. 안전 영역은 viewport가 `env(safe-area-inset-*)`로 직접 피한다. 하단 고정 바는 `bottomOffset`으로 피한다. 모바일 Web 화면 키보드는 따로 피하지 않는다 | 가장자리 `max(spacing.md 16, safe-area)`, `layer.toast` 1000, viewport는 포인터를 통과시킨다(`pointer-events: none`, 카드만 받음) |
| viewport | `ToastProvider` | 화면 고정(`position: fixed`), 기본 하단 가운데. `top`·`top-start`·`top-end`·`bottom-start`·`bottom-end` 선택 | 가장자리 `max(spacing.md 16, safe-area)`, 최대 폭 `min(420, 100vw - 32)`, 카드 사이 `spacing.sm` 12. 하단이면 새 카드가 아래부터 쌓인다 |
| 카드 | `Toast` | viewport 안 | 최소 높이 3.5rem, padding 위아래 `spacing.sm` 12·시작 `spacing.md` 16·끝 `spacing.xs` 8, 열 간격 `spacing.sm` 12, radius `lg` 16 |
| 배지 | tone 아이콘 | 첫 줄 시작 | 지름 `toastRecipe.icon.badgeDiameter` 32 |
| 문구 | 제목 + 설명 | 첫 줄 가운데, 남은 폭 전부 | 제목–설명 `spacing.xxs` 4, `word-break: keep-all`, 잘림 없음 |
| 닫기 | IconButton | 첫 줄 끝 | `control.minTouchTarget` 44 × 44 |
| 실행 | 알약 버튼 | 둘째 줄, 문구 열부터 끝까지, 끝 정렬 | 최소 높이 44, 좌우 `spacing.md` 16, 줄 간격 `spacing.xs` 8 |

- 하단에 고정 바(BottomNavigation·BottomCTA)가 있으면 `bottomOffset`으로 그 높이만큼 띄운다.
- 한 번에 보이는 카드는 `maxVisible` 1(기본)이다. 상태별 비교 스토리의 다섯 장 겹침은 비교용이며 실제 화면 모습이 아니다.

## 흐름과 상태

1. 행동 결과가 나오면 `useToast().publish(descriptor)`를 부른다. 문구 키는 결과별 상수로 둔다(아래 `toastCopy`).
2. 카드가 viewport에 나타나고 기본 3000ms 뒤 닫힌다(포인터·포커스가 올라가 있으면 멈춘다).
3. 실행 버튼을 누르면 `onAction` 후 기본으로 닫힌다(`dismissOnAction: false`면 남는다). 닫기 버튼은 즉시 닫는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 결과 한 줄(`description`), tone은 결과 의미, 3000ms 뒤 자동 닫힘 | 낭독은 `priority`가 정한다 |
| 진행 중 | 오래 걸리는 작업의 진행은 같은 `id`로 다시 `publish`해 카드 하나를 갱신한다(새 카드를 쌓지 않는다). 진행률 자체는 화면의 [Progress](../components/progress.md)가 맡는다 | 같은 카드가 갱신된다 |
| 실패 | `tone: "danger"` + 실행 버튼 "다시 시도"(`dismissOnAction: false`면 다시 시도 후에도 남는다). 실패를 Toast로만 알리면 사라진 뒤 다시 찾을 수 없으므로, 되돌릴 수 없는 실패는 화면 안 [Notice](../components/notice.md)·Result로 남긴다 | `priority`로 낭독 긴급도를 정한다 |
| neutral | 회색 배지 + 알림 아이콘 | 낭독은 `priority`가 정하고 tone과 무관 |
| success·info·warning | 각 feedback 배지 색 + 아이콘 | 같음 |
| danger | danger 배지 + 경고 아이콘, 흔히 "다시 시도" 실행 | 같음 |
| 실행 버튼 있음 | 둘째 줄 알약 버튼, `durationMs` 기본은 수동 닫기까지 유지 | 포커스가 카드에 있으면 타이머 정지 |
| 큰 글자·긴 문구 | 문구가 여러 줄로 늘고 카드가 길어진다. 버튼 라벨도 줄바꿈 | — |
| 닫히는 중 | 투명해지며 `spacing.xs` 8만큼 내려감. 모션 감소면 이동 없음 | — |

## 코드 골격

```tsx
// Web
import { ToastProvider, useToast } from "@hjmds/react/toast";

// 앱 루트에 한 번
<ToastProvider label={t("common.notifications")} bottomOffset={dockHeight}>{children}</ToastProvider>;

// 결과 → 문구 키. 결과 이름으로 키를 조립하지 않는다.
const toastCopy = {
  saving: { title: "sync.savingTitle", description: "sync.savingBody" },
  failed: { title: "sync.offlineTitle", description: "sync.offlineBody" },
} as const;

// 화면에서
const toast = useToast();
toast.publish({
  id: "sync",
  tone: "danger",
  title: t(toastCopy.failed.title),
  description: t(toastCopy.failed.description),
  closeLabel: t("common.closeNotification"),
  action: { label: t("sync.retry"), onAction: retry, dismissOnAction: false },
});
```

```tsx
// Native
// 이 스토리는 Web 전용이다. Native 배치는 ToastRegion(`@hjmds/react-native/feedback`)을 쓰고
// safeAreaInsets·keyboardOffset을 제품이 넘긴다. 자세한 것은 Toast 컴포넌트 지침을 본다.
```

스토리의 문구(번뚝 타이머 등)는 예시다. 문구·id·action은 제품 소유, 카드 모양·큐·타이머는 HJM 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 큐·영역 | `ToastProvider`·`useToast` | `ToastRegion`·`useToastRegion` |
| 하단 고정 바 회피 | `bottomOffset` | `keyboardOffset` |
| 안전 영역 | `env(safe-area-inset-*)` | `safeAreaInsets` prop(기본 `{}`) |
| `presentation: "liquid"` | 표준 카드로 대체 | `/toast-liquid`의 `createLiquidToastPresentation`을 등록하면 리퀴드 표현 |

## 함정

- `durationMs`를 3000보다 짧게 줘도 3000으로 올라간다.
- 카드 색·배지·radius를 `className`으로 덮지 않는다. 톤 색은 `toastRecipe.tones`가 정한다.
- 화면마다 Provider를 새로 만들지 않는다. 같은 진행을 갱신할 때는 같은 `id`로 다시 `publish`한다.
- 현재 스토리는 `Toast` 카드만 직접 그리고 viewport(`ToastProvider`)를 띄우지 않는다. 화면 위 위치·안전 영역·`bottomOffset`은 스토리로 확인되지 않고 위 표의 값은 `.hjm-toast-viewport` CSS에서 확인했다.
