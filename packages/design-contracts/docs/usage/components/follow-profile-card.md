# FollowProfileCard

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [팔로우 프로필과 행사 참석 계약](../../social-compositions.md), `src/social-compositions.ts`의 `resolveFollowProposal`, 양 renderer `src/social-compositions.tsx`
- 스토리북: `배포/구성/정보 표시/팔로우 프로필`

## 언제 쓰나

프로필 카드에서 팔로우·팔로잉 전환과 팔로워 수를 실제 mutation 결과와 함께 보여 줄 때 쓴다.
Lucian 054를 소비 앱마다 다시 조립하지 않도록 Card·Avatar·Button·AnimatedStatistic과 action-session을 합성했다.
요청 중에는 제안 상태와 수치를 한 번 캡처해 낙관적으로 보여 주고, 실패하면 확정 상태로 돌아간다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 팔로우 행동이 없는 프로필 정보 | `Card` + `Avatar` 또는 `ProfileSummary` |
| 프로필 화면 전체 틀 | `ProfileScreen`(이 카드를 본문에 넣을 수 있음) |
| 행사 참석 응답 | `EventAttendanceCard` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `FollowProfileCard` | 프로필·팔로워 수·팔로우 전환 | `@hjmds/react/social-compositions` | `@hjmds/react-native/social-compositions` |

`FollowProfileState`와 `resolveFollowProposal`은 `@hjmds/design-contracts/social-compositions`에 있다. root barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { FollowProfileCard } from "@hjmds/react/social-compositions";

<FollowProfileCard profileId={profile.id} name={profile.name} description={profile.bio}
  avatar={<ProfileImage src={profile.avatarUrl} />} locale={locale} state={{ following, count }}
  labels={{ follow: t("follow"), following: t("following"), pending: t("followPending"),
    count: t("followers"), error: t("followFailed") }}
  onFollowChange={async next => { const confirmed = await api.setFollow(profile.id, next); setFollowState(confirmed); }} />
```

```tsx
// Native
import { FollowProfileCard } from "@hjmds/react-native/social-compositions";

<FollowProfileCard profileId={profile.id} name={profile.name} description={profile.bio}
  avatar={<ProfileImage source={{ uri: profile.avatarUrl }} />} locale={locale} state={{ following, count }}
  labels={followLabels}
  onFollowChange={async next => { const confirmed = await api.setFollow(profile.id, next); setFollowState(confirmed); }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| profileId | string | 필수 | 비면 `TypeError`. 바뀌면 작업 범위를 remount |
| name | string | 필수 | Card 제목, 기본 Avatar 이름 |
| description | ReactNode | 없음 | Card 설명 |
| avatar | ReactNode | 이름 기반 `Avatar`(장식) | 제품 이미지 host |
| state | `{ following, count }` | 필수 | 서버가 확정한 상태. count는 현재 사용자 포함 |
| locale | string | 필수 | 수치 형식 |
| labels | follow·following·pending·count·error | 필수 | 현지화 문구 |
| onFollowChange | (following) => void \| Promise | 필수 | 실제 요청. 성공 전에 확정 state로 갱신, 실패는 reject |
| disabled | boolean | false | 버튼 비활성 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Card·Avatar·Button 기본 규격 | 양 renderer |
| 간격 | 카드 본문 세로 md | 양 renderer |
| 순서·정렬 | Card(leading 아바타, 제목, 설명) → 팔로워 수(AnimatedStatistic) → 팔로우 버튼 → 오류(가로 중앙) | 양 renderer |
| 고정·스크롤 | 바깥 화면 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | Card 기본 배치를 따름 | Card |

## 꼭 지킬 것

- `state`는 서버 확정값만 전달한다. `following: true`인데 `count: 0`이면 `RangeError`다.
- 성공 callback 안에서 서버 snapshot으로 state를 갱신한 뒤 resolve한다. HJM이 성공 수치를 만들지 않는다.
- 다른 프로필로 바뀌면 `profileId`를 바꾼다. 이전 프로필의 늦은 응답은 새 카드의 오류를 바꾸지 않지만, 제품 캐시 기록은 제품이 맞춘다.

## 상태와 상호작용

| 상태 | 모습 |
| --- | --- |
| 기본 | 확정 수치, `following`이면 selected 버튼과 following 문구 |
| 진행 중 | 제안 상태·수치(±1)를 한 번 캡처해 표시, 버튼 로딩. 같은 요청 중복은 session이 직렬화 |
| 실패 | 확정 props로 복원, 중앙 오류, 같은 버튼으로 재시도 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 진행 중 이름 | 버튼 `aria-label`=pending | Button `loadingLabel`=pending |
| 기본 아바타 | `Avatar aria-hidden` | `Avatar decorative` |
| 수치 전환 의존성 | `statistic-motion`의 `@number-flow/react` peer 필요 | 기존 ContentTransition |
