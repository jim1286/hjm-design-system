# ProfileSummary

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.26.0
- 검토일: 2026-10-19
- 근거: [프로필 화면](../screens/common-profile.md), `src/screen-patterns.ts`의 `profileSummaryRecipe`, 양 renderer `src/screen-flows.tsx`
- 스토리북: `배포/컴포넌트/데이터 표시/프로필 요약`

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
| actionsLayout | `inline` · `stacked` | `inline` | 미게시. 가로 보조 행동은 기존 줄바꿈 행, 팔로우/메시지처럼 같은 폭의 주·보조 행동은 stacked로 세로 배치 |
| actions | ReactNode | 없음 | 수치 아래 행동 줄. [ProfileScreen](profile-screen.md) `editPlacement="summary"` 안에서는 그 화면의 `edit`이 이 줄 맨 앞에 `secondary` `small` 버튼(`profileSummaryRecipe.editAction`)으로 먼저 들어간다(1.31.0) |
| children | ReactNode | 없음 | 하단 footer |

`stats`는 각 수치의 독립 행동을 보존하며 조회·팔로우·인증·라우팅은 앱에서 연결한다. 팔로우 상태 기계까지 필요한 경우 기존 FollowProfileCard 사용 여부를 먼저 검토한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 원형 아바타 프레임 72. ProfileScreen 수정 행동은 `Button` `secondary` `small` | `profileSummaryRecipe.avatarSize`·`editAction` |
| 간격 | 수치 칸 사이 `spacing.md` 16, 값·라벨 사이 `spacing.xxs` 4, 행동 사이 `spacing.xs` 8. 영역 간격은 [CompositionLayout](composition-layout.md) | 양 renderer |
| 순서·정렬 | 머리(아바타 → 이름·배지 → nameActions) → 수치 줄 → actions → children, 수치 칸은 균등 폭·가운데 | `CompositionLayout` + `flex: 1` 칸 |
| 고정·스크롤 | 없음. ProfileScreen 본문 스크롤 안에 놓인다 | — |
| 좁은 폭·큰 글자 | 수치 칸은 `minWidth: 0`으로 나눠 갖고, 행동 줄은 `wrap` | 양 renderer |

HJM이 원형 72px 아바타 프레임, 이름, 수치, 행동의 순서와 간격을 소유한다. 버튼 수치와 정적 수치는 같은 칸을 차지해 기준선이 어긋나지 않는다.

## 꼭 지킬 것

제품은 `name`, `avatar`, 선택적 `badge`, `nameActions`, `actions`, 하단 `children`을 제공한다. 같은 머리 배치를 별도 View/div로 다시 만들지 않는다. 수치 문구와 숫자 형식은 제품 i18n에서 만든다. 버튼 수치의 접근성 이름은 `값 라벨`로 조립된다.

## 관련 지침

[프로필 화면](../screens/common-profile.md), [ProfileScreen](profile-screen.md), [CompositionLayout](composition-layout.md).

### 세로 행동과 아바타 그림

2026-10-19 번뚝 공개 프로필의 Web inline flex 안에 제품 Stack을 넣으면 fullWidth 버튼도 좁게 모였다. `actionsLayout="stacked"`가 양 renderer의 전체 폭·세로8 간격을 소유한다. actions에는 버튼을 fragment로 공급하며 제품에서 같은 기본 Stack을 다시 조립하지 않는다. 기본 inline과 ProfileScreen의 edit 삽입은 유지한다. 여러 수치/관계 목록 이동/별도 메시지 행동을 가진 요약이며 단일 관계 수치·팔로우 proposal을 제공하는 FollowProfileCard와 역할이 다르다.

Web의 텍스트/이모지 artwork는 원형72 프레임 안에서 glyph.xxl48 크기로 중앙 배치한다. SVG/사진 콘텐츠는 프레임을 채우고 제품에서 별도 아바타 좌표를 보정하지 않는다. Native의 Avatar/제품 이미지 adapter는 같은72 프레임 안에 콘텐츠를 공급한다.

```tsx
<ProfileSummary name={name} avatar={avatar} stats={stats} actionsLayout="stacked"
  actions={<><Button fullWidth onClick={follow}>{followLabel}</Button><Button fullWidth tone="secondary" onClick={message}>{messageLabel}</Button></>} />
// Native는 같은 actionsLayout에 Button.onPress를 연결한다.
```
