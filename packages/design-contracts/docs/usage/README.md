# HJM 사용 지침 색인

이 파일은 `pnpm usage:sync`가 각 지침에서 생성한다. 직접 수정하지 않는다. 지침 형식은 [규격](STANDARD.md)을 따른다.

단계는 Storybook과 같은 `토큰 → 컴포넌트 → 구성 → 화면`이다. 화면을 만들 때는 화면 지침의 영역 구조와
버튼 위치에서 시작해 구성·컴포넌트 지침으로 내려가고, 값은 토큰 지침에서 고른다. 표에 맞는 것이 없을 때만
제품에서 조합한다. 설치한 버전의 지침을 본다: `node_modules/@hjmds/design-contracts/docs/usage/`.
`분류`는 Storybook 제목 `<배포|실험>/<단계>/<분류>/<항목>`의 셋째 마디이고, 토큰·구성·화면은 Storybook 메뉴와 같은 순서다.

## 토큰

| 지침 | 분류 | 언제 쓰나 | 상태 | 지원 |
| --- | --- | --- | --- | --- |
| [색상](tokens/color.md) | 색과 글자 | 색은 팔레트 이름(파랑·회색)이 아니라 배경·글자·브랜드·피드백·테두리 **역할**로 고른다. | 배포 | Web · Native |
| [타이포그래피](tokens/typography.md) | 색과 글자 | 글자 크기·줄 높이·굵기를 정할 때 쓴다. | 배포 | Web · Native |
| [간격](tokens/spacing.md) | 공간과 크기 | 요소 사이 간격(gap)과 영역 안쪽 여백(padding)을 정할 때 쓴다. | 배포 | Web · Native |
| [크기](tokens/size.md) | 공간과 크기 | 아이콘·작은 그림(glyph)의 크기와 누를 수 있는 컨트롤의 높이·최소 터치 영역을 정할 때 쓴다. | 배포 | Web · Native |
| [화면 여백과 너비](tokens/layout.md) | 공간과 크기 | 화면 좌우 여백·본문 최대 폭·구획 간격·행 높이·breakpoint를 정하는 화면 배치의 기준값이다. | 배포 | Web · Native |
| [겹침 순서](tokens/layers.md) | 표면과 움직임 | 화면 위에 겹쳐 뜨는 것(고정 헤더·드롭다운·대화상자·툴팁·토스트)의 위아래 순서를 정할 때 쓴다. | 배포 | Web · Native |
| [그림자와 투명도](tokens/elevation-opacity.md) | 표면과 움직임 | 면이 다른 면 위에 떠 있음을 보일 때(그림자), 비활성·누름·끌기 상태를 흐리게 할 때(투명도), 상태 덧칠의 세기와 모달 뒤 배경막을 정할 때 쓴다. | 배포 | Web · Native |
| [둥글기](tokens/radius.md) | 표면과 움직임 | 모서리 반경을 정할 때 쓴다. | 배포 | Web · Native |
| [모션](tokens/motion.md) | 표면과 움직임 | 전환·나타남·사라짐의 길이와 곡선을 정할 때 쓴다. | 배포 | Web · Native |
| [테두리](tokens/stroke.md) | 표면과 움직임 | 테두리·구분선·포커스 링의 두께를 정할 때 쓴다. | 배포 | Web · Native |
| [글꼴 편집](tokens/typography-studio.md) | 편집 도구 | 제품 서체 후보를 정할 때, 후보 폰트를 기본 서체와 나란히 같은 크기로 그려 한글·영문·숫자·긴 문장을 비교하고 출처·라이선스를 함께 기록하는 작업 도구다. | 배포 | Web · Native |
| [테마 편집](tokens/theme-studio.md) | 편집 도구 | 제품 브랜드 색을 정할 때, 바꿀 색을 light·dark 양쪽에서 실제 컴포넌트에 입혀 보고 대비를 확인한 뒤 Provider에 넣을 `brandPalette` 설정을 얻는 작업 도구다. | 배포 | Web · Native |

## 컴포넌트

| 지침 | 분류 | 언제 쓰나 | 상태 | 지원 |
| --- | --- | --- | --- | --- |
| [Accordion](components/accordion.md) | 데이터 표시 | 서로 관계가 있는 여러 접힘 항목을 한 그룹으로 보일 때 쓴다. | 배포 | Web · Native |
| [ActivityHeatmap](components/activity-heatmap.md) | 데이터 표시 | 최대 1년(366일) 범위의 일별 활동량을 한눈에 보여 주는 읽기 전용 개요에 쓴다. | 배포 | Web · Native |
| [Affix](components/affix.md) | 기반 기능 | Web에서 스크롤하는 동안 요약·필터·저장 버튼 같은 작은 영역을 가장 가까운 스크롤 조상의 상단에 붙여 두고, 부모가 끝나면 함께 풀리게 할 때 쓴다. | 배포 | Web |
| [Agreement](components/agreement.md) | 입력 | 가입·결제·서비스 시작 앞의 약관 동의 묶음에 쓴다. | 배포 | Web · Native |
| [AlertDialog](components/alert-dialog.md) | 오버레이 | 삭제·결제·탈퇴처럼 되돌릴 수 없는 행동 직전의 확인(`mode="confirm"`)과, 사용자가 반드시 읽고 닫아야 하는 짧은 알림(`mode="alert"`)에 쓴다. | 배포 | Web · Native |
| [Anchor](components/anchor.md) | 탐색 | Web의 긴 문서·가이드·약관에서 같은 페이지 안 섹션으로 이동하는 목차에 쓴다. | 배포 | Web |
| [AspectRatio](components/aspect-ratio.md) | 레이아웃 | 이미지·동영상·지도처럼 늦게 로드되는 매체의 자리를 미리 잡아 레이아웃 흔들림을 막을 때 쓴다. | 배포 | Web · Native |
| [Asset](components/asset.md) | 데이터 표시 | 아이콘·이미지·Lottie·비디오를 같은 크기·모서리 규칙의 액자에 넣을 때 쓴다. | 배포 | Web · Native |
| [AuthProviderButton](components/auth-provider-button.md) | 동작 | Google·Kakao·Naver·Apple 소셜 로그인 버튼에 쓴다. | 배포 | Web · Native |
| [AuthScreenLayout](components/auth-screen-layout.md) | 레이아웃 | 로그인·가입 진입 화면의 배치에 쓴다. | 배포 | Web · Native |
| [Avatar](components/avatar.md) | 데이터 표시 | 사람·계정을 사진 또는 이니셜로 나타낼 때 쓴다. | 배포 | Web · Native |
| [Badge](components/badge.md) | 데이터 표시 | 항목의 상태나 분류를 짧은 글자 하나로 붙일 때 쓴다. | 배포 | Web · Native |
| [BottomCTA](components/bottom-cta.md) | 동작 | 화면의 결론 행동(저장·다음·결제·가입)을 본문 아래 하단 영역에 둘 때 쓴다. | 배포 | Web · Native |
| [BottomInfo](components/bottom-info.md) | 상태와 알림 | 주 행동 아래에 늘 붙어 있는 작은 조건 문장에 쓴다. | 배포 | Web · Native |
| [BottomNavigation](components/bottom-navigation.md) | 탐색 | 앱의 안정된 최상위 route(홈·검색·메시지·내 정보) 2~6개 사이를 이동하는 하단 막대에 쓴다. | 배포 | Web · Native |
| [Breadcrumb](components/breadcrumb.md) | 탐색 | Web의 깊은 계층 화면에서 현재 위치까지의 경로를 보여 주고 상위 계층으로 바로 돌아가게 할 때 쓴다. | 배포 | Web |
| [Button](components/button.md) | 동작 | 사용자가 누르면 무언가가 일어나는 텍스트 행동에 쓴다. | 배포 | Web · Native |
| [Calendar](components/calendar.md) | 데이터 표시 | 화면에 항상 펼쳐진 한 달 격자에서 날짜 하나를 고를 때 쓴다. | 배포 | Web · Native |
| [Card](components/card.md) | 데이터 표시 | 문서 metadata·미리보기·내보내기 상태는 실험 구성 DocumentResource를 먼저 대조한다. | 배포 | Web · Native |
| [Carousel](components/carousel.md) | 데이터 표시 | 한 번에 카드 하나만 보이고 사용자가 순서대로 넘겨 보는 유한한 묶음에 쓴다. | 배포 | Web · Native |
| [Celebration](components/celebration.md) | 구성/직접 조작과 모션 | 목표 달성, 첫 완료처럼 드물게 일어나는 성공 순간에 한 번 터지는 색종이 효과에 쓴다. | 배포 | Web · Native |
| [ChatMessage](components/chat-message.md) | 구성/정보 표시 | DM·대화 타임라인의 메시지 한 개에 쓴다. | 배포 | Web · Native |
| [ChatScreen](components/chat-screen.md) | 화면/소통 | DM·대화방처럼 헤더, 메시지 타임라인, 하단 작성창으로 이루어진 화면 한 장에 쓴다. | 배포 | Web · Native |
| [Checkbox](components/checkbox.md) | 입력 | 독립된 예/아니오 하나를 고르는 항목에 쓴다. | 배포 | Web · Native |
| [CheckboxGroup](components/checkbox-group.md) | 입력 | 한 질문에 대한 여러 선택지 중 0개 이상을 고르게 할 때 쓴다. | 배포 | Web · Native |
| [Chip](components/chip.md) | 입력 | 누를 수 있는 작은 pill이다. | 배포 | Web · Native |
| [CodeBlock](components/code-block.md) | 데이터 표시 | 코드·명령·설정 조각을 읽기 전용으로 보여 주고 사용자가 선택·복사하게 할 때 쓴다. | 배포 | Web · Native |
| [Collapsible](components/collapsible.md) | 데이터 표시 | 이웃 없이 혼자 접었다 펴는 한 덩어리에 쓴다. | 배포 | Web · Native |
| [ColorPicker](components/color-picker.md) | 입력 | 사용자가 콘텐츠 색(라벨 색, 태그 색, 테마 편집기의 사용자 값 등)을 sRGB HEX로 고르는 폼 입력에 쓴다. | 배포 | Web |
| [Combobox](components/combobox.md) | 입력 | 주어진 목록에서 하나를 고르는데 목록이 길어 입력으로 좁혀야 할 때 쓴다. | 배포 | Web · Native |
| [CommandPalette](components/command-palette.md) | 오버레이 | ⌘K 스타일로 앱 전체의 **행동**을 검색해 실행하는 모달에 쓴다. | 배포 | Web |
| [CommentThreadScreen](components/comment-thread-screen.md) | 화면/소통 | 게시물·콘텐츠 아래의 댓글 화면 한 장에 쓴다. | 배포 | Web · Native |
| [Container](components/container.md) | 레이아웃 | 화면 본문의 최대 폭과 좌우(논리 방향) 여백을 맞출 때 쓴다. | 배포 | Web · Native |
| [ContentTransition](components/content-transition.md) | 시각 효과 | 같은 자리의 내용이 상태에 따라 바뀔 때(필터 결과 패널, 단계별 본문) 새 내용이 짧게 나타나도록 감싼다. | 배포 | Web · Native |
| [ContextMenu](components/context-menu.md) | 탐색 | Web에서 제품이 소유한 영역(카드·목록 행·캔버스)의 우클릭·길게 누르기·Shift+F10에 명령 목록을 띄울 때 쓴다. | 배포 | Web · Native |
| [CounterBadge](components/counter-badge.md) | 데이터 표시 | 읽지 않은 알림·메시지·장바구니 수처럼 **셀 수 있는 개수**를 아이콘·행 옆에 작게 보일 때 쓴다. | 배포 | Web · Native |
| [DataTable](components/data-table.md) | 데이터 표시 | 여러 행의 데이터를 열로 맞춰 훑고, 열 기준으로 정렬하거나 행을 골라 일괄 작업할 때 쓴다(Web). 정렬·필터 실행, 페이지 나누기는 제품이 소유한다. | 배포 | Web |
| [DatePicker](components/date-picker.md) | 입력 | 폼·필터 자리에서 날짜 **하나**를 고를 때 쓴다(생년월일, 방문일, 시작일 필터). 평소에는 필드 트리거만 보이고, 누르면 Web은 필드에 붙은 팝오버, Native는 Sheet 안에 같은 달력 격자를 연다. | 배포 | Web · Native |
| [DateRangePicker](components/date-range-picker.md) | 입력 | 시작~끝 날짜 **구간**을 고를 때 쓴다(통계 기간, 예약, 검색 필터). 필드 트리거나 오버레이 없이 달력 격자를 그 자리에 펼쳐 둔다. | 배포 | Web · Native |
| [DescriptionList](components/description-list.md) | 데이터 표시 | 라벨-값 쌍의 묶음을 보여 줄 때 쓴다. | 배포 | Web · Native |
| [DesignSystemProvider](components/design-system-provider.md) | 기반 기능 | 앱 루트에 한 번 둔다. | 배포 | Web · Native |
| [Dialog](components/dialog.md) | 오버레이 | 화면 흐름을 잠시 멈추고 사용자의 주의가 필요한 **짧은 작업**에 쓴다. | 배포 | Web · Native |
| [Divider](components/divider.md) | 레이아웃 | 서로 다른 내용 묶음 사이에 얇은 구분선이 필요할 때 쓴다. | 배포 | Web · Native |
| [EditorScreen](components/editor-screen.md) | 화면/콘텐츠 | 글쓰기·프로필 수정처럼 한 화면 전체가 편집 흐름일 때 쓴다. | 배포 | Web · Native |
| [EffectSurface](components/effect-surface.md) | 시각 효과 | 환영·온보딩·빈 히어로처럼 분위기를 주는 배경이 필요할 때 내용 뒤에 장식 레이어(mesh·glow·grain)를 깐다. | 배포 | Web · Native |
| [EmptyState](components/empty-state.md) | 상태와 알림 | 목록이 비었거나 검색 결과가 0건이라 **아직 없음**을 알릴 때 쓴다. | 배포 | Web · Native |
| [Field](components/field.md) | 입력 | 라벨·도움말·오류를 가진 입력 칸에 쓴다. | 배포 | Web · Native |
| [FilePicker](components/file-picker.md) | 입력 | 사용자가 업로드할 로컬 파일을 고르게 할 때 쓴다. | 배포 | Web · Native |
| [FloatingActionButton](components/floating-action-button.md) | 동작 | 목록·피드처럼 스크롤되는 콘텐츠 위에 떠 있는 **단일 생성 행동**(새 기록 추가, 새 글 작성)에 쓴다. | 배포 | Web · Native |
| [Form](components/form.md) | 입력 | 여러 Field를 한 화면에 쌓고 한 번에 제출할 때 쓴다. | 배포 | Web · Native |
| [Grid](components/grid.md) | 레이아웃 | 카드·타일처럼 같은 모양의 자식을 창 크기에 따라 열 수를 바꿔 배치할 때 쓴다. | 배포 | Web · Native |
| [Heading](components/heading.md) | 글자와 아이콘 | 자리를 모르는 큰 제목 글자 하나가 필요할 때 쓴다. | 배포 | Web · Native |
| [Icon](components/icon.md) | 글자와 아이콘 | HJM semantic 이름(`search`, `back`, `chevronEnd`, `notifications` 등 43개)으로 고르는 그림 기호에 쓴다. | 배포 | Web · Native |
| [IconButton](components/icon-button.md) | 동작 | 보이는 글자 없이 아이콘만으로 표시하는 행동에 쓴다. | 배포 | Web · Native |
| [Image](components/image.md) | 데이터 표시 | 원본 크기를 아는 사진·차트 이미지를 로드 전에 자리를 잡아 두고, 실패해도 의미를 잃지 않게 보여 줄 때 쓴다. | 배포 | Web · Native |
| [ImageComparison](components/image-comparison.md) | 데이터 표시 | 같은 좌표와 비율의 두 이미지를 겹쳐 변화량을 비교할 때 쓴다. | 배포 | Web · Native |
| [KeyboardAvoiding](components/keyboard-avoiding.md) | — | 추가 native peer 없이 하단 행동(BottomCTA, 채팅 입력창)이 소프트웨어 키보드에 가려지지 않게 할 때 쓴다. | 배포 | Native |
| [KeyboardDock](components/keyboard-dock.md) | 구성/직접 조작과 모션 | `react-native-keyboard-controller`를 설치한 앱에서 화면 하단에 고정된 행동(BottomCTA, 채팅 입력창)이 키보드와 함께 위아래로 움직이게 할 때 쓴다(Native 전용, 별도 보조 기능. API 성숙도는 실험적 어댑터). 내부는 `KeyboardStickyView`이며, 여백을 바꾸는 대신 키보드 움직임을 따라 translate 한다. | 배포 | Native |
| [KeyboardFormScrollView](components/keyboard-form-scroll-view.md) | 구성/직접 조작과 모션 | 입력 필드가 여러 개인 세로 스크롤 폼(가입, 프로필 수정, 주소 입력)에서 포커스된 필드가 키보드에 가려지지 않게 스크롤해 줄 때 쓴다(Native 전용, 별도 보조 기능. API 성숙도는 실험적 어댑터). 내부는 `react-native-keyboard-controller`의 `KeyboardAwareScrollView`이고, `keyboardShouldPersistTaps="handled"`로 고정돼 키보드가 열린 채 버튼을 눌러도 탭이 전달된다. | 배포 | Native |
| [KeyboardMotionProvider](components/keyboard-motion-provider.md) | 구성/직접 조작과 모션 | `@hjmds/react-native/keyboard-controller` 어댑터(KeyboardDock, KeyboardFormScrollView)를 쓰는 앱의 루트에 **한 번** 설치한다(Native 전용, 별도 보조 기능. API 성숙도는 실험적 어댑터). 내부는 `react-native-keyboard-controller`의 `KeyboardProvider`이며, 어댑터를 준비하려고 OS 키보드를 미리 띄우지 않도록 `preload={false}`로 고정돼 있다. | 배포 | Native |
| [Layout](components/layout.md) | 레이아웃 | 앱의 상시 골격(header · sidebar · main · footer)을 한 번 세울 때 쓴다. | 배포 | Web · Native |
| [Link](components/link.md) | 동작 | 사용자가 복사하거나 새 탭으로 열 수 있는 **목적지**로 이동할 때 쓴다. | 배포 | Web · Native |
| [List](components/list.md) | 데이터 표시 | 이미 다 불러온, 개수가 많지 않은 행들을 이름 있는 목록 하나로 묶을 때 쓴다. | 배포 | Web · Native |
| [ListDetailScreen](components/list-detail-screen.md) | 화면/콘텐츠 | 목록 화면에서 한 항목의 상세를 같은 화면 안에서 열고, 뒤로 오면 목록의 입력·스크롤이 그대로 남아야 할 때 쓴다. | 배포 | Web · Native |
| [ListRow](components/list-row.md) | 데이터 표시 | 목록의 한 줄에 쓴다. | 배포 | Web · Native |
| [LoadMore](components/load-more.md) | 탐색 | 이미 그린 항목을 그대로 둔 채 목록 끝에서 다음 페이지를 요청하는 footer에 쓴다. | 배포 | Web · Native |
| [Masonry](components/masonry.md) | 레이아웃 | 높이가 서로 다른 카드(사진 피드, 핀보드, 갤러리)를 여러 열에 빈틈없이 쌓을 때 쓴다. | 배포 | Web · Native |
| [MediaSelectionScreen](components/media-selection-screen.md) | 화면/콘텐츠 | 고른 사진·영상을 큰 썸네일 격자로 보여 주고, 각 항목의 업로드 상태·재시도·취소·순서 이동·삭제와 "추가"·"완료" 행동을 한 화면에 묶을 때 쓴다. | 배포 | Web · Native |
| [Mentions](components/mentions.md) | 입력 | 여러 줄 입력 중 `@`(사람)·`#`(해시태그) 같은 트리거를 치면 후보를 띄우고, 고른 후보를 트리거부터 커서까지 자리에 넣고 공백 하나를 붙이는 입력에 쓴다. | 배포 | Web · Native |
| [Menu](components/menu.md) | 탐색 | 트리거 버튼을 누르면 뜨는 **항목 목록**에 쓴다. | 배포 | Web · Native |
| [Menubar](components/menubar.md) | 탐색 | 데스크톱 Web 앱 상단에 항상 같은 자리에 있는 가로 메뉴 막대(파일·편집·보기)에 쓴다. | 배포 | Web |
| [MessageComposer](components/message-composer.md) | 구성/입력과 작성 | 채팅·DM·댓글 입력창에 쓴다. | 배포 | Web · Native |
| [ModerationScreen](components/moderation-screen.md) | 화면/소통 | 게시물·댓글·사용자 **신고** 화면에 쓴다. | 배포 | Web · Native |
| [Notice](components/notice.md) | 상태와 알림 | 화면 흐름 안 **제자리에 남아 있는** 상태 알림에 쓴다. | 배포 | Web · Native |
| [NotificationInboxScreen](components/notification-inbox-screen.md) | 화면/소통 | 알림함 화면 전체 틀에 쓴다. | 배포 | Web · Native |
| [NotificationItem](components/notification-item.md) | 구성/정보 표시 | 알림함의 알림 한 행에 쓴다. | 배포 | Web · Native |
| [NumberField](components/number-field.md) | 입력 | 범위가 정해진 **정확한 수 하나**를 입력받을 때 쓴다. | 배포 | Web · Native |
| [OnboardingScreen](components/onboarding-screen.md) | 화면/소개 | 첫 실행 소개·초기 설정처럼 **몇 단계를 차례로 넘기는 화면**에 쓴다. | 배포 | Web · Native |
| [OtpField](components/otp-field.md) | 입력 | 문자·메일로 받은 **숫자 인증번호**를 칸 모양으로 입력받을 때 쓴다. | 배포 | Web · Native |
| [OverviewScreen](components/overview-screen.md) | 레이아웃 | 같은 데이터와 기능을 유지하면서 테마별 행·카드·격자와 도구 배치를 선택하는 목록 화면에 쓴다. | 실험 | Web · Native |
| [Pagination](components/pagination.md) | 탐색 | 총 개수(또는 총 페이지 수)가 정해진 결과 집합에서 사용자가 **임의의 페이지로 바로 이동**해야 할 때 Web에서 쓴다. | 배포 | Web |
| [PasswordField](components/password-field.md) | 입력 | 비밀번호를 입력받고, 필요할 때만 값을 눈으로 확인하게 할 때 쓴다. | 배포 | Web · Native |
| [PermissionScreen](components/permission-screen.md) | 화면/소개 | 카메라·위치·알림 같은 권한이 **왜 필요한지 설명하고 다음 행동을 고르게 하는** 화면에 쓴다. | 배포 | Web · Native |
| [PhotoSourceSheet](components/photo-source-sheet.md) | 구성/선택과 필터 | 사진 버튼 하나에서 **앨범에서 고르기 / 촬영하기**를 고르게 할 때 쓴다. | 배포 | Web · Native |
| [Popover](components/popover.md) | 오버레이 | 트리거에 붙어 뜨는 비모달 표면 안에 **포커스를 받는 임의 콘텐츠**를 둘 때 쓴다. | 배포 | Web |
| [ProfileScreen](components/profile-screen.md) | 화면/계정 | 내 프로필(또는 계정) 화면 틀에 쓴다. | 배포 | Web · Native |
| [Progress](components/progress.md) | 상태와 알림 | 작업이 얼마나 진행됐는지 보여 줄 때 쓴다. | 배포 | Web · Native |
| [ProgressiveBlur](components/progressive-blur.md) | 시각 효과 | 스크롤 영역의 바깥에 더 내용이 있음을 알리거나 장식 이미지 가장자리를 흐릴 때 쓴다. | 배포 | Web · Native |
| [QRCode](components/qr-code.md) | 데이터 표시 | 문자열(초대 링크, 연결 코드, 결제·체크인 URL)을 다른 기기의 카메라로 스캔하게 할 때 쓴다. | 배포 | Web · Native |
| [Radio](components/radio.md) | 입력 | 라디오 한 개를 제품이 직접 배치해야 할 때만 쓴다. | 배포 | Web · Native |
| [RadioGroup](components/radio-group.md) | 입력 | 한 화면에 펼쳐 둔 선택지 중 정확히 하나를 고를 때 쓴다. | 배포 | Web · Native |
| [Rating](components/rating.md) | 입력 | 정수 점수를 선택하거나 계산된 소수 평균을 읽기 전용으로 보여 줄 때 쓴다. | 배포 | Web · Native |
| [Result](components/result.md) | 상태와 알림 | 사용자 행동 뒤 흐름이 **끝난** 화면에 쓴다. | 배포 | Web · Native |
| [SavedItemsScreen](components/saved-items-screen.md) | 화면/콘텐츠 | 저장한 이미지·게시물을 컬렉션 표지 → 사진 격자 → 상세 순서로 탐색할 때 쓴다. | 배포 | Web · Native |
| [ScreenLayout](components/screen-layout.md) | 화면/화면 틀과 도구 | 한 라우트 화면의 뼈대가 필요할 때 쓴다. | 배포 | Web · Native |
| [SearchField](components/search-field.md) | 입력 | 목록·화면 안에서 검색어를 입력받을 때 쓴다. | 배포 | Web · Native |
| [SearchScreen](components/search-screen.md) | 화면/검색 | 검색어 입력, 필터, 최근 검색, 결과 목록을 갖춘 검색 화면 전체에 쓴다. | 배포 | Web · Native |
| [Section](components/section.md) | 레이아웃 | 화면 안의 내용 묶음에 제목·설명·머리 행동(“모두 보기”, “편집”)을 붙일 때 쓴다. | 배포 | Web · Native |
| [SegmentedControl](components/segmented-control.md) | 입력 | 2~4개의 짧은 보기 중 **항상 하나가 선택된** 전환에 쓴다. | 배포 | Web · Native |
| [Select](components/select.md) | 입력 | 폼 한 칸에서 여러 선택지 중 하나를 고르게 할 때 쓴다. | 배포 | Web · Native |
| [SettingsScreen](components/settings-screen.md) | 화면/설정 | 앱의 설정 화면 전체에 쓴다. | 배포 | Web · Native |
| [SharedTransitionElement](components/shared-transition-element.md) | 구성/직접 조작과 모션 | 목록의 카드(사진·썸네일)를 눌러 상세 화면으로 갈 때, 같은 요소가 두 화면 사이에서 확대·축소되어 이어지는 공유 요소 전환에 쓴다. | 배포 | Native |
| [SharedTransitionScreen](components/shared-transition-screen.md) | 구성/직접 조작과 모션 | `createHjmTransitionStack()`으로 만든 stack에서 공유 요소 전환을 쓸 때, **각 라우트 본문**을 감싼다. | 배포 | Native |
| [Sheet](components/sheet.md) | 오버레이 | 현재 화면 위에 모달로 띄우는 보조 작업 패널에 쓴다. | 배포 | Web · Native |
| [Sidebar](components/sidebar.md) | 탐색 | 데스크톱 Web의 세로 내비게이션에 쓴다. | 배포 | Web |
| [SidePanel](components/side-panel.md) | 오버레이 | Web 화면 가장자리(시작·끝)에 도킹되어 밀려 나오는 보조 패널에 쓴다. | 배포 | Web |
| [Skeleton](components/skeleton.md) | 상태와 알림 | 데이터가 오기 전, 곧 채워질 콘텐츠의 **모양을 미리 보여 줄 때** 쓴다. | 배포 | Web · Native |
| [SkipNav](components/skip-nav.md) | 기반 기능 | Web 화면에서 반복되는 머리(내비게이션·헤더)를 건너뛰고 본문으로 가는 링크가 필요할 때 쓴다. | 배포 | Web |
| [Slider](components/slider.md) | 입력 | 범위 안에서 값 하나를 대략적으로, 연속 조작으로 고를 때 쓴다. | 배포 | Web · Native |
| [SortableCollection](components/sortable-collection.md) | 입력 | 작은 목록의 순서를 사용자가 바꾸고, 그 순서를 제품이 저장할 때 쓴다(즐겨찾기 순서, 할 일 순서 등). 드래그와 함께 각 행에 "앞으로/뒤로" 버튼과 키보드·접근성 action이 항상 붙는다. | 배포 | Web · Native |
| [Spinner](components/spinner.md) | 상태와 알림 | 진행량을 모르고 도착할 내용의 모양도 정해지지 않은 **짧은 대기**를 한 자리에서 알릴 때 쓴다. | 배포 | Web · Native |
| [Splitter](components/splitter.md) | 레이아웃 | 넓은 Web 화면에서 두 영역의 경계를 사용자가 드래그나 키보드로 옮겨 크기를 정할 때 쓴다. | 배포 | Web |
| [Stack](components/stack.md) | 레이아웃 | 자식들을 한 방향으로 늘어놓고 사이 간격을 토큰으로 맞출 때 쓴다. | 배포 | Web · Native |
| [Statistic](components/statistic.md) | 데이터 표시 | 라벨이 붙은 **숫자 지표 하나**(또는 여러 개)를 보여 줄 때 쓴다. | 배포 | Web · Native |
| [Steps](components/steps.md) | 탐색 | 여러 단계로 된 **선형 흐름에서 지금 어디인지** 보여 줄 때 쓴다. | 배포 | Web · Native |
| [Surface](components/surface.md) | 레이아웃 | 배경·테두리·radius를 가진 **의미 없는 상자**가 필요할 때 쓴다. | 배포 | Web · Native |
| [SwipeActions](components/swipe-actions.md) | 구성/직접 조작과 모션 | 목록 행 하나에 붙은 **삭제·보관 같은 행 단위 행동**을, Native에서는 행을 밀어 드러내고 Web에서는 행 아래 버튼으로 바로 보여 줄 때 쓴다. | 배포 | Web · Native |
| [Switch](components/switch.md) | 입력 | 켜고 끄는 즉시 반영되는 설정 하나에 쓴다. | 배포 | Web · Native |
| [Tabs](components/tabs.md) | 탐색 | 같은 화면 안에서 **서로 다른 패널 여러 개 중 하나를 보여 줄 때** 쓴다. | 배포 | Web · Native |
| [Tag](components/tag.md) | 데이터 표시 | 반복해서 나오는 **정적 메타데이터 한 조각**에 쓴다. | 배포 | Web · Native |
| [TagsInput](components/tags-input.md) | 입력 | 사용자가 **자유 입력으로 여러 값을 모으는 필드**에 쓴다. | 배포 | Web · Native |
| [Text](components/text.md) | 글자와 아이콘 | 화면의 모든 일반 글자에 쓴다. | 배포 | Web · Native |
| [TextArea](components/text-area.md) | 입력 | 여러 줄 자유 글을 받는 입력에 쓴다. | 배포 | Web · Native |
| [TextFormat](components/text-format.md) | 글자와 아이콘 | 도움말·개발자 안내·약관 본문 안에서 단축키(`⌘S`), 짧은 코드 조각(`pnpm add …`), 인용문을 표시할 때 쓴다. | 배포 | Web |
| [TextTransition](components/text-transition.md) | 시각 효과 | 같은 자리의 짧은 문자열이 바뀔 때(상태 문구, 버튼 옆 안내, 단계 이름) 바뀐 순간을 짧은 등장 모션으로 알린다. | 배포 | Web · Native |
| [ThinkingOrb](components/thinking-orb.md) | 상태와 알림 | AI 에이전트가 실제로 검색·생성·듣기 같은 작업을 하는 동안 그 단계를 보여 줄 때만 쓴다. | 배포 | Web · Native |
| [Timeline](components/timeline.md) | 데이터 표시 | 이미 일어난 일을 시간 순서대로 보여 줄 때 쓴다. | 배포 | Web · Native |
| [Toast](components/toast.md) | 상태와 알림 | 방금 한 행동의 결과처럼 **무시해도 안전한 짧은 알림**에 쓴다. | 배포 | Web · Native |
| [ToggleGroup](components/toggle-group.md) | 입력 | 여러 개를 동시에 켜고 끄는 짧은 버튼 묶음에 쓴다. | 배포 | Web · Native |
| [Tooltip](components/tooltip.md) | 오버레이 | Web에서 이미 이름과 focus를 가진 컨트롤(대개 IconButton)에 **짧은 보충 설명 한 문장**을 붙일 때 쓴다. | 배포 | Web |
| [Top](components/top.md) | 레이아웃 | 화면 **본문의 첫 블록**에 쓴다. | 배포 | Web · Native |
| [TopBar](components/top-bar.md) | 탐색 | 화면 맨 위에 붙는 **크롬**에 쓴다. | 배포 | Web · Native |
| [Tour](components/tour.md) | 오버레이 | 새 화면·새 기능을 처음 만난 사용자에게 화면의 여러 요소를 순서대로 짚어 설명할 때 쓴다. | 배포 | Web |
| [TransferList](components/transfer-list.md) | 입력 | 한 항목 집합을 두 목록으로 나누고 사용자가 항목을 오가게 할 때 쓴다. | 배포 | Web · Native |
| [Tree](components/tree.md) | 데이터 표시 | 깊이가 정해지지 않은 계층 데이터를 펼치고 접으며 탐색하고, 그 안에서 하나 또는 여럿을 고를 때 쓴다. | 배포 | Web |
| [UploadItem](components/upload-item.md) | 데이터 표시 | 사용자가 고른 파일 **한 개**의 업로드 상태(대기·전송 중·완료·실패)를 한 행으로 보여 줄 때 쓴다. | 배포 | Web · Native |
| [VirtualList](components/virtual-list.md) | 데이터 표시 | 행 높이가 **모두 같은** 긴 목록(수백~수천 행)을 정해진 높이 안에서 스크롤할 때 쓴다. | 배포 | Web · Native |
| [VisuallyHidden](components/visually-hidden.md) | 기반 기능 | Web에서 화면에는 보이지 않지만 스크린 리더는 읽어야 하는 **문맥 문구**를 덧붙일 때 쓴다. | 배포 | Web |
| [Watermark](components/watermark.md) | 상태와 알림 | Web에서 문서 미리보기·초안 화면 위에 "초안", 프로젝트 이름 같은 **장식용 출처 표시 텍스트**를 비스듬히 반복해 깔 때 쓴다. | 배포 | Web |

## 구성

| 지침 | 분류 | 언제 쓰나 | 상태 | 지원 |
| --- | --- | --- | --- | --- |
| [관련 입력 묶음](compositions/field-group.md) | 입력과 작성 | 주소·연락처처럼 여러 입력이 하나의 질문에 답할 때 쓴다. | 배포 | Web · Native |
| [날짜 직접 입력](compositions/date-entry.md) | 입력과 작성 | 사용자가 알고 있는 날짜를 직접 입력할 때 쓴다. | 배포 | Web · Native |
| [늦은 응답보다 최신 검색 유지](compositions/interaction-flow-search.md) | 입력과 작성 | 검색어를 바꿔 다시 검색했을 때 먼저 보낸 요청이 늦게 도착해도 최신 검색 결과를 덮어쓰지 않게 할 때 쓴다. | 배포 | Web · Native |
| [단계별 드로어](compositions/family-drawer.md) | 입력과 작성 | 초대 → 설정 → 확인처럼 짧은 단계 2~5개를 현재 화면을 떠나지 않고 하단 시트 안에서 차례로 진행할 때 쓴다. | 배포 | Web · Native |
| [닫았다 열고 초안 이어쓰기](compositions/interaction-flow-draft.md) | 입력과 작성 | 메모·댓글처럼 시트에서 쓰던 글을 저장하지 않고 닫았다가 다시 열었을 때, 쓰던 초안을 그대로 이어 쓰게 할 때 쓴다. | 배포 | Web · Native |
| [댓글 작성](compositions/purpose-input-comment.md) | 입력과 작성 | 게시물·기록 아래에서 댓글이나 특정 댓글에 대한 답글을 남기고, 실패하면 글과 답글 대상을 그대로 남겨 다시 등록하게 할 때 쓴다. | 배포 | Web · Native |
| [메시지 작성](compositions/purpose-input-message.md) | 입력과 작성 | 대화 화면 하단에서 글과 사진 여러 장을 함께 보내고, 실패하면 글·사진·답장 대상을 그대로 남겨 다시 보내게 할 때 쓴다. | 배포 | Web · Native |
| [버튼에서 이어지는 편집](compositions/origin-dialog.md) | 입력과 작성 | 현재 화면의 항목을 짧게 편집하고 돌아올 때 출발 위치를 시각적으로 연결한다. | 배포 | Web · Native |
| [빠른 메모 작성](compositions/floating-action-button.md) | 입력과 작성 | 스크롤되는 기록 목록 위에 떠 있는 생성 버튼으로 짧은 입력 대화상자를 열고, 저장하면 새 항목을 목록 맨 위에 넣을 때 쓴다. | 배포 | Web · Native |
| [선택 내용 검토와 수정](compositions/reference-review.md) | 입력과 작성 | 선택 내용을 검토하고 수정 후 명시적으로 확정 흐름이 필요할 때 쓴다. | 배포 | Web · Native |
| [인증번호 확인과 다시 입력](compositions/stea-otp-verify.md) | 입력과 작성 | 문자·메일로 받은 숫자 인증번호를 입력하고 서버 확인을 기다린 뒤, 틀리면 남은 횟수를 보여 주고 다시 받게 하는 흐름에 쓴다. | 배포 | Web · Native |
| [입력 시트](compositions/input-sheet.md) | 입력과 작성 | 현재 화면 위에 하단 시트를 띄워 짧은 입력(이름 바꾸기, 메모 한 줄)을 받고, 키보드가 올라와도 본문을 스크롤하며 완료 버튼에 닿게 할 때 쓴다. | 배포 | Web · Native |
| [입력을 유지하는 도구](compositions/context-toolbar.md) | 입력과 작성 | 작성 중인 입력을 보존한 채 선택적 도구를 펼쳐야 할 때 쓴다. | 배포 | Web · Native |
| [첫 작업을 만들고 이어하기](compositions/reference-first.md) | 입력과 작성 | 첫 기록을 단계별 작성하고 중단한 초안 이어가기 흐름이 필요할 때 쓴다. | 배포 | Web · Native |
| [날짜 선택과 예정 목록](compositions/stea-schedule-card.md) | 선택과 필터 | 한 주처럼 짧은 날짜 범위에서 날짜 하나를 고르면 같은 카드 안의 일정 목록이 그 날짜로 바뀌는 요약 카드에 쓴다. | 배포 | Web · Native |
| [대표 항목과 묶음 전체 선택](compositions/selection-scope.md) | 선택과 필터 | 사진 묶음·스레드처럼 대표 항목 하나와 묶음 전체가 같은 모양으로 보일 때, 공유·삭제·이동 전에 대상 범위와 개수를 고르고 문구로 확인한 뒤 적용하게 할 때 쓴다. | 배포 | Web · Native |
| [사진 촬영과 앨범 선택](compositions/photo-source.md) | 선택과 필터 | 명시적으로 선택 후 플랫폼 picker 실행 흐름이 필요할 때 쓴다. | 배포 | Web · Native |
| [선택 후 적용·취소](compositions/interaction-flow-apply.md) | 선택과 필터 | 표시 방식·정렬·필터처럼 시트에서 여러 번 바꿔 본 뒤 적용을 눌러야 화면에 반영되고, 취소하거나 닫으면 기존 선택을 유지해야 할 때 쓴다. | 배포 | Web · Native |
| [시간 선택](compositions/time-selection.md) | 선택과 필터 | 알림 시각·마감 시각처럼 하루 안의 시각 하나를 시·분 두 Select로 나눠 고르게 할 때 쓴다. | 배포 | Web · Native |
| [보관함과 페이지 이동](compositions/web-navigation.md) | 탐색과 이동 | Web에서 상위 보관함 → 하위 모음으로 들어가고, 그 모음의 긴 목록을 페이지 단위로 넘겨 보는 탐색에 쓴다. | 배포 | Web |
| [펼침과 메뉴](compositions/disclosure.md) | 탐색과 이동 | Web에서 내용을 숨겼다 펼치거나(Collapsible), 대상에 붙은 작업 메뉴를 우클릭·키보드로 열거나(ContextMenu), 데스크톱 앱처럼 상단 메뉴 막대를 두는(Menubar) 세 방식을 각각 보여 주는 모음이다. | 배포 | Web |
| [대화 메시지](compositions/common-message.md) | 정보 표시 | 말풍선 하나하나에 반응·답장·원문 이동·전송 실패 후 다시 보내기를 붙일 때 쓴다. | 배포 | Web · Native |
| [문서와 파일](compositions/document-resource.md) | 정보 표시 | 이름·형식·크기와 미리보기·내보내기·별도 메뉴를 함께 제공하는 문서에 쓴다. | 배포 | Web · Native |
| [수치와 이전 대비 변화](compositions/stea-stat-summary.md) | 정보 표시 | 매출·주문·반품처럼 몇 개의 핵심 수치를 비교 기간과 함께 보이고, 증감의 방향과 좋고 나쁨을 색 없이도 읽히게 할 때 쓴다. | 배포 | Web · Native |
| [알림 항목](compositions/common-notification.md) | 정보 표시 | 알림 한 행을 누르면 바로 읽음으로 바꾸고, 서버가 실패하면 읽지 않음으로 되돌릴 때 쓴다. | 배포 | Web · Native |
| [앞면과 상세 정보 전환](compositions/stea-flip-card.md) | 정보 표시 | 모임·상품처럼 한 카드에 요약(앞면)과 상세 항목(뒷면)이 있고, 사용자가 버튼 하나로 두 면을 오가게 할 때 쓴다. | 배포 | Web · Native |
| [영상 미리보기](compositions/video-dialog.md) | 정보 표시 | 현재 입력을 유지하면서 짧은 영상 설명을 확인할 때 쓴다. | 배포 | Web · Native |
| [일정과 식별 정보 티켓](compositions/stea-event-ticket.md) | 정보 표시 | 공연·예약 입장권처럼 일시·장소·좌석 정보와 함께, 현장에서 보여 줄 QR 코드와 사람이 읽을 예매 번호를 한 카드에 담을 때 쓴다. | 배포 | Web · Native |
| [질감 비교](compositions/texture-comparison.md) | 정보 표시 | 기존 반복 점 grain과 불규칙한 정적 noise를 같은 배경·강도로 비교할 때 쓴다. | 배포 | Web · Native |
| [추가해도 유지되는 목록](compositions/live-list.md) | 정보 표시 | 입력 중인 목록에 새 데이터가 추가되거나 순서가 바뀌어도 기존 초안과 항목의 정체성을 유지할 때 쓴다. | 배포 | Web · Native |
| [카드 묶음과 긴 목록](compositions/data-layouts.md) | 정보 표시 | 많은 항목을 화면에 늘어놓을 방식을 고를 때 쓴다. | 배포 | Web · Native |
| [그림과 시작 안내](compositions/illustrated-outcome.md) | 피드백과 복구 | 빈 목록에서 시작을 안내하고 짧은 온보딩을 거쳐 결과를 보여 줄 때 쓴다. | 배포 | Web · Native |
| [버튼 완료 피드백](compositions/action-feedback.md) | 피드백과 복구 | 입력을 유지하며 저장의 진행·성공·재시도 가능 실패를 보여 줄 때 쓴다. | 배포 | Web · Native |
| [변경 저장과 이탈 확인](compositions/reference-settings.md) | 피드백과 복구 | 저장값과 편집 초안을 비교해 이탈 확인 흐름이 필요할 때 쓴다. | 배포 | Web · Native |
| [보관과 실행 취소](compositions/action-recovery-undo.md) | 피드백과 복구 | 보관·숨기기·목록에서 빼기처럼 제품이 역연산을 제공하는 작업 뒤에, 같은 자리에서 실행 취소를 주고 그 복구 요청이 성공해야 화면을 되돌릴 때 쓴다. | 배포 | Web · Native |
| [선택과 오류 복구](compositions/upload-recovery.md) | 피드백과 복구 | 파일 선택과 전송 상태의 취소·재시도를 연결할 때 쓴다. | 배포 | Web · Native |
| [저장과 재시도](compositions/action-recovery-save.md) | 피드백과 복구 | 입력한 내용을 서버에 저장하는 폼 한 덩어리에서 저장 중 중복 실행을 막고, 실패하면 입력을 지우지 않은 채 제출했던 값 그대로 다시 보낼 때 쓴다. | 배포 | Web · Native |
| [중단해도 남는 현재 상태](compositions/expo-interactions.md) | 피드백과 복구 | 버튼으로 상태를 빠르게 바꾸거나 전환 도중 내용을 닫아도 현재 상태가 바로 보이고 남아야 하는 영역에 쓴다. | 배포 | Native |
| [즉시 반영과 복구](compositions/action-recovery-optimistic.md) | 피드백과 복구 | 북마크·좋아요·알림 켜기처럼 되돌려도 피해가 없는 저위험 토글을 누르는 즉시 화면에 반영하고, 서버가 실패하면 직전 확인 값으로 되돌릴 때 쓴다. | 배포 | Web · Native |
| [처리 단계와 재시도](compositions/stea-order-progress.md) | 피드백과 복구 | 주문·신청처럼 서버가 단계를 하나씩 확정하는 처리 과정을 보여 주고, 확정에 실패하면 같은 단계를 다시 요청하게 할 때 쓴다. | 배포 | Web · Native |
| [캐릭터와 시작 행동](compositions/stea-pixel-empty.md) | 피드백과 복구 | 아직 만든 것이 없는 첫 빈 화면에 제품 캐릭터를 움직여 보이고 첫 행동 하나로 이끌 때 쓴다. | 배포 | Web · Native |
| [끌기·밀기·화면 전환](compositions/interaction-adapters.md) | 직접 조작과 모션 | 순서 바꾸기·행 작업·내용 전환·카드 넘기기·달성 축하·카드 확대 화면 전환 같은 선택형 상호작용 어댑터를 한 화면에서 함께 쓸 때, 각 어댑터를 어디에 놓고 무엇으로 감싸야 하는지 확인하는 구성이다. | 배포 | Web · Native |
| [높이가 이어지는 패널](compositions/adaptive-content.md) | 직접 조작과 모션 | 패널의 길이가 달라질 때 아래 행동이 새 높이로 이동해야 하는 작은 내용 영역에 쓴다. | 배포 | Web · Native |
| [선택 배경 이동](compositions/selection-motion.md) | 직접 조작과 모션 | 짧은 단일 선택의 현재 항목을 이어지는 배경으로 보여 줄 때 쓴다. | 배포 | Web · Native |
| [숫자 변화와 메뉴 변형](compositions/optional-motion.md) | 직접 조작과 모션 | 선택 설치 모션(숫자 자리 단위 변화, 메뉴 형태 변환)을 기존 컴포넌트 자리에 끼워 넣을 때 쓴다. | 배포 | Web |
| [이미지·시트·키보드 조작](compositions/optional-adapters.md) | 직접 조작과 모션 | Native 앱 한 화면에서 이미지 확대 보기, 끌어서 높이를 바꾸는 시트, OS 길게 누르기 메뉴, 키보드를 따라 올라가는 하단 행동을 함께 쓸 때 provider 중첩 순서와 각 요소의 자리를 확인하는 구성이다. | 배포 | Native |
| [내비게이션 바 비교](compositions/navigation-bar-collection.md) | 비교와 검증 | 하단 탭에 목적지 이동과 별개의 행동(작성·전원·기록 추가)을 함께 둘지, 선택한 목적지를 어떻게 보여 줄지 고를 때 이 비교를 본다. | 배포 | Web · Native |
| [네이티브 컴포넌트 기기 확인](compositions/native-renderers.md) | 비교와 검증 | Native 공개 컴포넌트가 실제 기기·시뮬레이터에서 그려지고 눌리는지 범주별로 한 화면에서 확인할 때 쓴다. | 배포 | Native |
| [복합 입력 모음](compositions/compound-controls.md) | 비교와 검증 | 기존 컨트롤을 묶은 네 가지 복합 입력(소요 시간, 버튼 자리 확인, 이모지 반응, 알림 종)을 화면 안 한 블록으로 둘 때 쓴다. | 배포 | Web · Native |
| [시각 효과 모음](compositions/visual-foundations.md) | 비교와 검증 | 배경 질감, 의미 이름 아이콘, 사진 없는 프로필 얼굴, 문장 전환처럼 화면의 분위기를 더하는 선택 표현을 고를 때 이 모음을 본다. | 배포 | Web · Native |
| [웹 전용 보조 컴포넌트](compositions/web-additions.md) | 비교와 검증 | Web에만 있는 보조 컴포넌트 세 개(색 고르기, 문서 워터마크, 스크롤 중 고정되는 실행 영역)를 실제 쓰임 하나씩과 함께 보여 주는 모음이다. | 배포 | Web |
| [테마 조합](compositions/design-profile-comparison.md) | 비교와 검증 | 같은 기능에 10가지 표현을 적용하고 앱의 프로필 선택을 검토할 때 쓴다. | 실험 | Web · Native |
| [토스트 배치 비교](compositions/toast-layout.md) | 비교와 검증 | Toast 카드 한 장의 내부 배치(톤 배지·제목·설명·닫기·실행 버튼)와 화면 위 위치를 좁은 폭·큰 글자·긴 문구·톤별로 확인하는 비교 스토리다. | 배포 | Web |
| [환경 조합 검증](compositions/environment-matrix.md) | 비교와 검증 | 제품 화면이 테마·쓰기 방향·글자 크기·모션 설정이 달라져도 같은 의미를 유지하는지 확인할 때, 어떤 환경 조합과 검증 항목을 골라 볼지 정하는 기준표로 쓴다. | 배포 | Web |

## 화면

| 지침 | 분류 | 목적 | 상태 | 지원 |
| --- | --- | --- | --- | --- |
| [서비스 소개](screens/landing.md) | 소개 | 제품을 처음 보는 사람에게 한 문장 가치 제안을 보여 주고 같은 화면에서 첫 행동(짧은 입력)을 체험하게 하는 소개 화면이다. | 배포 | Web · Native |
| [온보딩](screens/flow-onboarding.md) | 소개 | 첫 실행 사용자를 몇 단계(소개 → 관심 주제 → 시작)로 안내하고 마지막 단계에서 완료를 저장하는 화면을 OnboardingScreen 하나로 구성한다. | 배포 | Web · Native |
| [권한 안내](screens/flow-permission.md) | 소개 | PermissionScreen을 사용해 권한 안내 흐름을 구성한다. | 배포 | Web · Native |
| [기능 카드와 주 행동](screens/product-bento.md) | 소개 | 기능을 실제 미리보기로 보여 주고 첫 행동으로 이어지는 소개 화면이다. | 배포 | Web · Native |
| [로그인](screens/common-login.md) | 계정 | AuthScreenLayout을 사용해 로그인 흐름을 구성한다. | 배포 | Web · Native |
| [프로필](screens/common-profile.md) | 계정 | 내 프로필을 보고(요약·게시물·계정 메뉴) 고치는(사진·이름·소개) 화면을 ProfileScreen과 EditorScreen으로 구성한다. | 배포 | Web · Native |
| [알림 설정](screens/notification-settings.md) | 설정 | 알림 종류 몇 개를 스위치로 켜고 끈 뒤 하단 버튼 하나로 저장하는 설정 화면이다. | 배포 | Web · Native |
| [앱 설정](screens/common-settings.md) | 설정 | SettingsScreen을 사용해 설정 흐름을 구성한다. | 배포 | Web · Native |
| [검색 결과와 필터](screens/common-search.md) | 검색 | 입력 중 제안 → 확정 → 결과·필터의 두 단계 검색 화면을 SearchScreen 하나로 구성한다. | 배포 | Web · Native |
| [작품 탐색](screens/discovery-gallery.md) | 검색 | 여러 사람의 작품(카드)을 검색·카테고리·정렬로 훑고, 마음에 드는 것을 저장하고, 하나를 시트로 크게 보는 갤러리 화면이다. | 배포 | Web · Native |
| [대시보드](screens/dashboard.md) | 콘텐츠 | 한 기간의 개인 활동을 숫자 요약 → 날짜별 활동 → 기록 목록 순서로 돌아보는 화면이다. | 배포 | Web · Native |
| [목록과 상세](screens/flow-collection.md) | 콘텐츠 | ListDetailScreen을 사용해 목록과 상세 흐름을 구성한다. | 배포 | Web · Native |
| [사진 선택과 업로드](screens/flow-media.md) | 콘텐츠 | MediaSelectionScreen을 사용해 사진 선택과 업로드 흐름을 구성한다. | 배포 | Web · Native |
| [작성과 수정](screens/flow-editor.md) | 콘텐츠 | EditorScreen을 사용해 작성과 수정 흐름을 구성한다. | 배포 | Web · Native |
| [저장한 항목](screens/common-saved.md) | 콘텐츠 | SavedItemsScreen을 사용해 저장한 항목 흐름을 구성한다. | 배포 | Web · Native |
| [댓글](screens/common-comments.md) | 소통 | CommentThreadScreen을 사용해 댓글 흐름을 구성한다. | 배포 | Web · Native |
| [신고와 차단](screens/flow-moderation.md) | 소통 | ModerationScreen을 사용해 신고와 차단 흐름을 구성한다. | 배포 | Web · Native |
| [알림함](screens/common-inbox.md) | 소통 | NotificationInboxScreen을 사용해 알림함 흐름을 구성한다. | 배포 | Web · Native |
| [채팅](screens/common-chat.md) | 소통 | ChatScreen을 사용해 채팅 흐름을 구성한다. | 배포 | Web · Native |
| [기록 표현 비교](screens/reference-comparison.md) | 화면 틀과 도구 | ScreenLayout을 사용해 같은 기록의 세 가지 구성 흐름을 구성한다. | 배포 | Web · Native |
| [목업 편집](screens/mockup-studio.md) | 화면 틀과 도구 | 제품 화면 캡처를 휴대폰·브라우저 프레임에 넣어 스토어·소개용 이미지(PNG)와 짧은 장면 영상을 만드는 Web 전용 작업 도구 화면이다. | 배포 | Web |
| [화면 골격과 상태](screens/common-shell.md) | 화면 틀과 도구 | ScreenLayout을 사용해 화면 골격 흐름을 구성한다. | 배포 | Web · Native |
