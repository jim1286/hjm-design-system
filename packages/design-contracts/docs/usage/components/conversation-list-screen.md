# ConversationListScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.46.1 이후)
- 검토일: 2026-10-25
- 근거: 번뚝 목록의 중복 여백·구분선 재발, 양 renderer `src/screens.tsx`
- 스토리북: `배포/화면/소통/대화 목록`

## 언제 쓰나

DM·단체방 대화 목록의 공통 화면이다. 행은 ConversationRow, 데이터·이동·행 메뉴는 제품이 연결한다.
ScreenLayout은 일반 화면 골격이며 대화 목록에서는 여백을 다시 조합하지 않고 이 API를 사용한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 검색 | SearchScreen |
| 알림 | NotificationInboxScreen |
| 목록과 상세 전환 | ListDetailScreen |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ConversationListScreen` | 대화 목록 화면 | `@hjmds/react/screens` | `@hjmds/react-native/screens` |

같은 경로에서 ConversationListScreenProps를 공개한다.

## 최소 사용 예

```tsx
// Web
import { ConversationListScreen } from '@hjmds/react/screens';
<ConversationListScreen title={title} search={searchField} actions={composeAction} state={state}>
  {conversationLinks}
</ConversationListScreen>
```

```tsx
// Native
import { ConversationListScreen } from '@hjmds/react-native/screens';
<ConversationListScreen title={title} search={searchField} actions={composeAction} state={state} scroll="content">
  {virtualizedConversationList}
</ConversationListScreen>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| search | ReactNode | 없음 | 검색 입력 콘텐츠 |
| notice | ReactNode | 없음 | 비차단 조회 오류·안내 |
| children | ReactNode | 없음 | ConversationRow 링크/메뉴 또는 가상화 host |
| actions | ReactNode | 없음 | 새 대화 등 헤더 도구 |
| state, stateAction | ScreenLayout 계약 | ready, 없음 | 로딩·빈 상태·오류·권한 상태와 행동 |
| scroll | screen · content | screen | 가상화 host만 content |


나머지 prop은 [ScreenLayout](screen-layout.md)을 따른다. contentInset은 받지 않고 body-edge를 고정한다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭·헤더 높이는 ScreenLayout, 행 크기는 ConversationRow | 두 공개 구현 |
| 간격 | 헤더·검색 좌우 16, 본문 좌우 0, 행 좌우 16, 검색–안내 12 | screenPatternRecipe.padding, conversationRowRecipe.paddingInline, Stack sm |
| 순서·정렬 | 헤더 → 검색/안내 → 본문 → footer | ConversationListScreen → ScreenLayout |
| 고정·스크롤 | 기본 본문 스크롤, 가상화 host만 scroll=content | ScreenLayout |
| 좁은 폭·큰 글자 | 행과 상태의 기존 반응형 동작 유지 | ConversationRow·ScreenLayout, 최대 글자 조건 제외 |

검색/안내가 모두 없으면 notice 영역을 만들지 않는다. 카드·구분선을 추가하지 않는다.

## 꼭 지킬 것

본문을 카드나 추가 좌우 여백으로 감싸지 않는다. 제품은 데이터·라우팅·메뉴를 연결한다.
배포 표기는 기존 Storybook 화면의 분류이며 새 API의 npm 게시 완료를 뜻하지 않는다.
실제 행을 사용한 브라우저의 시작점 확인과 Native host 검사를 기기 검증으로 확대하지 않는다.
전체 예시는 [대화 목록 화면](../screens/common-conversation-list.md)을 따른다.
