# ProfileSummary

- 단계: 구성
- 상태: 후보
- 지원: Web · Native
- 근거: [프로필 화면](../screens/common-profile.md)

## 언제 쓰나
프로필의 아바타·이름·배지·통계 수치·행동을 구성한다. 2026-10-15 제품별 프로필 헤더 복제를 없애기 위해 공통 구조를 추출했다.

## 공개 이름과 import
Web은 `@hjmds/react/screen-flows`, Native는 `@hjmds/react-native/screen-flows`의 `ProfileSummary`를 쓴다.

## 최소 사용 예
```tsx
// Web
import { ProfileSummary } from '@hjmds/react/screen-flows';
<ProfileSummary name={name} avatar={avatar} stats={stats} actions={actions} />
```
```tsx
// Native
import { ProfileSummary } from '@hjmds/react-native/screen-flows';
<ProfileSummary name={name} avatar={avatar} stats={stats} actions={actions} />
```

## 배치와 소유권
HJM이 원형 72px 아바타 프레임, 이름, 수치, 행동의 순서와 간격을 소유한다. 제품은 `name`, `avatar`, 선택적 `badge`, `nameActions`, `actions`, 하단 `children`을 제공한다. `headingLevel` 기본값은 2다.
`stats`는 `{id,value,label,onPress?,disabled?}` 목록이다. 각 수치의 독립 행동을 보존하며 조회·팔로우·인증·라우팅은 앱에서 연결한다. 팔로우 상태 기계까지 필요한 경우 기존 FollowProfileCard 사용 여부를 먼저 검토한다.
