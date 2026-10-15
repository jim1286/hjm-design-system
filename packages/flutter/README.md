# HJM Flutter (beta)

선택의창은 Flutter renderer 부재로 계약 참조만 갱신되어 공통 구조를 제품이 복제했다.
이 패키지는 HJM이 소유하는 정식 Flutter 구현이다. npm React renderer와 별도 package이며
pub.dev 게시를 의미하지 않는다. 소비자는 이 저장소의 검증한 Git SHA와 `packages/flutter`를 고정한다.

`HjmScreenLayout`, `HjmCompositionLayout`, `HjmContentState`, `HjmListRow`, `HjmBadge`, `HjmActionButton`, `HjmConfirmDialog`, `HjmSheetLayout`, `HjmActionGroup`를 제공한다.
공통 영역 순서·제목/배지·목록/상태 배치는 여기서 소유한다. 제품은 ThemeData, 문구, 데이터,
권한과 콜백을 공급한다. 지도/카메라/광고/도메인 그림은 콘텐츠 슬롯에 유지한다.
`screen-patterns.ts`의 상태 의미와 간격을 따르며 Dart enum으로 잘못된 상태를 제한한다.
loading은 접근성 이름을 가진 표시기만 보이고 empty/error/restricted는 안내와 행동을 중앙에 둔다.
스크롤 host가 bounded일 때 영역 중앙을 유지하고 작은 영역에서는 행동을 스크롤로 보존한다.

현재 API만 beta이며 메시지/댓글 등 전체 React API parity를 주장하지 않는다.
Material의 포커스·입력·탐색 엔진과 소비 ThemeData를 사용한다. Flutter SDK는 앱 `.fvmrc`를 따른다.
