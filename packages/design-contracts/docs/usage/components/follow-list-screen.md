# FollowListScreen

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.46.1 이후)
- 검토일: 2026-10-25
- 근거: 사용자 Instagram 팔로워 화면 요청, 양 renderer src/follow-list.tsx
- 스토리북: `실험/화면/소통/팔로워와 팔로잉`

## 언제 쓰나

팔로워/팔로잉을 전환하고 사람을 검색하며 각 행에서 팔로우할 때 사용한다.
2026-10-25 사용자 요청에 따라 [Instagram 참고 화면](https://www.soy502.com/articulo/asi-lucira-nueva-barra-busqueda-instagram)의 두 탭·검색·아바타·이름·행 우측 행동 구성을 참고했다. 최신 버전 전체를 복제한다는 의미는 아니다.
## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 프로필의 팔로워 수와 행동 | FollowProfileCard |
| 대화 미리보기 목록 | ConversationListScreen |

FollowProfileCard는 한 프로필의 수치와 행동을 보여 주므로 다수 사람 탐색 화면을 대신하지 않는다.
ConversationListScreen은 대화 미리보기용이다. 이 구성은 ScreenLayout, Tabs, TabPanel, SearchField,
List/ListRow, Avatar, Button과 기존 action session을 합성하며 새 선택/요청 상태 엔진을 만들지 않는다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| FollowListScreen | 관계 목록 화면 | @hjmds/react/follow-list | @hjmds/react-native/follow-list |

`@hjmds/react/follow-list`, `@hjmds/react-native/follow-list`에서
`FollowListScreen`, `FollowListScreenProps`, `FollowListPerson`을 가져온다.

- `title`, `exit`: 대상 사용자 이름과 뒤로가기. Web은 onClick, Native는 onPress.
- `tab`, `onTabChange`: followers 또는 following의 controlled 선택.
- `labels`: followers/following은 서버 수치를 포함한 지역화된 완성 문구다. tabs/search/clearSearch/searching/empty/follow/followed/pending/failed도 제품이 제공한다.
- `people`: 현재 탭·검색에 해당하는 id/username/name/following, 선택적 avatar/disabled.
- `toolbar`, `searchVisible`: 정렬·검색 도구 슬롯과 검색 필드 표시 여부(기본 true).
- `people[].message`: label/accessibilityLabel/onPress로 관계 버튼 대신 메시지 행동을 연결한다. `people[].action`은 삭제 아이콘·관계 메뉴 슬롯이다.
- `query`, `onQueryChange`: 검색 입력. 서버 검색·필터링·페이지네이션은 제품이 소유한다.
- `onOpenProfile(id)`: 행의 프로필 탐색. 행 오른쪽 버튼과 독립된 누르기 대상이다.
- `onFollowChange(id, following)`: 실제 요청과 서버 확정 people 갱신 후 resolve; 실패는 reject.
- `state`, `stateAction`, `footer`: 공통 조회 상태·재시도·추가 로드 연결. 빈 ready 목록은 labels.empty를 중앙 표시한다.

## 최소 사용 예

```tsx
// Web: currentPeople, labels, callbacks는 제품이 공급한다.
import { FollowListScreen } from "@hjmds/react/follow-list";
<FollowListScreen title={title} tab={tab} onTabChange={setTab} labels={labels}
  people={currentPeople} query={query} onQueryChange={setQuery}
  onOpenProfile={openProfile} onFollowChange={changeFollow} />;
```

```tsx
// Native: 같은 controlled 계약을 사용한다.
import { FollowListScreen } from "@hjmds/react-native/follow-list";
<FollowListScreen title={title} tab={tab} onTabChange={setTab} labels={labels}
  people={currentPeople} query={query} onQueryChange={setQuery}
  onOpenProfile={openProfile} onFollowChange={changeFollow} />;
```

양 Showcase의 `src/components/FollowListScreen.stories.tsx`는 공개 import로 실행하는 controlled 예제다.
제품의 현재 탭 목록을 `people`, 조회 상태를 `state`로 공급한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Avatar large 48, ListRow comfortable | avatarRecipe/listRowRecipe |
| 간격 | 탭·검색 spacing.sm 12, 행 행동 spacing.xs 8 | Stack props |
| 순서·정렬 | 헤더 → 탭 → 정렬·검색 도구 → 선택적 검색 → 목록, 행동은 우측 | FollowListScreen |
| 고정·스크롤 | 헤더·검색 유지, 목록은 screen 또는 제품 가상화 host | ScreenLayout.scroll |
| 좁은 폭·큰 글자 | 좁은 폭은 공통 행의 축소·줄바꿈 사용, 최대 글자 조건은 범위 제외 | 루트 지침 |

```text
←                  사용자 이름
       팔로워 1,284       팔로잉 328
       ━━━━━━━━━━━
[ 검색                             ]
(아바타) username         [팔로우]
         표시 이름
(아바타) username         [메시지 보내기]
         표시 이름
```

ScreenLayout 기본 본문 여백 안에서 List appearance=plain, separator=none을 사용한다.
탭은 fitted/standard/underline, 검색과 탭 간격은 spacing.sm(12)이다.
행은 ListRow comfortable/circle, leadingSize=large와 Avatar large(48), 우측 Button small을 쓴다.
이미 팔로우한 회원에게는 `person.message`로 secondary 메시지 버튼을 제공한다. 미팔로우는 제품 테마의 primary다. 팔로우 취소는 제품 action의 더보기 메뉴로 분리한다. 독립 카드와 행 구분선은 없다.
검색 입력으로 진입 즉시 키보드가 열리지 않도록 initialFocus=none을 기본으로 한다.

## 꼭 지킬 것

요청 중 해당 버튼은 로딩과 중복 입력 방지를 제공하며 확인된 관계 문구를 유지한다.
실패하면 같은 행 아래 오류를 알리고 기존 관계를 유지한다. 인물 id가 바뀌거나 행이 사라지면
기존 action session이 해제된다. 탭/검색을 바꿀 때 query 초기화·응답 순서·캐시 정책은 제품 소유다.
실행 예제는 양 Showcase의 `src/components/FollowListScreen.stories.tsx`다.
Web/Native 구현과 테스트는 npm 게시·소비 앱 채택·기기 확인과 별도다.

## 제품 연결

`people[].showFollow=false`는 본인·관계 미확인 시 행동을 숨긴다. `followLabel`과
`followAccessibilityLabel`은 맞팔로우 등 제품 문구, `action`은 삭제 확인 버튼 등 추가 행동이다.
HJM이 두 행동을 `Stack axis=inline gap=xs(8)`로 배치한다.
`notice`는 검색 아래 비차단 조회 오류에 쓰며, Web `href/renderLink`는 링크 탐색을 보존한다.
Native `renderPeople(people, renderPerson)`은 FlatList host를 연결한다. `scroll=content`를 함께 쓰고
renderPerson을 호출해 공통 행과 요청 상태를 유지한다. 이름 보조줄 `name`은 없으면 생략한다.
