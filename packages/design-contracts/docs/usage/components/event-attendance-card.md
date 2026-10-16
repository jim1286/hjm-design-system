# EventAttendanceCard

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: `src/social-compositions.ts`의 `resolveAttendanceProposal`·`resolveAttendanceChoice`, 양 renderer `src/social-compositions.tsx`, [소셜 구성](../compositions/social-compositions.md)
- 스토리북: `배포/구성/선택과 필터/행사 참석 응답`

## 언제 쓰나

행사·모임 카드에서 일정, 참석자 수, 참석자 목록을 보여 주고 참석 응답(참석·미정·불참 등)과 캘린더 추가를
실제 요청으로 처리할 때 쓴다. 응답 요청 중에는 제안한 응답과 참석자 수를 먼저 보여 주고, 실패하면 제품이
확인한 `state`로 되돌린다. 네트워크·인증·저장은 제품이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 프로필 팔로우 | `FollowProfileCard`([소셜 구성](../compositions/social-compositions.md)) |
| 요청 없이 선택만 하는 응답 | [SegmentedControl](segmented-control.md) 또는 [RadioGroup](radio-group.md) |
| 일반 정보 카드 | [Card](card.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `EventAttendanceCard` | 행사 참석 응답·캘린더 추가 카드 | `@hjmds/react/social-compositions` | `@hjmds/react-native/social-compositions` |

`AttendanceChoice`·`EventAttendanceState` 타입과 `resolveAttendanceProposal`은 `@hjmds/design-contracts/social-compositions`에서 import한다.

## 최소 사용 예

```tsx
// Web
import { EventAttendanceCard } from "@hjmds/react/social-compositions";

<EventAttendanceCard eventId={event.id} title={event.title} dateLabel={formatEventDate(event)}
  locale={locale} state={attendance} choices={choices} participants={participants}
  labels={{ response: t("rsvp.title"), pending: t("common.pending"), count: t("rsvp.count"),
    calendar: t("rsvp.calendar"), calendarAdded: t("rsvp.calendarAdded"), error: t("rsvp.error") }}
  onResponseChange={async id => setAttendance(await saveResponse(event.id, id))}
  onAddToCalendar={() => addEventToCalendar(event)} />
```

```tsx
// Native
import { EventAttendanceCard } from "@hjmds/react-native/social-compositions";

<EventAttendanceCard eventId={event.id} title={event.title} dateLabel={formatEventDate(event)}
  locale={locale} state={attendance} choices={choices} participants={participants}
  labels={{ response: t("rsvp.title"), pending: t("common.pending"), count: t("rsvp.count"),
    calendar: t("rsvp.calendar"), calendarAdded: t("rsvp.calendarAdded"), error: t("rsvp.error") }}
  onResponseChange={async id => setAttendance(await saveResponse(event.id, id))}
  onAddToCalendar={() => addEventToCalendar(event)} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| eventId | string | 필수 | 비어 있으면 오류. 바뀌면 내부 요청 상태를 새로 시작한다 |
| title / description | string / ReactNode | title 필수 | Card 제목·설명 |
| dateLabel | string | 필수 | 제품이 현지화한 일정 문구 |
| state | `{ responseId: string \| null; count: number }` | 필수 | 서버가 확인한 응답과 참석자 수. 참석 응답인데 수가 0이면 오류 |
| choices | `readonly AttendanceChoice[]`(`id`·`label`·`attending`·`disabled?`) | 필수 | 비어 있거나 id 중복이면 오류 |
| participants | `{ id; name; avatar? }[]` | 필수 | 아바타가 없으면 이름 Avatar를 장식으로 표시 |
| locale | string | 필수 | 참석자 수 `AnimatedStatistic` 숫자 형식 |
| labels | `response`·`pending`·`count`·`calendar`·`calendarAdded`·`error` | 필수 | 문구 |
| onResponseChange | `(responseId) => void \| Promise<void>` | 필수 | 실제 응답 저장. 끝나면 `state` 갱신 |
| onAddToCalendar | `() => void \| Promise<void>` | 필수 | 기기 캘린더·권한 어댑터. reject하면 재시도 가능 |
| disabled | boolean | false | 모든 행동 비활성 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채우는 Card, 높이는 내용 | [Card](card.md) |
| 간격 | 본문 요소 사이 `spacing.md` 16, 참석자 사이·아바타–이름·응답 버튼 사이 `spacing.xs` 8 | `Stack gap="md"`, `Stack axis="inline" gap="xs"` |
| 순서·정렬 | Card 제목·설명 → 일정 → 참석자 수 → 참석자 목록 → 응답 제목(strong) → 응답 버튼 행 → 캘린더 버튼(secondary) → 실패 문구(중앙) | 양 renderer |
| 고정·스크롤 | 자체 스크롤 없음. 카드 목록 스크롤은 부모 | [Card](card.md) |
| 좁은 폭·큰 글자 | 참석자 목록과 응답 버튼 행은 줄바꿈(`wrap`) | `Stack wrap` |

## 꼭 지킬 것

- `onResponseChange`는 실제 저장이 끝난 뒤 resolve하고, 서버가 확인한 `state`를 다시 넘긴다. 참석자 수를 제품에서 따로 더하지 않는다(제안 수는 요청 시작 때 한 번 계산한다).
- 캘린더 추가는 실제 기기·계정 캘린더 어댑터를 연결한다. 성공하면 버튼이 `calendarAdded` 문구로 바뀌고 비활성된다.
- 참석자 목록·권한·알림은 제품 데이터다. 카드 안 배치를 제품 레이아웃으로 다시 조립하지 않는다.

## 상태와 상호작용

| 상태 | 모습 | 동작 |
| --- | --- | --- |
| 기본 | 현재 응답 버튼 `selected` | 같은 응답·비활성 응답 누름은 무시 |
| 진행 중 | 제안 응답 선택·수 반영, 해당 버튼 로딩, 모든 행동 잠금 | 캘린더 요청 중에는 캘린더 버튼만 로딩, 응답·수는 `state` 그대로 |
| 실패 | `state`로 복귀, `labels.error` 중앙 표시 | Web `role="alert"`, Native `accessibilityRole="alert"`·assertive. 같은 행동으로 재시도 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 진행 중 이름 | `aria-label={labels.pending}` | `loadingLabel={labels.pending}` |
| 기본 아바타 | `Avatar aria-hidden` | `Avatar decorative` |
