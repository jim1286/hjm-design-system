# Result

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Result](../../result.md), `src/result.ts`(`resultRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/결과 안내`

## 언제 쓰나

사용자 행동 뒤 흐름이 **끝난** 화면에 쓴다. 결제·제출 성공, 제출 실패, 존재하지 않는 페이지처럼
상태 하나와 최대 두 개의 다음 행동(다른 곳으로 이동, 다시 시도)을 보여 준다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록·검색 결과가 비었고 조건이 바뀌면 채워짐 | [EmptyState](empty-state.md) |
| 화면 일부 구역 실패, 나머지는 정상 | [Notice](notice.md) + 재시도 |
| 최초 로딩 | [Skeleton](skeleton.md) |
| 잠깐 알리고 사라지는 결과 | [Toast](toast.md) |
| 확인이 필요한 결정 | [AlertDialog](alert-dialog.md) |

상태 화면 조합 전체는 [1.4 제품 채택 가이드 · 상태 화면](../../product-adoption-1.4.md#상태-화면)을 따른다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Result` | 기본 | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |

## 최소 사용 예

```tsx
// Web
import { Result } from "@hjmds/react/feedback";

<Result
  status="success"
  title={t("checkout.done.title")}
  description={t("checkout.done.body")}
  actions={[
    { label: t("checkout.done.viewOrder"), onAction: openOrder },
    { label: t("common.goHome"), onAction: goHome },
  ]}
/>
```

```tsx
// Native
import { Result } from "@hjmds/react-native/feedback";

<Result
  status="failure"
  title={t("upload.failed.title")}
  description={t("upload.failed.body")}
  actions={[{ label: t("common.retry"), onAction: retry }]}
  renderIcon={({ color }) => <AlertGlyph color={color} size={28} />} // 제품 소유 glyph
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `status` | `success` · `failure` · `info` | 필수 | 403/404/500 같은 HTTP 의미는 제품이 `failure`와 자기 문구로 번역한다 |
| `title` | `string` | 필수 | 현지화 |
| `description` | `string` | — | — |
| `actions` | 0~2개 `readonly { label: string; onAction(): void; accessibilityLabel?: string }[]` | — | 첫째가 primary Button, 둘째가 secondary Button. `accessibilityLabel` 생략 시 `label`. 3개 이상이면 `RangeError` |
| `icon`(Web) | `ReactNode` | — | 제품 glyph. 의미는 title·status가 이미 전한다 |
| `renderIcon`(Native) | `(props: { status, color: string, backgroundColor: string }) => ReactNode` | — | 받은 `color`로 그린다 |
| `headingLevel`(Web) | `1` · `2` | `2` | 화면 전체가 Result면 `1` |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 여백·폭만 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아이콘 원 56×56(Web `3.5rem`), `radius.full`. Web 설명 최대 폭 `40rem` | `.hjm-result__icon`, `.hjm-result__description`, Native `feedback.tsx` |
| 간격 | 안쪽 여백 위아래 `spacing.xxxl` 40, 좌우 `spacing.xl` 24. 요소 사이 `spacing.sm` 12. 행동 줄은 `spacing.xs` 8을 더 띄우고 버튼 사이 `spacing.sm` 12. 목록·카드 사이에 넣을 때는 앞뒤 `layout.sectionGap` 24 | `resultRecipe.paddingVertical`·`paddingHorizontal`·`gap`·`actionsGap`, `.hjm-result__actions` |
| 순서·정렬 | 가운데 정렬 세로 묶음: 아이콘 → 제목 → 설명 → 행동. 행동은 [Button](button.md#배치) 규칙대로 **secondary(둘째) → primary(첫째)** 순서로 그린다(두 표면 동일. 1.12.1까지는 primary가 먼저였다) | `feedback.tsx`(Web·Native Result) |
| 고정·스크롤 | 고정되지 않는다. 화면 전체를 채울 때는 Result를 세로 가운데에 두고 하단 고정 CTA를 따로 붙이지 않는다(행동은 `actions`) | — |
| 좁은 폭·큰 글자 | 행동 줄은 가운데 정렬로 넘치면 다음 줄로 감긴다. 제목·설명은 줄바꿈된다(`overflow-wrap: anywhere`) | `.hjm-result__actions`(flex-wrap), Native `flexWrap: "wrap"` |

```text
┌──────────────────────────────┐
│          (padding 40)        │
│             ( ✓ )  56        │
│          gap 12              │
│        결제를 마쳤어요         │  titleLarge
│      영수증을 메일로 보냈어요    │  body, max 40rem(Web)
│        gap 12 + 8            │
│   [ 홈으로 ] [ 주문 보기 ]    │  secondary → primary, gap 12
│          (padding 40)        │
└──────────────────────────────┘
```

## 꼭 지킬 것

- 행동이 3개 이상이면 `RangeError`를 던진다. 잘리지 않으니 흐름을 다시 설계한다.
- 행동 버튼을 children으로 직접 조립하지 않는다(`children` prop이 없다). `actions`로 넘긴다.
- 아이콘은 제품 소유 glyph다. Web은 `icon`, Native는 `renderIcon`이 주는 `color`를 그대로 쓴다.
  아이콘 배경·tone 색은 HJM(`resultRecipe.tones`) 소유다.
- `failure`는 Web `role="alert"`, Native live region·iOS 낭독으로 바로 알린다. 같은 실패를 Toast로
  한 번 더 알리지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 아이콘 | `icon`(ReactNode) | `renderIcon({ status, color, backgroundColor })` |
| 제목 heading 수준 | `headingLevel` | `accessibilityRole="header"` 고정 |
| 실패 알림 | `role="alert"`(그 외 `status`) | assertive live region, iOS는 `announceForAccessibility` |
| 바깥 배치 | `className`, `layoutStyle`(HTML `style`도 받음) | `layoutStyle`(`style`은 deprecated — 개발 모드 경고, 다음 major 제거) |
