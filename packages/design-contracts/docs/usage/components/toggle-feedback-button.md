# ToggleFeedbackButton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [선택 반응 계약](../../toggle-feedback.md), `src/toggle-feedback.ts`의 `resolveToggleFeedbackProposal`·`toggleFeedbackRecipe`, 양 renderer `src/toggle-feedback.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/선택 반응 버튼`

## 언제 쓰나

좋아요·저장·알림 받기처럼 켜고 끄는 선택에 반응 모션과 개수를 붙인다. 누르면 예상 상태(선택·개수)를 바로 보여 주고,
제품이 실제 API 응답으로 확정한 `state`를 다시 넘긴다. 실패하면 확정 상태로 돌아가고 오류를 알린다.
효과는 `ripple`(종) · `ribbon`(책갈피) · `burst`(하트) 세 가지이며 선택으로 바뀌는 순간에만 재생한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 개수·모션 없는 켜기/끄기 | [Button](button.md)의 `selected`, [Switch](switch.md) |
| 설정 값 켜기/끄기 | [Switch](switch.md) |
| 팔로우 상태 기계 | [FollowProfileCard](follow-profile-card.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ToggleFeedbackButton` | 선택 반응 버튼 + 개수 | `@hjmds/react/toggle-feedback` | `@hjmds/react-native/toggle-feedback` |

`ToggleFeedbackState`·`ToggleFeedbackEffect` 타입은 `@hjmds/design-contracts/toggle-feedback`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { ToggleFeedbackButton } from "@hjmds/react/toggle-feedback";

<ToggleFeedbackButton entityId={post.id} effect="burst" locale={locale}
  state={{ selected: post.liked, count: post.likeCount }} labels={likeLabels}
  onSelectedChange={async selected => { const next = await setLike(post.id, selected); updatePost(next); }} />
```

```tsx
// Native
import { ToggleFeedbackButton } from "@hjmds/react-native/toggle-feedback";

<ToggleFeedbackButton entityId={post.id} effect="burst" locale={locale}
  state={{ selected: post.liked, count: post.likeCount }} labels={likeLabels}
  onSelectedChange={async selected => { const next = await setLike(post.id, selected); updatePost(next); }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `entityId` | string | 필수 | 안정적인 id. 비면 던지고, 바뀌면 진행 상태를 새로 시작한다 |
| `state` | `{ selected, count }` | 필수 | 확정 상태. `count`는 0 이상 정수, 선택인데 0이면 `RangeError` |
| `effect` | `"ripple"` · `"ribbon"` · `"burst"` | 필수 | 아이콘 모양과 반응 모션 |
| `locale` | string | 필수 | 개수 형식 |
| `labels` | `{ select, selected, pending, count, error }` | 필수 | 버튼 문구·진행 중 이름·개수 라벨·실패 문구 |
| `onSelectedChange` | `(selected) => void \| Promise<void>` | 필수 | 실제 API를 호출하고 확정 `state`를 갱신한 뒤 끝낸다 |
| `icon` · `renderIcon` | ReactNode · `({ selected, pending }) => ReactNode` | 기본 효과 아이콘 | 제품 아이콘. `renderIcon`이 우선 |
| `disabled` | boolean | false | 잠금 |
| `active` | boolean | true | false면 잠그고 모션·개수 애니메이션을 끈다(화면 밖 등) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아이콘 24, 효과 영역 40(아이콘 둘레 −8 오프셋), 버튼은 `secondary` [Button](button.md) 기본 `medium`(높이 44) | `toggleFeedbackRecipe` `glyphSize`·`effectSize` |
| 간격 | 버튼과 개수 사이 `spacing.md` 16, 버튼 줄과 실패 문구 사이 `spacing.sm` 12 | `Stack gap="md"`, 바깥 `gap="sm"` |
| 순서·정렬 | [아이콘+문구 버튼] → 개수(`AnimatedStatistic` `compact`), 세로 가운데 맞춤. 실패 문구는 아래 가운데 | 양 renderer |
| 고정·스크롤 | 없음. 카드·행 안 행동 영역에 둔다 | — |
| 좁은 폭·큰 글자 | 버튼 줄이 `wrap`으로 줄바꿈 | `Stack axis="inline" wrap` |

## 꼭 지킬 것

- 개수를 타이머·클라이언트 계산으로 확정하지 않는다. 진행 중 표시만 예상값이고 확정은 API 응답 `state`다.
- 모션은 비선택→선택 전환에서만 재생한다. 동작 줄이기, `active={false}`, 화면이 숨겨진 상태에서는 즉시 마지막 프레임으로 끝낸다.
- 이미 선택된 상태로 처음 그려지거나 환경이 바뀌어도 모션을 다시 재생하지 않는다.
- 문구·개수 라벨은 제품 i18n에서 만든다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 진행 중 이름 | `aria-label={labels.pending}` | `loadingLabel={labels.pending}` |
| 모션 | `requestAnimationFrame`, `visibilitychange`로 숨김 시 종료 | `Animated.timing`, `AppState`가 active가 아니면 종료 |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"` |

## 관련 지침

[선택 반응 버튼](../compositions/toggle-feedback.md), [Button](button.md), [Statistic](statistic.md).
