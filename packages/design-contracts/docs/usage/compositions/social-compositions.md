# 팔로우 프로필과 행사 참석 응답

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [사회적 행동 계약](../../social-compositions.md), 양 renderer의 `src/social-compositions.tsx`
- 스토리북: `배포/구성/정보 표시/팔로우 프로필`, `배포/구성/선택과 필터/행사 참석 응답`

## 언제 쓰나

프로필 팔로우나 행사 참석 응답의 실제 요청과 수치의 실패 복구가 필요할 때 사용한다.
화면 틀이 필요하면 ProfileScreen의 summary/본문에 넣고, 단순 정보만 보여주면 기존 Card를 쓴다.
Web은 기존 AnimatedStatistic과 같은 `@number-flow/react` peer가 필요하다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| FollowProfileCard | Card · Avatar · AnimatedStatistic · Button으로 프로필·팔로워·controlled follow 요청 | [Card](../components/card.md) |
| EventAttendanceCard | Card · Avatar · AnimatedStatistic · Button으로 행사·참석·캘린더 연결 | [Avatar](../components/avatar.md) |

## 배치

```text
팔로우 프로필                      행사 참석 응답
[Avatar] 이름 · 소개               제목 · 소개
팔로워 수                         날짜/시간
[팔로우 / 팔로잉]                  참석 인원 → 확인된 참가자 Avatar + 이름
                                  응답 제목 → [참석] [미정] [불참]
                                  [캘린더 연결]
오류: 해당 카드 내부 중앙          오류: 해당 카드 내부 중앙
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Card | 본문·목록·ProfileScreen 안 | 기존 Card recipe |
| 프로필 header | Avatar · Card title/description | 상단 leading → 이름·소개 | 기존 Card와 Avatar 기본 크기 |
| 본문 | AnimatedStatistic · Button · Text | 수치 → 주요 행동 → 오류 | Stack gap=md (`spacing.md`, 16px) |
| 행사 | Text · AnimatedStatistic · Avatar · Button | 날짜 → 인원 → 참가자 → 응답 → 캘린더 → 오류 | Stack gap=md (`spacing.md`, 16px) |
| 참가자·응답 행 | Stack | inline, 폭이 모자라면 wrap | gap=xs (`spacing.xs`, 8px) |
| 오류 | Text | 자신의 안내 영역 가로·세로 중앙 | 임의 상단 margin 없음 |

## 흐름과 상태

1. 제품이 확인한 `state`, 선택지, 문구, locale과 실제 async callback을 전달한다.
2. 요청 중에만 제안한 선택/수치를 표시하며 중복 mutation을 막는다.
3. 제품은 callback에서 서버 확정 snapshot으로 state를 갱신한 뒤 resolve해야 한다. 성공 snapshot이 예측과 달라도 제품 값이 우선한다.
4. 참가자 avatar 목록에는 서버가 확인한 사람만 넣으며 HJM이 가상의 참석자를 추가하지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 확인된 선택·수치·참가자 | Button의 기존 선택·키보드 계약 |
| 진행 중 | 캡처한 제안 선택·수치, 행동 잠금 | 로딩은 버튼 안, 수치 전환은 AnimatedStatistic |
| 실패 | 현재 confirmed state로 복구, 중앙 오류 | Web alert / Native assertive, 같은 행동 재시도 |
| 캘린더 완료 | 실제 callback fulfilled 후 완료 label | 같은 mount에서 중복 추가 차단 |
| 엔티티 변경 | 새 profileId/eventId의 상태 | 이전 응답은 새 카드에 반영하지 않음 |

캘린더 callback은 권한·실제 저장 결과를 책임진다. 기기 저장 전 완료를 반환하지 않는다.
사용자 로그인, API idempotency, 캐시 갱신, 이전 엔티티 응답의 캐시 배치는 제품이 소유한다.

## 코드 골격

```tsx
// Web
import { FollowProfileCard } from "@hjmds/react/social-compositions";
<FollowProfileCard profileId={profile.id} name={profile.name} avatar={profileAvatar}
  state={confirmedFollowState} locale={locale} labels={followLabels}
  onFollowChange={async following => {
    const confirmed = await api.setFollow(profile.id, following);
    updateProfileCache(profile.id, confirmed);
  }} />;
```

```tsx
// Native
import { EventAttendanceCard } from "@hjmds/react-native/social-compositions";
<EventAttendanceCard eventId={event.id} title={event.title} dateLabel={dateLabel}
  state={confirmedAttendance} choices={localizedResponseChoices}
  participants={confirmedParticipants} locale={locale} labels={attendanceLabels}
  onResponseChange={async responseId => {
    const confirmed = await api.respond(event.id, responseId);
    updateEventCache(event.id, confirmed);
  }}
  onAddToCalendar={async () => { await calendarAdapter.saveConfirmedEvent(event); }} />;
```

두 플랫폼은 같은 props와 shared resolver를 사용한다. `avatar` 슬롯만 플랫폼 이미지 host에 맞춘다.
실행되는 전체 예제는 Web `showcase/web/src/patterns/social-compositions-preview.tsx`,
Native `showcase/native/src/social-compositions-preview.tsx`에 있다. 예제 어댑터를 제품 API로 복사하지 않는다.
