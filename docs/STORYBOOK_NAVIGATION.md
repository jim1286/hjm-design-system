# Storybook 탐색 기준

검토일: 2026-10-02 · 적용: Web 및 React Native showcase

## 배포와 실험, 같은 네 단계

2026-10-02 사용자가 기존 분류를 큰 개념의 단계로 정리하고 실험 승인 후 이동을
‘배포’라고 부르도록 요청했다. 패턴·갤러리라는 출처 중심 이름 대신 실제 예제의 역할을 기준으로
분류한다. 양쪽 메뉴 순서는 `토큰 → 컴포넌트 → 구성 → 화면`으로 동일하다.

| 단계 | 기준 | 배포 예시 |
| --- | --- | --- |
| 토큰 | 여러 UI가 공유하는 색·간격·글꼴·모션 값과 그 값의 편집 도구 | 색상, 타이포그래피, 간격, 크기, 둥글기, 모션, 화면 여백과 너비, 테두리, 그림자와 투명도, 겹침 순서, 테마 편집, 글꼴 편집 |
| 컴포넌트 | 하나의 역할을 수행하는 재사용 UI. 내부 요소 수보다 공개 역할로 판단 | 버튼, 입력창, 토스트, 내비게이션 바 |
| 구성 | 여러 컴포넌트의 조합·배치·짧은 사용자 흐름·환경 비교 | 입력 시트, 시간 선택, 토스트 배치, 내비게이션 바 비교 |
| 화면 | 페이지 전체의 목적과 상태를 제공하는 완성된 예시 | 검색, 온보딩, 알림 설정, 대시보드, 프로필 편집, 목업 편집 |

`배포/<단계>/<역할 또는 항목>`은 사용자가 승인했거나 기존 정규 분류에 있던 항목이다.
`실험/<단계>/<역할 또는 항목>`은 사용자 확인 전의 신규 항목이다. 비어 있는 단계에
자리 채우기용 스토리를 만들지 않고, 실제 항목이 생길 때 같은 순서로 표시한다.
단계는 상속·의존 관계를 강제하지 않는다. 화면은 필요한 컴포넌트와 구성을 조합할 수 있다.

컴포넌트의 역할 하위 분류는 글자와 아이콘·레이아웃·동작·입력·탐색·데이터 표시·
상태와 알림·오버레이·시각 효과·기반 기능이다. 컴포넌트 개요·전체 목록·사용 안내는
컴포넌트 탐색을 돕는 문서 항목으로 같은 단계에 둔다. 모션이 있어도 수치는 데이터 표시,
아바타는 데이터 표시, 진행률은 상태와 알림으로 분류한다.

## 신규 추가 → 실험 → 사용자 승인 → 배포

신규 컴포넌트·표현 옵션·구성·화면·편집 도구는 지원 표면의 `실험/<단계>/...`에 먼저 둔다.
개별 항목은 기본·어두운 테마·큰 글자와 실제 조작 예제를 제공한다.
사용자의 명시적인 승인 후 해당 단계와 역할을 유지하며 `배포/<단계>/...`로 이동한다.
구현 요청·검사 통과·계속 진행·응답 없음은 승인이 아니다.

이 이동을 **스토리북 배포**라고 부른다. npm 패키지 게시, API 안정화, 소비 앱 반영,
운영 서비스 배포와는 각각 별도의 작업·승인·검증이다. 기존 항목의 버그·접근성 수정은
현재 위치에서 진행하며, 새로운 표현은 기존 배포 예제를 대체하기 전에 실험에서 검토한다.

승인 날짜·대상·최종 경로를 진행 문서에 기록하고 Web/Native 스토리·메뉴 순서·탐색 검사·
이 문서를 함께 갱신한다. 예: `실험/컴포넌트/탐색/새 탐색 UI` →
`배포/컴포넌트/탐색/새 탐색 UI`. 내비게이션 바는 승인에 따라 배포에 두고,
공통 동작과 상호작용 예제는 `실험/구성`에 유지한다.

표시 이름은 모든 단계·역할·개별 항목·상태·도구 모음까지 용도를 알 수 있는 한글로 쓴다.
공개 API와 export 이름, 키보드 Home/End, import 경로는 번역하지 않는다.
Web의 컴포넌트 역할별 참조 목록은 canonical 계약을, 상세 항목은 실제 조작을 제공한다.
Native는 지원 renderer를 개별 항목으로 제공한다.

## 기존 링크 호환성

분류를 바꾸어도 공개 API·패키지 경로는 바뀌지 않는다. 이동한 CSF meta에 기존 제목에서
생성되던 `id`를 Web에 명시해 기존 URL을 유지한다.
Native Storybook 10.4.4의 runtime `prepareStories`는 meta.id 대신 title로 ID를 만들어
명시적 ID와 renderer가 불일치한다. 앱이 열리지 않는 우회 패치 대신 Native에는
새 제목 기반 ID를 사용한다. 예: `컴포넌트-데이터-표시-블로바타-캐릭터--default`.
예전 모바일 링크나 저장된 선택에서 찾을 수 없다는 오류가 나오면 메뉴에서 새 항목을 선택한다.
TODO(remove when Native runtime index honors meta.id): 이 제한이 해결되면 Web과 같은 ID 보존을 적용한다.
아래 표는 이 감사에서 바뀐 탐색 위치다. 과거 캡처의 breadcrumb는 당시 기록으로 유지한다.

| 플랫폼 | 이전 메뉴 | 현재 메뉴 |
| --- | --- | --- |
| Native | Components/Display/Activity Heatmap | 배포/컴포넌트/데이터 표시/활동 히트맵 |
| Native | Components/Display/Animated Blobatar | 배포/컴포넌트/데이터 표시/움직이는 블로바타 캐릭터 |
| Native | Components/Display/Animated Statistic | 배포/컴포넌트/데이터 표시/움직이는 수치 |
| Native | Components/Display/Blobatar Avatar | 배포/컴포넌트/데이터 표시/블로바타 캐릭터 |
| Native | Components/Inputs/Calendar | 배포/컴포넌트/입력/달력 |
| Native | Components/Data Display/Carousel | 배포/컴포넌트/데이터 표시/캐러셀 |
| Native | Patterns/Cascader | 배포/컴포넌트/입력/단계별 선택 |
| Native | Components/Display/Code Block | 배포/컴포넌트/데이터 표시/코드 블록 |
| Native | Gallery/Compound controls | 배포/구성/복합 입력 |
| Native | Components/Display/Content Transition | 배포/컴포넌트/시각 효과/내용 전환 |
| Native | Patterns/Dashboard | 배포/화면/대시보드 |
| Native | Patterns/Data layouts | 배포/구성/데이터 배치 |
| Native | Components/Inputs/Duration Field | 배포/컴포넌트/입력/소요 시간 입력 |
| Native | Components/Display/Effect Surface | 배포/컴포넌트/시각 효과/배경 시각 효과 |
| Native | Patterns/Family drawer | 배포/구성/단계별 드로어 |
| Native | Patterns/Floating action button | 배포/구성/빠른 메모 작성 |
| Native | Components/Display/Folder Preview | 배포/컴포넌트/데이터 표시/폴더 미리보기 |
| Native | Components/Navigation/Gooey Navigation | 배포/컴포넌트/탐색/물방울 탐색 메뉴 |
| Native | Components/Display/Gravity Letters | 배포/컴포넌트/시각 효과/중력 글자 |
| Native | Components/Display/Grid Reveal | 배포/컴포넌트/시각 효과/격자 등장 효과 |
| Native | Components/Actions/Inline Confirm | 배포/컴포넌트/동작/버튼 안에서 확인 |
| Native | Patterns/Input sheet | 배포/구성/입력 시트 |
| Native | Experimental/Interaction Adapters | 실험/구성/드래그·스와이프·모션 |
| Native | Patterns/Landing | 배포/화면/랜딩 화면 |
| Native | Components/Feedback/Liquid Toast | 배포/컴포넌트/상태와 알림/리퀴드 토스트 |
| Native | Components/Display/Lucide Icon | 배포/컴포넌트/글자와 아이콘/루시드 아이콘 |
| Native | Gallery/Renderer Gallery | 배포/구성/네이티브 컴포넌트 모음 |
| Native | Components/Feedback/Notification Bell | 배포/컴포넌트/상태와 알림/알림 벨 |
| Native | Patterns/Notification settings | 배포/화면/알림 설정 |
| Native | Patterns/Onboarding | 배포/화면/온보딩 |
| Native | Experimental/Optional Adapters | 실험/구성/이미지·시트·키보드 조작 |
| Native | Patterns/Profile studio | 배포/화면/프로필 편집 |
| Native | Patterns/Rating | 배포/컴포넌트/입력/별점 |
| Native | Components/Actions/Reaction Picker | 배포/컴포넌트/동작/반응 선택 |
| Native | Components/Feedback/Scroll Progress | 배포/컴포넌트/상태와 알림/읽기 진행 표시 |
| Native | Patterns/Search | 배포/화면/검색 |
| Native | Components/Feedback/Step Player | 배포/컴포넌트/상태와 알림/단계별 진행 표시 |
| Native | Components/Inputs/Task List | 배포/컴포넌트/입력/할 일 목록 |
| Native | Foundations/Theme Studio | 배포/토큰/테마 편집 |
| Native | Components/Feedback/ThinkingOrb | 배포/컴포넌트/상태와 알림/생각 중 표시 |
| Native | Patterns/Time selection | 배포/구성/시간 선택 |
| Native | Foundations/Typography Studio | 배포/토큰/글꼴 편집 |
| Native | Gallery/Visual foundations | 배포/구성/시각 효과 |
| Native | Components/Display/Voice Note | 배포/컴포넌트/데이터 표시/음성 메모 |
| Native | Components/Data Display/Accordion | 배포/컴포넌트/데이터 표시/아코디언 |
| Native | Components/Inputs/Agreement | 배포/컴포넌트/입력/약관 동의 |
| Native | Components/Overlays/AlertDialog | 배포/컴포넌트/오버레이/확인 대화상자 |
| Native | Components/Foundations/AspectRatio | 배포/컴포넌트/레이아웃/화면 비율 |
| Native | Components/Data Display/Asset | 배포/컴포넌트/데이터 표시/이미지·영상 표시 |
| Native | Components/Actions/AuthProviderButton | 배포/컴포넌트/동작/소셜 로그인 버튼 |
| Native | Components/Foundations/AuthScreen | 배포/컴포넌트/레이아웃/로그인 화면 |
| Native | Components/Data Display/Avatar | 배포/컴포넌트/데이터 표시/아바타 |
| Native | Components/Data Display/Badge | 배포/컴포넌트/데이터 표시/배지 |
| Native | Components/Actions/BottomCta | 배포/컴포넌트/동작/하단 실행 버튼 |
| Native | Components/Feedback/BottomInfo | 배포/컴포넌트/상태와 알림/하단 안내 |
| Native | Components/Navigation/BottomNavigation | 배포/컴포넌트/탐색/하단 탐색 |
| Native | Components/Actions/Button | 배포/컴포넌트/동작/버튼 |
| Native | Components/Data Display/Card | 배포/컴포넌트/데이터 표시/카드 |
| Native | Components/Inputs/Checkbox | 배포/컴포넌트/입력/체크박스 |
| Native | Components/Inputs/CheckboxGroup | 배포/컴포넌트/입력/체크박스 그룹 |
| Native | Components/Inputs/Chip | 배포/컴포넌트/입력/선택 칩 |
| Native | Components/Data Display/Collapsible | 배포/컴포넌트/데이터 표시/접기와 펼치기 |
| Native | Components/Inputs/Combobox | 배포/컴포넌트/입력/검색형 선택 |
| Native | Components/Foundations/Container | 배포/컴포넌트/레이아웃/컨테이너 |
| Native | Components/Data Display/CounterBadge | 배포/컴포넌트/데이터 표시/숫자 배지 |
| Native | Components/Inputs/DatePicker | 배포/컴포넌트/입력/날짜 선택 |
| Native | Components/Inputs/DateRangePicker | 배포/컴포넌트/입력/기간 선택 |
| Native | Components/Data Display/DescriptionList | 배포/컴포넌트/데이터 표시/설명 목록 |
| Native | Components/Foundations/DesignSystemProvider | 배포/컴포넌트/기반 기능/디자인 시스템 설정 |
| Native | Components/Overlays/Dialog | 배포/컴포넌트/오버레이/대화상자 |
| Native | Components/Foundations/Divider | 배포/컴포넌트/레이아웃/구분선 |
| Native | Components/Feedback/EmptyState | 배포/컴포넌트/상태와 알림/빈 상태 |
| Native | Components/Inputs/Field | 배포/컴포넌트/입력/입력 필드 |
| Native | Components/Inputs/FilePicker | 배포/컴포넌트/입력/파일 선택 |
| Native | Components/Actions/FloatingActionButton | 배포/컴포넌트/동작/플로팅 실행 버튼 |
| Native | Components/Inputs/Form | 배포/컴포넌트/입력/입력 양식 |
| Native | Components/Foundations/Grid | 배포/컴포넌트/레이아웃/격자 |
| Native | Components/Foundations/Heading | 배포/컴포넌트/글자와 아이콘/제목 |
| Native | Components/Foundations/Icon | 배포/컴포넌트/글자와 아이콘/아이콘 |
| Native | Components/Actions/IconButton | 배포/컴포넌트/동작/아이콘 버튼 |
| Native | Components/Data Display/Image | 배포/컴포넌트/데이터 표시/이미지 |
| Native | Components/Foundations/Layout | 배포/컴포넌트/레이아웃/화면 기본 구조 |
| Native | Components/Actions/Link | 배포/컴포넌트/동작/링크 |
| Native | Components/Data Display/List | 배포/컴포넌트/데이터 표시/목록 |
| Native | Components/Data Display/ListRow | 배포/컴포넌트/데이터 표시/목록 행 |
| Native | Components/Navigation/LoadMore | 배포/컴포넌트/탐색/더 보기 |
| Native | Components/Data Layouts/Masonry | 배포/컴포넌트/레이아웃/높이가 다른 카드 배치 |
| Native | Components/Inputs/Mentions | 배포/컴포넌트/입력/사용자 언급 |
| Native | Components/Navigation/Menu | 배포/컴포넌트/탐색/메뉴 |
| Native | Components/Feedback/Notice | 배포/컴포넌트/상태와 알림/안내 메시지 |
| Native | Components/Inputs/NumberField | 배포/컴포넌트/입력/숫자 입력 |
| Native | Components/Inputs/OtpField | 배포/컴포넌트/입력/인증번호 입력 |
| Native | Components/Inputs/PasswordField | 배포/컴포넌트/입력/비밀번호 입력 |
| Native | Components/Feedback/Progress | 배포/컴포넌트/상태와 알림/진행 표시 |
| Native | Components/Data Layouts/QrCode | 배포/컴포넌트/데이터 표시/큐알 코드 |
| Native | Components/Inputs/Radio | 배포/컴포넌트/입력/라디오 버튼 |
| Native | Components/Inputs/RadioGroup | 배포/컴포넌트/입력/라디오 버튼 그룹 |
| Native | Components/Feedback/Result | 배포/컴포넌트/상태와 알림/결과 안내 |
| Native | Components/Inputs/SearchField | 배포/컴포넌트/입력/검색 입력 |
| Native | Components/Foundations/Section | 배포/컴포넌트/레이아웃/섹션 |
| Native | Components/Inputs/SegmentedControl | 배포/컴포넌트/입력/버튼형 선택 |
| Native | Components/Inputs/Select | 배포/컴포넌트/입력/목록에서 선택 |
| Native | Components/Overlays/Sheet | 배포/컴포넌트/오버레이/시트 |
| Native | Components/Feedback/Skeleton | 배포/컴포넌트/상태와 알림/스켈레톤 |
| Native | Components/Inputs/Slider | 배포/컴포넌트/입력/슬라이더 |
| Native | Components/Feedback/Spinner | 배포/컴포넌트/상태와 알림/로딩 표시 |
| Native | Components/Foundations/Stack | 배포/컴포넌트/레이아웃/가로·세로 배치 |
| Native | Components/Data Display/Statistic | 배포/컴포넌트/데이터 표시/수치 표시 |
| Native | Components/Navigation/Steps | 배포/컴포넌트/탐색/단계 탐색 |
| Native | Components/Foundations/Surface | 배포/컴포넌트/레이아웃/배경 영역 |
| Native | Components/Inputs/Switch | 배포/컴포넌트/입력/스위치 |
| Native | Components/Navigation/Tabs | 배포/컴포넌트/탐색/탭 |
| Native | Components/Data Display/Tag | 배포/컴포넌트/데이터 표시/태그 |
| Native | Components/Inputs/TagsInput | 배포/컴포넌트/입력/태그 입력 |
| Native | Components/Foundations/Text | 배포/컴포넌트/글자와 아이콘/본문 글자 |
| Native | Components/Inputs/TextArea | 배포/컴포넌트/입력/여러 줄 입력 |
| Native | Components/Data Display/Timeline | 배포/컴포넌트/데이터 표시/타임라인 |
| Native | Components/Feedback/Toast | 배포/컴포넌트/상태와 알림/토스트 |
| Native | Components/Inputs/ToggleGroup | 배포/컴포넌트/입력/토글 그룹 |
| Native | Components/Foundations/Top | 배포/컴포넌트/레이아웃/화면 제목과 설명 |
| Native | Components/Navigation/TopBar | 배포/컴포넌트/탐색/상단 탐색 막대 |
| Native | Components/Inputs/TransferList | 배포/컴포넌트/입력/목록 간 항목 이동 |
| Native | Components/Data Display/UploadItem | 배포/컴포넌트/데이터 표시/업로드 항목 |
| Native | Components/Data Layouts/VirtualList | 배포/컴포넌트/데이터 표시/가상 목록 |
| Web | Home/Overview | 배포/컴포넌트/개요/사용 안내 |
| Web | Components/Actions | 배포/컴포넌트/동작 |
| Web | Components/Catalog | 배포/컴포넌트/전체 목록 |
| Web | Components/Overview | 배포/컴포넌트/개요 |
| Web | Components/Data Display | 배포/컴포넌트/데이터 표시 |
| Web | Components/Feedback | 배포/컴포넌트/상태와 알림 |
| Web | Components/Foundation | 배포/컴포넌트/글자와 아이콘 |
| Web | Components/Infrastructure | 배포/컴포넌트/기반 기능 |
| Web | Components/Inputs | 배포/컴포넌트/입력 |
| Web | Components/Layout | 배포/컴포넌트/레이아웃 |
| Web | Components/Navigation | 배포/컴포넌트/탐색 |
| Web | Patterns/Optional Motion | 배포/구성/모션 연동 |
| Web | Components/Overlays | 배포/컴포넌트/오버레이 |
| Web | Components/Feedback/ThinkingOrb | 배포/컴포넌트/상태와 알림/생각 중 표시 |
| Web | Patterns/Toast layout | 배포/구성/토스트 배치 |
| Web | Foundations/Colors | 배포/토큰/색상 |
| Web | Foundations/Mockup Studio | 배포/화면/목업 편집 |
| Web | Foundations/Spacing & Motion | 배포/토큰/간격과 모션 |
| Web | Foundations/Theme Studio | 배포/토큰/테마 편집 |
| Web | Foundations/Typography | 배포/토큰/타이포그래피 |
| Web | Foundations/Typography Studio | 배포/토큰/글꼴 편집 |
| Web | Components/Display/Activity Heatmap | 배포/컴포넌트/데이터 표시/활동 히트맵 |
| Web | Patterns/Agreement | 배포/컴포넌트/입력/약관 동의 |
| Web | Patterns/Anchor | 배포/컴포넌트/탐색/문서 내 바로가기 |
| Web | Components/Display/Animated Blobatar | 배포/컴포넌트/데이터 표시/움직이는 블로바타 캐릭터 |
| Web | Components/Display/Animated Statistic | 배포/컴포넌트/데이터 표시/움직이는 수치 |
| Web | Patterns/Asset | 배포/컴포넌트/데이터 표시/이미지·영상 표시 |
| Web | Components/Display/Blobatar Avatar | 배포/컴포넌트/데이터 표시/블로바타 캐릭터 |
| Web | Patterns/Calendar | 배포/컴포넌트/입력/달력 |
| Web | Patterns/Carousel | 배포/컴포넌트/데이터 표시/캐러셀 |
| Web | Components/Display/Code Block | 배포/컴포넌트/데이터 표시/코드 블록 |
| Web | Patterns/CommandPalette | 배포/컴포넌트/탐색/명령 검색 |
| Web | Gallery/Compound controls | 배포/구성/복합 입력 |
| Web | Components/Display/Content Transition | 배포/컴포넌트/시각 효과/내용 전환 |
| Web | Patterns/Dashboard | 배포/화면/대시보드 |
| Web | Patterns/Data layouts | 배포/구성/데이터 배치 |
| Web | Patterns/DateRange | 배포/컴포넌트/입력/기간 선택 |
| Web | Patterns/Disclosure | 배포/구성/펼침과 메뉴 |
| Web | Components/Inputs/Duration Field | 배포/컴포넌트/입력/소요 시간 입력 |
| Web | Components/Display/Effect Surface | 배포/컴포넌트/시각 효과/배경 시각 효과 |
| Web | Patterns/Environment Matrix | 배포/구성/환경별 비교 |
| Web | Patterns/Family drawer | 배포/구성/단계별 드로어 |
| Web | Patterns/Floating action button | 배포/구성/빠른 메모 작성 |
| Web | Components/Display/Folder Preview | 배포/컴포넌트/데이터 표시/폴더 미리보기 |
| Web | Components/Navigation/Gooey Navigation | 배포/컴포넌트/탐색/물방울 탐색 메뉴 |
| Web | Components/Display/Gravity Letters | 배포/컴포넌트/시각 효과/중력 글자 |
| Web | Components/Display/Grid Reveal | 배포/컴포넌트/시각 효과/격자 등장 효과 |
| Web | Patterns/Heading | 배포/컴포넌트/글자와 아이콘/제목 |
| Web | Components/Actions/Inline Confirm | 배포/컴포넌트/동작/버튼 안에서 확인 |
| Web | Patterns/Input sheet | 배포/구성/입력 시트 |
| Web | Experimental/Interaction Adapters | 실험/구성/드래그·스와이프·모션 |
| Web | Patterns/Landing | 배포/화면/랜딩 화면 |
| Web | Components/Display/Lucide Icon | 배포/컴포넌트/글자와 아이콘/루시드 아이콘 |
| Web | Components/Feedback/Notification Bell | 배포/컴포넌트/상태와 알림/알림 벨 |
| Web | Patterns/Notification settings | 배포/화면/알림 설정 |
| Web | Patterns/Onboarding | 배포/화면/온보딩 |
| Web | Components/Inputs/OtpField | 배포/컴포넌트/입력/인증번호 입력 |
| Web | Patterns/Popover | 배포/컴포넌트/오버레이/팝오버 |
| Web | Patterns/Profile studio | 배포/화면/프로필 편집 |
| Web | Patterns/Rating | 배포/컴포넌트/입력/별점 |
| Web | Components/Actions/Reaction Picker | 배포/컴포넌트/동작/반응 선택 |
| Web | Components/Feedback/Scroll Progress | 배포/컴포넌트/상태와 알림/읽기 진행 표시 |
| Web | Patterns/Search | 배포/화면/검색 |
| Web | Patterns/SidePanel | 배포/컴포넌트/오버레이/측면 패널 |
| Web | Patterns/Sidebar | 배포/컴포넌트/탐색/사이드바 |
| Web | Components/Navigation/Sidebar | 배포/컴포넌트/탐색/사이드바 전환 |
| Web | Patterns/Splitter | 배포/컴포넌트/레이아웃/분할 영역 조절 |
| Web | Components/Feedback/Step Player | 배포/컴포넌트/상태와 알림/단계별 진행 표시 |
| Web | Components/Inputs/Task List | 배포/컴포넌트/입력/할 일 목록 |
| Web | Patterns/TextFormat | 배포/컴포넌트/글자와 아이콘/글자 서식 |
| Web | Patterns/Time selection | 배포/구성/시간 선택 |
| Web | Patterns/ToggleGroup | 배포/컴포넌트/입력/토글 그룹 |
| Web | Patterns/Tour | 배포/컴포넌트/오버레이/사용 안내 둘러보기 |
| Web | Patterns/TransferList | 배포/컴포넌트/입력/목록 간 항목 이동 |
| Web | Patterns/Tree | 배포/컴포넌트/데이터 표시/트리 목록 |
| Web | Gallery/Visual foundations | 배포/구성/시각 효과 |
| Web | Components/Display/Voice Note | 배포/컴포넌트/데이터 표시/음성 메모 |
| Web | Patterns/Web additions | 배포/구성/웹 보조 기능 |
| Web | Patterns/WebNavigation | 배포/구성/웹 탐색 |

## 2026-10-01 네비게이션 및 탐색 확장

배포/컴포넌트/탐색 아래 캡슐 네비게이션(BottomNavigation 변형), 글래스 네비게이션 바(NavigationBar)를 둡니다. 배포/화면/작품 탐색은 검색·필터·정렬·저장·상세의 화면 조합입니다. 모두 Web/Native에 Default·Dark·LargeText를 제공합니다.

## 표시 이름 검수 기준

2026-10-02 전수 검수에서 상위 분류만 한글이고 개별 이름·상태는 영어로 남아 있어 찾기 어려웠다.
이제 메뉴와 상태 이름은 용도를 먼저 설명한다. 기본 상태는 **기본 · 어두운 테마 · 큰 글자**이며
코드의 Default·Dark·LargeText 식별자는 유지한다. `피드백`은 **상태와 알림**으로 표시한다.
예: ThinkingOrb → 생각 중 표시, TransferList → 목록 간 항목 이동, AuthScreenLayout → 로그인 화면.
메뉴 이름에는 import 경로나 API 표기를 붙이지 않고, 컴포넌트 탐색의 보조 정보에 API 이름을 제공한다.

역할 검수 결과 수치·아바타·미디어는 데이터 표시, 값 변경은 입력, 화면 이동은 탐색,
로딩·결과·읽기 진행·알림은 상태와 알림, 장식·등장·내용 전환은 시각 효과에 유지한다.
화면 조합은 패턴, 비교 묶음은 갤러리, 토큰 편집은 디자인 기초에 둔다. 새 UI는 여전히 실험에서 승인받는다.

2026-10-02 레거시 제거 요청에 따라 프로필 편집의 중복 `Playground`는 양쪽에서 제거했다. 기존 웹 링크 `patterns-profile-studio--playground` 대신 `patterns-profile-studio--default`를 사용한다. 나머지 기존 예제 ID는 유지한다.

## 내비게이션 바 승인과 중복 정리

2026-10-02 사용자가 내비게이션 바만 배포 분류 이동하고 나머지 상호작용 예제는 실험에 유지하도록
명시적으로 승인했다. 최종 분류는 `배포/컴포넌트/탐색/내비게이션 바`이며 비교는
`배포/구성/내비게이션 바 비교`다. 이는 Storybook 분류 승인이고 API maturity나 패키지 게시 승인이 아니다.

10개 앱 표현은 동작 기준 4개 항목으로 합쳤다. 색상·아이콘·업종 차이는 각 항목의 표현 전환
버튼으로 확인한다. 공개 BottomNavigation API를 삭제하거나 제품의 선택 로직을 새로 만들지 않는다.

| 항목 | 함께 확인하는 표현 | Web 대표 ID |
| --- | --- | --- |
| 중앙에서 작업 실행 | 로봇 청소기·소셜·전자상거래·영상 | experimental-navigation-robot |
| 탐색 옆에서 작업 실행 | 주기 기록·에너지 | experimental-navigation-cycle |
| 선택한 목적지 이름 표시 | 자산 관리·쇼핑·전기차 | experimental-navigation-finance |
| 사각 영역으로 현재 위치 표시 | 프로젝트 관리 | experimental-navigation-project |

기존 캡슐 네비게이션은 옆 액션과 같은 조합이라 중복 등록·preview를 제거했다.
전체 비교에 반복되던 기본·floating·capsule·상단 바는 개별 canonical 항목에서 확인한다.
상단 바는 `검색·메뉴가 있는 상단 바`, 물방울 메뉴는 `선택 표시가 이어지는 탭`으로 표시해
역할이 먼저 보이게 한다. 기존 Web 대표 ID는 유지한다.

제거한 Web 링크는 robot(social/commerce/video), cycle(energy/캡슐 네비게이션),
finance(shop/car) 대표 ID의 `--default`로 이동한다. Native는 제목 기반 ID가 바뀌므로
새 `배포/컴포넌트/탐색/내비게이션 바` 메뉴에서 선택한다. Web 비교 ID는
`experimental-navigation-bars--default`를 그대로 유지한다.

참고는 Instagram `Dd9IBiPFmI_`의 10개 정적 앱 예시다. 기존 Lucide와 HJM를 합성하고
큰 글자에서는 읽을 수 있는 이름을 유지한다. 원제품 모션·제스처를 확인했다고 주장하지 않는다.

## 공통 동작 실험

2026-10-02 사용자가 공통 행동 체계 보강을 요청했다. `실험/구성/공통 동작` 아래 저장과 재시도,
즉시 반영과 복구, 보관과 실행 취소를 Web/Native에 기본·어두운 테마·큰 글자로 등록한다.
기존 Button·입력·상태 안내를 합성하며 새 버튼 컴포넌트로 중복 등록하지 않는다.
작업 상태의 소유권은 [공통 실행 계약](../packages/design-contracts/docs/action-session.md)을 따른다.

## 기능을 드러내는 상호작용 실험

2026-10-02 사용자가 추상적인 연동 이름 대신 실제 동작을 드러내고 예제를 늘리도록 요청했다.
기존 `상호작용 연동`은 `드래그·스와이프·모션`으로 이름을 바꾼다. 신규
`실험/구성/상호작용 예제`는 선택 후 적용·취소, 닫았다 열고 초안 이어쓰기, 늦은 응답보다 최신 검색
유지의 세 흐름이다. 모두 Web/Native 기본·어두운 테마·큰 글자로 제공한다.
기존 Sheet·Button·TextField 및 action-session을 합성하고 제품 영속 저장·서버 요청은 포함하지 않는다.
이 세 예제와 기존 공통 동작은 아직 분류 승인을 받지 않았다.


## 앱 토큰 문서 누락 보완

2026-10-02 앱 스토리북 캡처에서 테마·글꼴 편집만 노출되는 누락을 확인했다.
기존 토큰의 문서 보완이므로 배포/토큰에서 웹·앱에 같은 12개 항목을 제공한다.
간격·크기·둥글기·모션을 분리하고 크기에는 아이콘뿐 아니라 control의 높이·터치 영역도 포함한다.
폰트·줄 높이·자간·제목, 레이아웃·화면 폭, 테두리·그림자·투명도·겹침 순서까지
공개 foundations의 모든 값을 공용 목록과 검사로 대조한다. 새 디자인 토큰을 생성하거나
실험 UI를 승인한 변경은 아니다. Native 메뉴 생성·번들 전달과 실제 기기 화면 검증은 구분한다.


## STEA 후보 구성 배포 승인 (2026-10-02)

2026-10-02 사용자가 STEA Code 후보 검토로 만든 실험 7개를 "다 배포로 옮겨줘 맞는 곳들에"라고
명시적으로 승인했다. 모두 여러 컴포넌트의 조합과 짧은 흐름이므로 같은 단계(`구성`)를 유지해 옮겼다.
Web story id(`experimental-stea-*`)는 기존 링크 호환을 위해 보존하고, Native는 새 제목 기반 ID를 쓴다.
근거와 검증은 [STEA 도입 계획](plans/stea-code-adoption-2026-10-02.md)에 있다.
이는 Storybook 분류 승인이며 API 안정화·npm 게시·소비 앱 반영은 각각 따로 기록한다.

| 이전 | 최종 경로 | Web ID |
| --- | --- | --- |
| 실험/구성/진행 단계/처리 단계와 재시도 | 배포/구성/진행 단계/처리 단계와 재시도 | experimental-stea-order-progress |
| 실험/구성/인증/인증번호 확인과 다시 입력 | 배포/구성/인증/인증번호 확인과 다시 입력 | experimental-stea-otp-verify |
| 실험/구성/일정/날짜 선택과 예정 목록 | 배포/구성/일정/날짜 선택과 예정 목록 | experimental-stea-schedule-card |
| 실험/구성/데이터 요약/수치와 이전 대비 변화 | 배포/구성/데이터 요약/수치와 이전 대비 변화 | experimental-stea-stat-summary |
| 실험/구성/정보 카드/앞면과 상세 정보 전환 | 배포/구성/정보 카드/앞면과 상세 정보 전환 | experimental-stea-flip-card |
| 실험/구성/빈 상태/캐릭터와 시작 행동 | 배포/구성/빈 상태/캐릭터와 시작 행동 | experimental-stea-pixel-empty |
| 실험/구성/정보 카드/일정과 식별 정보 티켓 | 배포/구성/정보 카드/일정과 식별 정보 티켓 | experimental-stea-event-ticket |
