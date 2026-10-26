# 팔로워와 팔로잉

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.47.0
- 검토일: 2026-10-25
- 근거: 사용자 Instagram 팔로워 화면 요청
- 스토리북: `배포/화면/소통/팔로워와 팔로잉`

## 목적

두 관계 목록을 검색하고 프로필로 이동하며 팔로우한다. [FollowListScreen](../components/follow-list-screen.md)이 전체 화면을 소유한다.

## 영역 구조

```text
헤더 → 관계 탭 → 정렬·검색 도구 → 검색·안내 → 인물 목록
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | FollowListScreen | route 본문 | ScreenLayout 기본 16 여백 |
| 탐색 | Tabs·SearchField | 헤더 아래 | spacing.sm 12 |
| 인물 | List·ListRow | 스크롤 본문 | 48px 원형 아바타, comfortable, separator none |

뒤로가기·대상 이름 → 팔로워/팔로잉 수치 탭 → 검색·비차단 안내 → 평평한 인물 목록.
48px 원형 아바타·사용자 이름·선택적인 표시 이름은 왼쪽, 팔로우하기·맞팔로우하기 또는 메시지 보내기는 오른쪽이다. 내 팔로워의 삭제는 X 아이콘, 팔로잉의 취소는 더보기 메뉴에 둔다.

2026-10-25 사용자 참고 화면과 후속 지시를 반영했다. 일반 회원 아바타는 48px 원형으로 통일하며 댓글·채팅의 작은 크기는 유지한다. 이미 팔로우한 회원의 버튼에 탭과 같은 “팔로잉”을 반복하지 않는다.

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 뒤로가기 | ScreenLayout.exit | 헤더 왼쪽 | 하나 |
| 팔로우 | Button primary/secondary | 행 우측 | 제품 자격에 따라 0~1 |
| 추가 행동 | 제품 action | 팔로우 다음 | 선택적 |

뒤로가기는 헤더 왼쪽, 프로필 이동은 행, 팔로우와 삭제 확인은 독립된 우측 행동이다.

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 인물 목록 | 탐색·팔로우 |
| 로딩 | 중앙 로딩 | 조회 대기 |
| 빈 | 중앙 empty 문구 | 검색 변경 |
| 오류 | 중앙 조회 오류 또는 행 요청 오류 | 재시도 |

초기 로딩·오류·빈 목록은 공통 본문 상태다. 갱신 실패는 notice와 캐시 목록을 함께 유지한다.
팔로우 진행·실패는 해당 행에서만 표시한다.

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [FollowListScreen](../components/follow-list-screen.md) | 전체 화면과 제품 슬롯 |

[FollowListScreen](../components/follow-list-screen.md)의 슬롯·배치·소유권을 따른다.

## 코드 골격

Web/Native `src/components/FollowListScreen.stories.tsx`의 실제 공개 API 예제를 사용한다.

```tsx
// Web
import { FollowListScreen } from "@hjmds/react/follow-list";
```

```tsx
// Native
import { FollowListScreen as NativeFollowListScreen } from "@hjmds/react-native/follow-list";
// 양 renderer의 실행 props는 위 Storybook 예제에서 제공한다.
```

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | 제품 Provider의 토큰 색상 적용 |
| 좁은 폭 | 공통 행의 텍스트 축소·줄바꿈 |
| 최대 글자 | 루트 지침에 따라 범위 제외 |

제품 Provider 테마와 공통 행 동작을 따른다. 최대 글자 조건은 루트 지침대로 범위 제외다.

2026-10-25 후속 조정: 더보기는 세로 점 세 개(`moreVertical`)다. 정렬 기준은 우측에 놓고 검색창은 바로 아래 항상 보인다. 정렬·검색 간격은 spacing.xs(8)다. 번뚝의 최신순은 팔로우 관계 생성 시각 내림차순이며 이름순도 선택할 수 있다.
