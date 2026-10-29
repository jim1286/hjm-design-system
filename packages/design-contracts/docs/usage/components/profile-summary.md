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
| avatar | ReactNode | 필수 | 원형 48 프레임 안에 넣는 아바타 |
| headingLevel | 1~6 | 2 | 이름 제목 수준 |
| badge | ReactNode | 없음 | 이름 옆 배지 |
| nameActions | ReactNode | 없음 | 이름 행의 행동 |
| nameEdit | `{label,onAction,disabled?,pending?}` | 없음 | 이름 옆 편집(연필) 아이콘 버튼. 내 프로필에서 닉네임 바꾸기를 연다(2026-10-25, 아래 절) |
| stats | `{id,value,label,onPress?,disabled?}[]` | `[]` | 통계 수치. `onPress`가 있으면 버튼. 한 줄 최대 4칸(`profileSummaryRecipe.stats.maxPerRow`), 넘치면 다음 줄로 가고 마지막 줄도 같은 칸 폭이다 |
| actionsLayout | `inline` · `stacked` · `equal` | `inline` | 가로 보조 행동은 inline 줄바꿈 행, 세로 전체 폭은 stacked, 같은 폭의 가로 행동은 equal(개발 소스) |
| actions | ReactNode | 없음 | 수치 아래 행동 줄. [ProfileScreen](profile-screen.md) `editPlacement="summary"` 안에서는 그 화면의 `edit`이 이 줄 맨 앞에 `secondary` `small` 버튼(`profileSummaryRecipe.editAction`)으로 먼저 들어간다(1.31.0) |
| children | ReactNode | 없음 | 하단 footer |

`stats`는 각 수치의 독립 행동을 보존하며 조회·팔로우·인증·라우팅은 앱에서 연결한다. 팔로우 상태 기계까지 필요한 경우 기존 FollowProfileCard 사용 여부를 먼저 검토한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 원형 아바타 프레임 48. ProfileScreen 수정 행동은 `Button` `secondary` `small` | `profileSummaryRecipe.avatarSize`·`editAction` |
| 간격 | 수치 칸 사이·수치 줄 사이 `spacing.md` 16, 값·라벨 사이 `spacing.xxs` 4, 행동 사이 `spacing.xs` 8. 영역 간격은 [CompositionLayout](composition-layout.md) | 양 renderer |
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

### 같은 폭의 가로 행동 (2026-10-25)

번뚝의 Instagram형 프로필 요청에 따라 `actionsLayout="equal"`은 버튼과 메뉴 trigger를 같은 폭의 한 행으로 배치한다. HJM Grid가 열·간격을 소유하며 fragment는 셀로 세지 않는다. 오류 안내는 actions 밖의 children에 공급한다. 팔로우·해제 메뉴·메시지 경로와 문구는 제품이 연결한다. 기존 inline/stacked 동작은 유지한다.

### 내 프로필: 사진은 사진 변경, 이름 옆 연필은 닉네임 변경 (2026-10-25)

사용자 지시로 모든 앱·웹의 내 프로필 카드에 같은 규칙을 쓴다.

- **사진을 누르면 프로필 사진 변경**이 열린다. `avatar`에 `Avatar action={{label: t("photo.change"), onPress}}`를 넣는다(이미지 고르기·자르기·업로드는 제품 소유).
- **이름 옆에 `nameEdit`(연필 아이콘 버튼)**를 두고 누르면 닉네임 변경이 열린다. 아이콘·크기(`profileSummaryRecipe.nameEdit`, small ghost 36 + hitSlop 4 = 44)·위치(`nameActions` 앞)는 HJM이 소유한다. 연필 그림은 제품 아이콘 세트의 연필을 `nameEdit.icon`으로 넣어 이름 줄의 다른 아이콘(설정 톱니 등)과 같은 선 모양으로 맞춘다. 넣지 않으면 HJM 기본 연필을 그린다.
- 같은 카드에 "프로필 편집"·"사진 바꾸기"·"닉네임 바꾸기" 같은 별도 버튼을 중복으로 두지 않는다. `ProfileScreen`의 `edit`은 이제 선택이며 손님의 로그인 같은 다른 행동에만 쓴다.
- 남의 프로필에는 `nameEdit`를 넣지 않고, 사진은 회원 아바타 기준(확대·신고)을 따른다.
- 제품이 ProfileSummary 대신 고유 머리를 그리는 경우에도 사진 = 사진 변경, 이름 = 닉네임 변경을 지킨다. 이름이 그림(예: Spint 내 정원의 나무 팻말)이면 연필을 따로 두지 않고 그 이름 그림 자체를 닉네임 변경 버튼으로 한다(2026-10-25 사용자 결정).

### 프로필 사진 올리기: 원으로 맞추기 (2026-10-29)

사용자 지시로 모든 앱·웹에서 프로필 사진을 올릴 때 **인스타그램처럼 원 안에서 위치와 크기를 맞춘다.** 시스템 정사각 자르기
(`allowsEditing`, `aspect: [1, 1]`)는 원형 아바타와 모양이 달라 결과를 예측할 수 없었다.

- 사진을 고른 뒤(시스템 편집 끔) `image-viewer` 하위 경로의 `CircularPhotoCropper`를 연다. 끌어서 옮기고 두 손가락(웹은 휠·두 손가락)으로
  확대한다. 원 밖은 어둡게 가리고, 놓으면 원 안에 빈 곳이 생기지 않게 되돌아간다(`clampCircularPhotoCrop`, 최대 `maxZoom` 4배).
- `onConfirm(crop)`은 원본 픽셀 정사각형 `{ originX, originY, width, height }`이다. 제품이 그 영역을 자르고(Native `expo-image-manipulator`
  `crop`, Web canvas) 기존 크기 제한·압축으로 올린다. 자르기·업로드 중에는 `busy`로 두 버튼을 잠근다.
- 정사각형을 저장하고 원 모양은 표시(`cover`)가 만든다. 원형 투명 PNG를 만들지 않는다.
- 글 첨부 사진처럼 원형이 아닌 사진에는 쓰지 않는다.

### 남의 프로필: 사진을 누르면 크게 보기 (2026-10-29)

사용자 지시로 모든 앱·웹의 회원 프로필 화면에서 **그 회원의 프로필 사진을 누르면 사진이 크게 열린다.** Spint 회원 프로필에서
사진을 눌러도 반응이 없었고, Utilverse만 제품 코드로 확대를 따로 만들어 앱마다 동작이 달랐다.

- `avatarView={{ label: t("photo.view"), onPress: () => setViewerOpen(true) }}`를 준다. HJM이 아바타 틀 전체를 이미지 버튼
  (`ImageViewerTrigger`, Native `imagebutton` 역할)으로 만들고 크기·원형·누름 상태를 소유한다.
- 제품은 `image-viewer` 하위 경로의 `ImageViewer`를 연다(Native는 gesture-handler·zoom-toolkit 선택 의존성이 그 경로에만 있다).
  사진 조회·권한·캐시는 `items`/`renderImage`로 공급한다. 사진 신고는 제품의 기존 경로를 유지하며 확대 화면에 둘 때는 `actions`를 쓴다.
- 사진이 없어 이니셜·기본 얼굴만 있으면 `avatarView`를 넣지 않는다(크게 볼 사진이 없다).
- 내 프로필은 사진 = 사진 변경(`Avatar.action`)이므로 `avatarView`를 넣지 않는다. 두 행동을 한 사진에 같이 넣지 않는다.
- 제품 고유 머리(ProfileSummary 대신 그린 카드)도 같은 규칙을 `ImageViewerTrigger` + `ImageViewer`로 지킨다.

### 프로필 카드 틀 (2026-10-25)

같은 날 사용자 지적: Utilverse 프로필 카드(평평한 `default`, radius `lg`)가 BurnTok 카드(`raised` 그림자, 테두리, radius `xl`)와
달라 보였다. ProfileSummary를 카드에 담는 화면은 `Surface tone="raised" bordered radius="xl" padding="md"`로 감싼다(Web·Native 같은 값).
제품 컨셉 때문에 카드 대신 고유 머리를 그리는 화면(Spint 내 정원)은 예외로 그 사유를 코드 주석에 남긴다.

### 손님 카드의 로그인 (2026-10-25)

로그인하지 않은 사용자의 프로필 카드는 로그인이 카드의 주 행동이다. `actionsLayout="stacked"` + `actions`에 전체 폭 primary
`Button` 하나를 둔다. 이름 옆 작은 버튼(`nameActions`)이나 ProfileScreen `edit` 자리(작은 secondary)를 빌리지 않는다 —
Utilverse에서 작은 왼쪽 버튼이 카드 안에서 떠 보였다는 사용자 지적으로 정했다. 손님 카드에는 `nameEdit`와 사진 변경을 두지 않는다.

2026-10-25 사용자 요청으로 회원 아바타 프레임은 `avatarRecipe.sizes.large`(48px 원형)이다. 댓글·채팅처럼 작은 목록의 크기는 바꾸지 않는다.
