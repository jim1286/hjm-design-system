# ProfileSummary

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 1.26.0
- 검토일: 2026-10-16
- 근거: [프로필 화면](../screens/common-profile.md), `src/screen-patterns.ts`의 `profileSummaryRecipe`, 양 renderer `src/screen-flows.tsx`
- 스토리북: 별도 예제 미등록

## 언제 쓰나

프로필의 아바타·이름·배지·통계 수치·행동을 구성한다. 2026-10-15 제품별 프로필 헤더 복제를 없애기 위해 공통 구조를 추출했다. [ProfileScreen](profile-screen.md)의 `summary` 슬롯에 넣는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 팔로우 상태 기계까지 필요한 카드 | [FollowProfileCard](follow-profile-card.md) |
| 프로필 화면 전체 틀 | [ProfileScreen](profile-screen.md) |
| 목록 안 사용자 한 행 | [ListRow](list-row.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ProfileSummary` | 프로필 머리 요약 | `@hjmds/react/screen-flows` | `@hjmds/react-native/screen-flows` |

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

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| name | string | 필수 | 제목(이름) |
| avatar | ReactNode | 필수 | 원형 72 프레임 안에 넣는 아바타 |
| headingLevel | 1~6 | 2 | 이름 제목 수준 |
| badge | ReactNode | 없음 | 이름 옆 배지 |
| nameActions | ReactNode | 없음 | 이름 행의 행동 |
| stats | `{id,value,label,onPress?,disabled?}[]` | `[]` | 통계 수치. `onPress`가 있으면 버튼 |
| actions | ReactNode | 없음 | 수치 아래 행동 줄 |
| children | ReactNode | 없음 | 하단 footer |

`stats`는 각 수치의 독립 행동을 보존하며 조회·팔로우·인증·라우팅은 앱에서 연결한다. 팔로우 상태 기계까지 필요한 경우 기존 FollowProfileCard 사용 여부를 먼저 검토한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 원형 아바타 프레임 72 | `profileSummaryRecipe.avatarSize` |
| 간격 | 수치 칸 사이 `spacing.md` 16, 값·라벨 사이 `spacing.xxs` 4, 행동 사이 `spacing.sm` 12. 영역 간격은 [CompositionLayout](composition-layout.md) | 양 renderer |
| 순서·정렬 | 머리(아바타 → 이름·배지 → nameActions) → 수치 줄 → actions → children, 수치 칸은 균등 폭·가운데 | `CompositionLayout` + `flex: 1` 칸 |
| 고정·스크롤 | 없음. ProfileScreen 본문 스크롤 안에 놓인다 | — |
| 좁은 폭·큰 글자 | 수치 칸은 `minWidth: 0`으로 나눠 갖고, 행동 줄은 `wrap` | 양 renderer |

HJM이 원형 72px 아바타 프레임, 이름, 수치, 행동의 순서와 간격을 소유한다. 버튼 수치와 정적 수치는 같은 칸을 차지해 기준선이 어긋나지 않는다.

## 꼭 지킬 것

제품은 `name`, `avatar`, 선택적 `badge`, `nameActions`, `actions`, 하단 `children`을 제공한다. 같은 머리 배치를 별도 View/div로 다시 만들지 않는다. 수치 문구와 숫자 형식은 제품 i18n에서 만든다. 버튼 수치의 접근성 이름은 `값 라벨`로 조립된다.

## 관련 지침

[프로필 화면](../screens/common-profile.md), [ProfileScreen](profile-screen.md), [CompositionLayout](composition-layout.md).
