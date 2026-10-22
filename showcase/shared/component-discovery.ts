import type { ComponentCatalogEntry } from "@hjmds/design-contracts";

type DiscoveryHint = Readonly<{
  terms: readonly string[];
  choose: string;
  request: string;
  guide: string;
  relatedExample?: Readonly<{ label: string; story: string }>;
}>;

// Authoring vocabulary inspired by giting.kr/skills/app-menu (2026-10-23).
// These phrases help find existing contracts; they are not exported API aliases.
export const componentDiscovery: Readonly<Partial<Record<ComponentCatalogEntry["name"], DiscoveryHint>>> = {
  TopBar: { terms: ["맨 위 제목 줄", "상단 바", "앱바", "App Bar", "Navigation Bar"], choose: "화면 제목과 도구는 TopBar. 화면 전체 여백·상태·본문은 ScreenLayout이 맡습니다.", request: "상단에 뒤로가기와 대상 제목, 오른쪽에 더보기 아이콘을 배치해줘.", guide: "components/top-bar.md" },
  ScreenLayout: { terms: ["화면 뼈대", "노치 피하기", "세이프 에어리어", "스크롤 영역", "safe area"], choose: "화면의 헤더·본문·footer와 안전 영역 연결에 사용합니다. 이미 내비게이션 host가 처리한 inset을 다시 더하지 않습니다.", request: "헤더와 하단 행동을 유지하고 본문만 스크롤되게 해줘.", guide: "components/screen-layout.md" },
  BottomNavigation: { terms: ["아래 메뉴", "밑에 탭", "하단 탭바", "Tab Bar", "Bottom Nav"], choose: "앱의 주요 목적지 이동에 사용합니다. 같은 화면 안의 짧은 보기 전환은 SegmentedControl입니다.", request: "홈·검색·알림·내정보를 하단 탭으로 연결해줘.", guide: "components/bottom-navigation.md" },
  SegmentedControl: { terms: ["붙어 있는 버튼", "위쪽 전환 탭", "전체 진행중 완료", "세그먼티드"], choose: "같은 화면의 짧은 보기 전환에 사용합니다. 앱 목적지 이동은 BottomNavigation, 패널 탐색은 Tabs도 비교합니다.", request: "목록 위에서 전체·진행중·완료 보기를 전환하게 해줘.", guide: "components/segmented-control.md" },
  Tabs: { terms: ["탭 패널", "내용 전환", "가로 탭"], choose: "관련 콘텐츠 패널을 전환합니다. 앱 전체 목적지 이동은 BottomNavigation입니다.", request: "상세 화면에서 소개·기록 패널을 탭으로 전환하게 해줘.", guide: "components/tabs.md" },
  BottomCTA: { terms: ["맨 아래 붙은 버튼", "하단 고정 바", "고정 결제 바", "Bottom Bar"], choose: "현재 화면의 주 행동을 하단에 둡니다. 목적지 이동용 탭바와 역할이 다릅니다.", request: "하단에 저장 버튼을 두고 본문과 홈 인디케이터를 가리지 않게 해줘.", guide: "components/bottom-cta.md" },
  Sheet: { terms: ["아래에서 올라오는 판", "바텀시트", "높이 단계", "손잡이", "Bottom Sheet", "GestureSheet"], choose: "보조 작업·선택은 Sheet, 짧은 집중 작업은 Dialog, 확인은 AlertDialog입니다. 끌어서 높이를 바꾸려면 선택형 Native GestureSheet를 비교합니다.", request: "보조 입력을 하단 시트로 열고 완료를 눌렀을 때 값을 반영해줘.", guide: "components/sheet.md" },
  Dialog: { terms: ["작은 작업 창", "팝업 창", "모달", "Modal"], choose: "짧고 집중된 작업에 사용합니다. 모달이라는 말만으로 풀스크린이나 하단 시트를 정하지 않습니다.", request: "이름 변경을 다이얼로그로 열고 실패하면 입력을 유지해줘.", guide: "components/dialog.md" },
  AlertDialog: { terms: ["정말 삭제", "삭제 확인", "한 번 더 확인", "알럿"], choose: "삭제 등 중요한 실행 직전의 확인입니다. 여러 행동을 고르는 Menu와 구분합니다.", request: "삭제 전에 대상을 설명하고 취소와 삭제를 선택하게 해줘.", guide: "components/alert-dialog.md" },
  Menu: { terms: ["더보기", "점 세 개", "길게 누르면 메뉴", "액션시트", "Action Sheet", "Context Menu"], choose: "실행할 행동 목록입니다. 값 입력은 Select, 파괴 행동의 최종 확인은 AlertDialog입니다. 화면 행동은 grouped, 대상 행동은 anchored, 모바일 하단 행동은 bottom을 고릅니다.", request: "댓글 더보기를 앵커 메뉴로 열고 신고·차단 행동을 넣어줘.", guide: "components/menu.md" },
  Select: { terms: ["하나 고르는 칸", "누르면 목록", "드롭다운", "Picker"], choose: "필드의 값 하나를 고릅니다. 실행 행동 목록인 Menu와 다릅니다. Web·Native의 실제 표현은 API 지침에서 확인합니다.", request: "국가 필드를 선택 입력으로 만들고 선택한 값을 표시해줘.", guide: "components/select.md" },
  ListRow: { terms: ["목록 한 줄", "리스트 한 칸", "왼쪽 아이콘 오른쪽 값", "List Item", "ListTile"], choose: "목록 행의 공통 표시입니다. 목록 데이터·가상화·행동의 허용 여부는 제품이 연결합니다.", request: "설정 행에 왼쪽 아이콘과 제목, 오른쪽 현재 값을 보여줘.", guide: "components/list-row.md" },
  List: { terms: ["세로로 줄줄이", "목록", "밀면 나오는 삭제 버튼", "스와이프 액션", "SwipeActions", "꾹 눌러 순서 바꾸기", "드래그 정렬", "SortableCollection"], choose: "목록 표시는 List·ListRow, 밀어서 행동을 드러내기는 SwipeActions, 순서 변경은 SortableCollection입니다. 선택형 API의 지원 범위는 별도 지침에서 확인합니다.", request: "목록 행은 ListRow를 쓰고 밀면 보관 버튼을 드러내줘. 순서 변경 결과의 저장은 앱에 연결해줘.", guide: "compositions/interaction-adapters.md", relatedExample: { label: "끌기·밀기 실행 예제", story: "experimental-interaction-adapters--default" } },
  LoadMore: { terms: ["끝까지 내리면 더 나옴", "무한 스크롤", "다음 페이지", "Infinite Scroll"], choose: "추가 로딩·실패·재시도·완료를 표시합니다. Native 목록의 끝 감지와 데이터 요청은 제품 host에 연결합니다.", request: "목록 끝에서 다음 페이지를 요청하고 실패하면 재시도 버튼을 보여줘.", guide: "components/load-more.md" },
  Field: { terms: ["한 줄 입력칸", "글자 넣는 칸", "텍스트 필드", "TextField"], choose: "일반 텍스트 입력에 사용합니다. 비밀번호는 PasswordField, 인증번호는 OtpField입니다.", request: "이메일 입력에 이메일 키보드와 오류 안내를 연결해줘.", guide: "components/field.md" },
  Form: { terms: ["조건 안 맞으면 막기", "칸 밑 에러", "유효성 검사", "Validation", "키보드가 입력칸을 가려", "키보드 피하기", "KeyboardFormScrollView"], choose: "검증과 제출 흐름은 Form을 사용합니다. Native의 여러 필드 폼은 KeyboardFormScrollView, 입력 시트는 Sheet의 keyboardAvoidance·scrollable 지침도 확인합니다.", request: "필드 아래에 오류를 표시하고 제출 실패 시 초안을 유지해줘. 키보드가 마지막 입력을 가리지 않게 해줘.", guide: "components/form.md", relatedExample: { label: "입력 시트 실행 예제", story: "patterns-input-sheet--default" } },
  OtpField: { terms: ["인증번호 칸", "한 칸에 숫자 하나", "OTP 입력"], choose: "한 번 쓰는 인증번호 입력입니다. 인증 요청·재전송·완료 판정은 제품이 소유합니다.", request: "인증번호 입력과 자동완성을 연결하고 서버 오류를 보여줘.", guide: "components/otp-field.md" },
  TimePicker: { terms: ["시간 고르기", "시 분 선택", "돌돌 굴려 고르기", "휠 피커", "Wheel Picker"], choose: "기본 list는 시·분 목록을 탭해 선택합니다. 개발 소스의 selectionStyle=wheel은 관성 스크롤과 중앙 스냅을 제공하며 같은 확정·취소 계약을 사용합니다.", request: "시간을 휠 두 열에서 고르고 완료할 때 확정해줘.", guide: "components/time-picker.md", relatedExample: { label: "휠 선택 실행 예제", story: "components-inputs-time-picker--wheel" } },
  NumberField: { terms: ["개수 늘리고 줄이기", "수량 스텝퍼", "Stepper", "마이너스 플러스"], choose: "범위가 있는 수치 입력입니다. 진행 단계를 나타내는 Steps와 구분합니다.", request: "수량을 최소·최대 범위 안에서 늘리고 줄이게 해줘.", guide: "components/number-field.md" },
  Switch: { terms: ["켰다 껐다", "온오프 스위치", "토글 스위치"], choose: "켜짐·꺼짐 설정에 사용합니다. 여러 항목을 고르는 Checkbox와 다릅니다. 서버 저장과 실패 복구는 제품이 처리합니다.", request: "알림 설정을 스위치로 표시하고 저장 실패를 안내해줘.", guide: "components/switch.md" },
  EmptyState: { terms: ["목록이 비었을 때", "아무것도 없을 때", "빈 화면", "엠프티 스테이트"], choose: "데이터가 없는 상태입니다. 불러오는 중·조회 실패·검색 결과 없음과 구분합니다.", request: "첫 기록이 없으면 설명과 기록 추가 행동을 보여줘.", guide: "components/empty-state.md" },
  Notice: { terms: ["인터넷 끊김 안내", "연결 안 됨 띠", "오프라인 배너", "Offline Banner"], choose: "본문을 막지 않는 안내입니다. 실제 연결 판정·복구 시점은 제품이 전달합니다.", request: "연결이 끊기면 안내를 보여주고 복구 상태에 맞춰 해제해줘.", guide: "components/notice.md" },
  PhotoSourceSheet: { terms: ["사진 올리기", "갤러리 카메라 선택", "사진 업로드"], choose: "사진 출처를 고르는 공통 시트입니다. 카메라·사진 권한, OS picker와 업로드는 제품이 연결합니다.", request: "사진 출처 시트를 닫은 뒤 카메라나 갤러리를 열고 권한 거부를 안내해줘.", guide: "components/photo-source-sheet.md" },
  OnboardingScreen: { terms: ["처음 켰을 때 안내", "튜토리얼 몇 장", "온보딩"], choose: "소개 단계와 시작 행동의 공통 화면입니다. 다시 표시할지와 완료 저장은 제품이 결정합니다.", request: "소개 단계를 보여주고 마지막 시작 행동에서 완료를 저장해줘.", guide: "screens/flow-onboarding.md" },
  SettingsScreen: { terms: ["설정 화면", "그룹 리스트", "계정 알림 정보"], choose: "설정 그룹과 행의 공통 화면입니다. 값과 저장·로그아웃 정책은 제품이 연결합니다.", request: "설정을 계정·알림·정보 그룹으로 나누고 각 행 오른쪽에 현재 값을 보여줘.", guide: "screens/common-settings.md" },
};

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/gu, "");

export function matchesComponentQuery(query: string, entry: ComponentCatalogEntry, additionalTerms: readonly string[] = []): boolean {
  const words = query.normalize("NFKC").trim().split(/\s+/u).filter(Boolean).map(normalize);
  const hint = componentDiscovery[entry.name];
  const searchable = [entry.name, entry.label ?? "", entry.category, entry.platform, ...(entry.aliases ?? []), ...additionalTerms, ...(hint?.terms ?? [])].map(normalize);
  // All query words must occur, but may come from different names/phrases.
  return words.every(word => searchable.some(term => term.includes(word)));
}
