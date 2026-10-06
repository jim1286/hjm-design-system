# Utilverse 대화·도구함 채택 판단

검토일: 2026-10-07. 소비 `fa201bc90e4c94219de0f4f51ac0328987ad1cb2`, HJM `fbf43bf`.
두 화면 전체 소스와 HJM Native `screens.tsx`, `data-display.tsx`, `actions.tsx`,
`feedback.tsx`, `carousel.tsx`, 내부 MessageReactions 및 사용 지침을 대조했다.
소비 파일 hash는 [inventory](utilverse-ui-adoption-inventory.json)에 보존한다.
이는 소스 검토이며 기기 QA·소비 코드 수정·npm 게시가 아니다.

## 대화 화면

`ConversationScreen.tsx`는 이미 ChatScreen과 ChatMessage를 사용한다. 첫 검색의
Pressable/NativeText 발견만으로 메시지 전체를 자체 UI라고 분류하지 않는다.

| 영역 | 채택 판단 | 유지할 동작과 검증 |
| --- | --- | --- |
| 반응 집계 Pressable + NativeText | ChatMessage `actions`에 HJM Button 한 개, 집계 문자열과 지역화된 이름을 공급 | 현재 버튼은 선택 변경이 아니라 메시지 메뉴를 연다. ReactionPicker로 바꾸면 행동이 달라진다. 반응별 개수와 메뉴 열기 유지 |
| 빈 대화 | EmptyState `illustration/title/description`, 공개 대화 고지는 인접 Text | 제품 방 그림과 공개 안내 보존. 초기 화면은 불필요한 announcement를 하지 않음 |
| 조회 실패·실시간 연결 끊김 | Notice `title/description/action`의 재시도 | 두 실패는 다른 요청이다. offline 재연결을 목록 refetch로 합치지 않음; API 미설정 때 retry 비활성 유지 |
| 답장 초안 | MessageComposer `replyTo`의 author/excerpt/cancelLabel/onCancel 대조 후 통합 | 삭제된 원문 안내, inputLocked 중 취소 금지, 현재 입력 유지. SocialPhotoPicker 전체 구현 검토 전 확정하지 않음 |
| 메시지 삭제 확인 | AlertDialog 계약과 추가 대조 | 현재 inline 확인→durable DELETE→불확실 상태 재확인. UI 교체로 새 요청·새 identity를 생성하지 않음 |
| 프로필 | 기존 Avatar host 채택 계획 적용 | 32 폭 wrapper가 터치 대상을 제한한다. 그림 크기만 확대하거나 hitSlop만 늘려 해결했다고 하지 않음 |

반응 집계만 있는 메시지도 자식 Pressable을 가진다. 현재 `interactiveContent`는 사진/도구만
검사하므로 false가 될 수 있고 Native MessageReactions는 이때 부모를 accessible로 묶는다.
스크린리더에서 집계 버튼이 독립 대상인지 기기 확인이 필요하다. 집계 버튼을 공개 `actions`
슬롯으로 옮기면 말풍선 접근성 그룹 밖에서 기존 메뉴 행동을 제공할 수 있다. 새 집계 API를
만들기 전에 이 경로를 검증한다. 슬롯은 시각 옆 inline Stack이므로 긴 집계·시간의 줄바꿈도
확인하며, 좁은 화면에서 실패하면 공통 배치 계약을 개선한다.

HJM 화면의 기본 `scroll="content"`는 제품 소유 ScrollView와 맞는다. 제품 ScrollView에는
이전 페이지 조회, 중복 메시지 제거, 바닥 추적, 답장 원문까지 추가 페이지 읽기, 측정 offset
이동이 연결돼 있다. 이를 일반 목록으로 바꾸거나 별도 KeyboardAvoiding을 중첩하지 않는다.
키보드 host·50ms 후 scrollToEnd·모션 감소 조합은 별도 runtime 검증 대상이다.

제품이 유지할 것은 scope별 writer/owner, receipt 후 초안 초기화, 같은 clientMessageId의
불확실 전송 재확인, 로컬 초안 저장 실패, account/channel 변경 시 remount, 읽기 전용 채널,
reply 원문 소실에 따른 전송 금지, 사진 선택 중 전송 금지, 링크 수·본문 schema 검증이다.
API callback 호출을 서버 성공으로 보고하지 않는다. 도구 카드의 고정 240 폭과 긴 메시지,
아바타 32 폭, 반응 집계의 큰 글자는 적용 시 함께 확인한다.

## 도구함

| 영역 | 채택 판단 | 유지할 동작과 검증 |
| --- | --- | --- |
| 검색 Button + Stack + artwork + 설명 | ListRow `title/description/leading/trailing/onPress` | 같은 도구 실행/소개 라우팅 유지. leading recipe는 40이므로 현재 44 그림을 그대로 넣어 잘리게 하지 않음 |
| 빈 검색·즐겨찾기·최근 사용 | EmptyState title/description | 세 문구·원인을 구분. 검색 입력 debounce와 width 측정 대기 중 가짜 empty를 표시하지 않음 |
| 추천 조회·로컬 최근 기록 실패 | Notice + 해당 retry | 서버 refetch와 로컬 document.load를 구분. 추천 실패에도 기본 도구 접근 유지 |
| 앱 타일 PressableTile | 공통 상호작용 계약 추가 비교 필요 | Button은 onLongPress를 받지만 Card는 Pressable이 아니다. IconButton의 glyph 틀에 48–68 artwork를 억지로 넣지 않음 |
| Grid | 이미 HJM; 유지 | 측정한 availableWidth, 글자 크기별 4/3/2열, locale/session 변경 시 측정 초기화 유지 |
| 가로 FlatList pager | 제품 host 유지, 공통 pager 적합성 후속 검토 | native paging·처음 한 페이지만 mount·windowSize 3·측정 높이·선택 offset 소유. 모든 slide를 렌더하는 Carousel로 대체 확정하지 않음 |
| 페이지 점 | 기존 HJM Button + 제품 표시 | 선택 위치와 페이지 수 label 보존. Carousel 전체 도입을 점 교체의 전제로 삼지 않음 |

타일은 누르면 실행/소개, 길게 누르면 HomeToolPreview, 잠금 상태면 실행 불가와 별도 소개
버튼이라는 계약이다. press scale 0.94, release haptic, 모션 감소 시 opacity 및 설정 변경 중
진행 중 spring 종료를 비교해야 한다. 단순 Button 교체로 peek·피드백을 잃지 않는다.
추천 숨김과 즐겨찾기·최근 사용·검색 접근은 서로 다른 제품 상태이며 필터 순서를 보존한다.
검색 analytics는 empty_result만 기록하고 검색 원문을 전송하지 않는다.

전체 consumer 채택 전에는 두 화면에서 참조하는 SocialPhotoPicker, ChatMessageSheet,
HomeToolPreview, home-page-layout 등의 파일을 별도 상세 검토한다. 이번 두 파일 검토를
그 의존 파일의 검토 완료로 전파하지 않는다. 다섯 shell theme, light/dark, 큰 글자, RTL,
iOS/Android, VoiceOver/TalkBack 및 실 요청 실패 복구는 아직 미검증이다.
