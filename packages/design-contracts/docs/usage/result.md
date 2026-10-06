# Result 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Result](../result.md), recipe `resultRecipe`(`src/result.ts`)

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

상태 화면 조합 전체는 [1.4 제품 채택 가이드 · 상태 화면](../product-adoption-1.4.md#상태-화면)을 따른다.

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Result` | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` | 기본 |

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

- `status`(필수): `success` · `failure` · `info`. 403/404/500 같은 HTTP 의미는 제품이 `failure`와
  자기 문구로 번역한다.
- `title`(필수, `string`), `description`(`string`).
- `actions`: 0~2개. 첫째가 primary Button, 둘째가 secondary Button으로 그려진다. 항목은 `label`·`onAction` 필수,
  `accessibilityLabel` 생략 시 `label`을 쓴다.
- Web `headingLevel`: `1` · `2`(기본). 화면 전체가 Result면 `1`로 둔다.

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
| 바깥 배치 | `className`·`style`(div) | `style`(View) — 배치에만 |
