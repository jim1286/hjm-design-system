# 제품별 테마를 유지하는 UI 채택

검토일: 2026-10-06

사용자 요청: 공통 기능을 가져다 쓰듯 UI 구조와 행동을 재사용한다. 예제 복사와 공개 라이브러리 사용을 혼동하지 않도록 선택 경로와 소유권을 정한다.

## 선택 순서

[사용 지침 색인](usage/README.md)에서 화면을 먼저 고른다. 화면이 없을 때 구성, 구성의 슬롯 안에서 컴포넌트, 마지막으로 토큰을 고른다. Storybook 배포·실험은 검토 상태이며 이 계층과 별개다.

| 목적 | 공개 API | 앱이 연결할 것 | 예제를 그대로 복사하지 않을 것 |
| --- | --- | --- | --- |
| 검색 화면 | SearchScreen (`/screen-flows`) + SearchField | query, onSearch, 결과·최근 검색·필터 슬롯, 번역된 전체 삭제 라벨 | 가짜 결과, 지연, 한국어 고정 문구 |
| 댓글 | CommentThreadScreen (`/screen-flows`) + MessageComposer (`/screens`) | 댓글·권한·답글 대상, 확정된 전송 결과 | 낙관적 성공 확정, 샘플 사람·사진 |
| 메시지 | ChatScreen + MessageComposer (`/screens`) | 타임라인, 초안, 업로드·전송·실패 | 타이머를 서버 완료로 사용 |
| 프로필 | ProfileScreen + EditorScreen (`/screen-flows`) | summary·fields·dirty·submit·discard | 공통 저장/이탈 확인을 별도 구현 |
| 저장 컬렉션 | SavedItemsScreen (`/saved-items`) | items, collections, 현재 컬렉션·항목, 사진·상세·저장 해제/Undo | 컬렉션/격자/상세를 앱마다 새로 조립 |
| 카테고리 필터 | SegmentedControl (`/selection`, Native `/inputs`)의 pills | 항목·현재 값·선택 콜백 | 단일 선택을 개별 Button selected로 중복 구현 |
| 일반 목록과 상세 | ListDetailScreen (`/screen-flows`) | list, detail, back, 검색·해제·Undo 도메인 로직 | 상세 진입 때 목록/검색 상태를 버리는 새 화면 |
| 설정 | SettingsScreen (`/screens`) | sections, 설정 값, 저장/API | 메뉴·저장 버튼의 위치를 앱마다 재정의 |

Web은 `@hjmds/react`, Native는 `@hjmds/react-native`의 표에 명시된 subpath로 가져온다. 사용 지침에서 해당 버전의 타입과 지원 여부를 확인한다. 위 표는 현재 작업 트리 API 기준이며 npm 게시 완료를 뜻하지 않는다.

## 공통 계약과 제품 소유권

| HJM이 고정 | 제품이 공급 |
| --- | --- |
| 영역 구조, 읽기 순서, 버튼 위치·타깃, 간격·크기 토큰 | 제품 목적에 맞는 공개 구성 선택 |
| pending·disabled·error, focus·keyboard·back·취소·복구 계약 | API·권한·저장 시점, 서버 operation ID |
| 테마 의미와 대비, 모션 감소 | `HjmProvider.brandPalette`의 light/dark semantic 값 |
| 슬롯 구조와 접근성 이름 요구 | 번역 문자열, 로고·사진·아이콘, 날짜 형식 |

제품 팔레트는 [브랜드 경계](brand-boundary.md)를 따른다. 앱마다 스타일 파일로 내부 모양을 덮거나 Showcase 테마를 제품 기본값으로 복사하지 않는다. 공개 옵션으로 표현할 수 없는 차이는 해당 API의 새 축이 필요한지 검토한다.

## 채택 검증

- 같은 공개 구성에 서로 다른 두 제품 팔레트를 적용한다. 기본·다크·큰 글자에서 입력·CTA·오류의 의미가 유지돼야 한다.
- 정상 실행뿐 아니라 중복 입력, 요청 실패, 재시도, 취소, 상세에서 복귀, 초안 보존을 확인한다.
- Web 키보드와 Native 키보드·safe area·뒤로가기는 각각 확인한다. 웹 캡처를 Native 검증으로 대체하지 않는다.
- 문서 연결 검사만으로 지침 준수나 앱 적용을 선언하지 않는다. 공개 진입점과 소비 제품의 실제 import·콜백·테마 연결을 확인한다.
