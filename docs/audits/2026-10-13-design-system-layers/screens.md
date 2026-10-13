# 화면 전수 점검과 보강

기준: main `767d47f7` 이후 공유 working copy, 2026-10-13. 기존 Toast·탐색·화면 작업을 보존하고 그 위에서 수정했다. 화면 지침 22개를 검토했다. 이 보고서는 문서·소스·변경 동작 범위의 검토이며 22개 모든 화면의 브라우저/기기 QA가 아니다. 큰 여섯 화면의 자세한 대조는 [토큰 담당 추가 분담](tokens.md#추가-분담-화면-6개)에 있다.

## 구현한 수정

| ID | 문제 | 수정·근거 |
| --- | --- | --- |
| S01 | 빈 대화에서 composer가 사라져 첫 메시지를 보낼 수 없음 | 양 ChatScreen에서 ready/empty에 작성창을 유지. loading/error/restricted는 숨김. 가용성과 권한을 실제 상태로 구분 |
| S02 | 상세 로딩·실패·복구를 detail.content에서 다시 조립해야 함 | 양 ListDetailScreen.detail에 선택 state/stateAction/notice 추가. 목록의 입력·스크롤·Web 포커스 유지, 상세만 중앙 상태 또는 비차단 notice로 복구 |
| S03 | 온보딩 완료 저장 중 이전·건너뛰기로 단계 이동 가능 | complete.pending 또는 skip.pending 동안 다음·이전·완료·건너뛰기를 함께 잠금. 실패 후 같은 단계로 재시도 |
| S04 | 댓글 루트마다 items 전체를 filter하고 expandedIds를 반복 탐색 | 부모별 Map과 펼침 Set을 한 번 생성. 루트·답글 서버 순서를 유지하며 목록 크기에 비례한 그룹화로 변경. 가상화 또는 실기기 성능 개선 실측이라고 주장하지 않음 |
| S05 | 빈 저장 컬렉션이 본문 위의 Text 한 줄로 표시 | SavedItemsScreen에서 공통 empty 상태 사용. 명시한 loading/error/restricted가 우선하고 개요의 만들기 행동은 유지. 커버 네 칸이 같은 membership을 반복 탐색하지 않도록 그룹별 한 번 계산 |
| S06 | 화면 골격의 일반적 상태 표가 제품 요청·초안 소유권을 설명하지 못함 | 최초 조회와 재조회, 즉시/일괄 저장, 첫 작성, 업로드 혼재, 신고/차단, 권한 복귀, 검색의 세 요청 영역을 화면별 표로 보강 |
| S07 | 프로필 예제가 user 조회 전에 handle/summary 평가 | nullable 데이터의 제목·요약 fallback을 명시. 작성 예제의 무조건 ‘초안 저장됨’ 표시도 실제 draftStatus가 있을 때만 표시 |

새 detail prop과 행동 보강은 아직 게시 전이다. 기존 title/content 조합은 호환된다. 게시 예정 변경은 `.changeset/layer-audit-recovery.md`에 기록했다.

## 실제 실행 예제

Web/Native `list-detail-recovery-preview.tsx`를 공개 ListDetailScreen으로 작성하고 기존 목록과 상세 항목에 `상세 조회 실패와 복구` 변형을 추가했다. 목록 메모 입력 → 다음 요청 실패 → 상세 열기 → 해당 상세 재시도 → 목록 복귀를 조작할 수 있다. ActionSession으로 중복 요청·reset 이후 늦은 응답을 처리하며 실제 서버는 없다. 기존 Storybook ID는 유지하고 새 Web ID 하나만 생성기로 추가했다.

## 22개 지침별 검토 범위

| 지침 | 중점 대조·보강 | 실행 경계 |
| --- | --- | --- |
| common-shell | ScreenLayout 상태 교체/notice/footer 소유권 | 기존 중앙 상태 구현 대조; 전체 화면 QA 미실행 |
| common-chat | ChatScreen, empty composer, 전송 snapshot·receipt | 새 양 renderer 회귀 |
| common-comments | CommentThreadScreen 순서·펼침·paging·입력 복구 | 새 양 renderer 순서 회귀; 성능 실측 없음 |
| common-inbox | NotificationInboxScreen, 읽음/조회 실패 분리, 필터 0건 | 소스·문서 대조 |
| common-login | AuthScreenLayout pendingLabel/mainCard, 제공자 취소·실패 | 소스·문서 대조; 실제 제공자 미실행 |
| common-profile | ProfileScreen/EditorScreen, nullable user·초안/계정 전환 | 코드 골격 보강; 실제 API 미실행 |
| common-saved | SavedItemsScreen, undefined/null 구분, 중앙 empty·Undo | 새 양 renderer 회귀 |
| common-search | SearchScreen 제안/확정/필터 개수·취소, 1.13.1 기록 | 소스·문서/CHANGELOG 대조 |
| common-settings | SettingsScreen, 즉시 저장 rollback와 일괄 draft 분리 | 문서·공개 슬롯 대조 |
| notification-settings | draft/saved/제출 snapshot, 처음 받은 값과 기본 false 구분 | 문서·예제 대조 |
| flow-collection | ListDetailScreen 상세 독립 상태·복귀 | 새 양 renderer 회귀·예제 타입 검사 |
| flow-editor | EditorScreen 초안/dirty/저장·라우터 이탈 | 문서·소스 대조 |
| flow-media | MediaSelectionScreen 부분 실패·취소·완료 조건 | 코드 골격 보강; OS 사진·업로드 미실행 |
| flow-moderation | ModerationScreen 사유·신고·차단 각각의 확정 | 소스·문서 대조 |
| flow-onboarding | OnboardingScreen 완료/건너뛰기 진행 중 이동 차단 | 새 양 renderer 회귀 |
| flow-permission | PermissionScreen prompt/denied/granted/unavailable | 소스·문서 대조; OS 권한 미실행 |
| dashboard | 최초/재조회 중앙 상태·기간 선택 | 토큰 담당 전체 본문/대응 소스 대조 |
| discovery-gallery | 검색·카테고리·저장 토글·상세 경계 | 토큰 담당 전체 본문/대응 소스 대조 |
| landing | Surface 공개 합성·서버 저장과 메모리 데모 | 토큰 담당 전체 본문/대응 소스 대조 |
| mockup-studio | 실패 Notice·PNG 재시도 실제 연결 | 타입 검사; 브라우저 내보내기 미실행 |
| product-bento | 제목 Heading 의미·이미지/저장 상태 분리 | 양 Showcase 타입 검사 |
| reference-comparison | 재조회 중 입력·보기 유지 | 문서·소스 대조 |

## 검사

- Web/Native renderer 각각 `tsc -p tsconfig.build.json`, `tsc --noEmit` 통과. 게시되는 dist와 Web CSS 두 형식을 생성했다.
- `packages/react/test/screen-recovery.browser.test.tsx`: Chromium 5/5 통과. 첫 입력, 상세 실패/복귀 포커스, 온보딩 잠금, 댓글 순서, 빈 저장함/명시 오류 우선순위.
- `packages/react-native/test/screen-recovery.test.tsx`: host 렌더 5/5 통과. 동일 계약의 Native props/상태·mount 유지 확인. 처음 fixture의 likeIcon=null 오류를 실제 아이콘으로 수정한 뒤 통과.
- 양 Showcase `tsc --noEmit` 최종 통과. 앞선 구형 dist와 navigation 예제 타입 오류는 생성/수정 후 해소.
- 전체 테스트·Storybook 전체 빌드·최대 OS 글자 조건은 실행하지 않았다. iOS/Android 기기·실제 서버·권한·파일 내보내기·npm 게시·소비 제품 채택·배포는 미실행.
