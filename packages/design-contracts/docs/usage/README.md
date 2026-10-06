# HJM 컴포넌트 사용 지침 색인

이 파일은 `pnpm usage:sync`가 각 지침에서 생성한다. 직접 수정하지 않는다.

소비 앱에서 화면을 만들기 전에 이 표에서 문제에 맞는 컴포넌트를 찾고, 그 지침의
"쓰지 않을 때"까지 읽은 뒤 고른다. 표에 맞는 것이 없을 때만 제품에서 조합한다.
설치한 버전의 지침을 본다: `node_modules/@hjmds/design-contracts/docs/usage/`.

| 컴포넌트 | 언제 쓰나 | Web | Native |
| --- | --- | --- | --- |
| [Accordion](accordion.md) | 서로 관계가 있는 여러 접힘 항목을 한 그룹으로 보일 때 쓴다. | O | O |
| [ActivityHeatmap](activity-heatmap.md) | 최대 1년(366일) 범위의 일별 활동량을 한눈에 보여 주는 읽기 전용 개요에 쓴다. | O | O |
| [Affix](affix.md) | Web에서 스크롤하는 동안 요약·필터·저장 버튼 같은 작은 영역을 가장 가까운 스크롤 조상의 상단에 붙여 두고, 부모가 끝나면 함께 풀리게 할 때 쓴다. | O | — |
| [Agreement](agreement.md) | 가입·결제·서비스 시작 앞의 약관 동의 묶음에 쓴다. | O | O |
| [AlertDialog](alert-dialog.md) | 삭제·결제·탈퇴처럼 되돌릴 수 없는 행동 직전의 확인(`mode="confirm"`)과, 사용자가 반드시 읽고 닫아야 하는 짧은 알림(`mode="alert"`)에 쓴다. | O | O |
| [Anchor](anchor.md) | Web의 긴 문서·가이드·약관에서 같은 페이지 안 섹션으로 이동하는 목차에 쓴다. | O | — |
| [AspectRatio](aspect-ratio.md) | 이미지·동영상·지도처럼 늦게 로드되는 매체의 자리를 미리 잡아 레이아웃 흔들림을 막을 때 쓴다. | O | O |
| [Asset](asset.md) | 아이콘·이미지·Lottie·비디오를 같은 크기·모서리 규칙의 액자에 넣을 때 쓴다. | O | O |
| [AuthProviderButton](auth-provider-button.md) | Google·Kakao·Naver·Apple 소셜 로그인 버튼에 쓴다. | O | O |
| [AuthScreenLayout](auth-screen-layout.md) | 로그인·가입 진입 화면의 배치에 쓴다. | O | O |
| [Avatar](avatar.md) | 사람·계정을 사진 또는 이니셜로 나타낼 때 쓴다. | O | O |
| [Badge](badge.md) | 항목의 상태나 분류를 짧은 글자 하나로 붙일 때 쓴다. | O | O |
| [BottomCTA](bottom-cta.md) | 화면의 결론 행동(저장·다음·결제·가입)을 본문 아래 하단 영역에 둘 때 쓴다. | O | O |
| [BottomInfo](bottom-info.md) | 주 행동 아래에 늘 붙어 있는 작은 조건 문장에 쓴다. | O | O |
| [BottomNavigation](bottom-navigation.md) | 앱의 안정된 최상위 route(홈·검색·메시지·내 정보) 2~6개 사이를 이동하는 하단 막대에 쓴다. | O | O |
| [Breadcrumb](breadcrumb.md) | Web의 깊은 계층 화면에서 현재 위치까지의 경로를 보여 주고 상위 계층으로 바로 돌아가게 할 때 쓴다. | O | — |
| [Button](button.md) | 사용자가 누르면 무언가가 일어나는 텍스트 행동에 쓴다. | O | O |
| [Calendar](calendar.md) | 화면에 항상 펼쳐진 한 달 격자에서 날짜 하나를 고를 때 쓴다. | O | O |
| [Card](card.md) | 제목·설명·본문·행동이 한 덩어리로 읽히는 독립된 콘텐츠 단위에 쓴다. | O | O |
| [Carousel](carousel.md) | 한 번에 카드 하나만 보이고 사용자가 순서대로 넘겨 보는 유한한 묶음에 쓴다. | O | O |
| [Celebration](celebration.md) | 목표 달성, 첫 완료처럼 드물게 일어나는 성공 순간에 한 번 터지는 색종이 효과에 쓴다. | O | O |
| [ChatMessage](chat-message.md) | DM·대화 타임라인의 메시지 한 개에 쓴다. | O | O |
| [ChatScreen](chat-screen.md) | DM·대화방처럼 헤더, 메시지 타임라인, 하단 작성창으로 이루어진 화면 한 장에 쓴다. | O | O |
| [Checkbox](checkbox.md) | 독립된 예/아니오 하나를 고르는 항목에 쓴다. | O | O |
| [CheckboxGroup](checkbox-group.md) | 한 질문에 대한 여러 선택지 중 0개 이상을 고르게 할 때 쓴다. | O | O |
| [Chip](chip.md) | 누를 수 있는 작은 pill이다. | O | O |
| [CodeBlock](code-block.md) | 코드·명령·설정 조각을 읽기 전용으로 보여 주고 사용자가 선택·복사하게 할 때 쓴다. | O | O |
| [Collapsible](collapsible.md) | 이웃 없이 혼자 접었다 펴는 한 덩어리에 쓴다. | O | O |
| [ColorPicker](color-picker.md) | 사용자가 콘텐츠 색(라벨 색, 태그 색, 테마 편집기의 사용자 값 등)을 sRGB HEX로 고르는 폼 입력에 쓴다. | O | — |
| [Combobox](combobox.md) | 주어진 목록에서 하나를 고르는데 목록이 길어 입력으로 좁혀야 할 때 쓴다. | O | O |
| [CommandPalette](command-palette.md) | ⌘K 스타일로 앱 전체의 **행동**을 검색해 실행하는 모달에 쓴다. | O | — |
| [CommentThreadScreen](comment-thread-screen.md) | 게시물·콘텐츠 아래의 댓글 화면 한 장에 쓴다. | O | O |
| [Container](container.md) | 화면 본문의 최대 폭과 좌우(논리 방향) 여백을 맞출 때 쓴다. | O | O |
| [ContentTransition](content-transition.md) | 같은 자리의 내용이 상태에 따라 바뀔 때(필터 결과 패널, 단계별 본문) 새 내용이 짧게 나타나도록 감싼다. | O | O |
| [ContextMenu](context-menu.md) | Web에서 제품이 소유한 영역(카드·목록 행·캔버스)의 우클릭·길게 누르기·Shift+F10에 명령 목록을 띄울 때 쓴다. | O | O |
| [CounterBadge](counter-badge.md) | 읽지 않은 알림·메시지·장바구니 수처럼 **셀 수 있는 개수**를 아이콘·행 옆에 작게 보일 때 쓴다. | O | O |
| [DataTable](data-table.md) | 여러 행의 데이터를 열로 맞춰 훑고, 열 기준으로 정렬하거나 행을 골라 일괄 작업할 때 쓴다(Web). 정렬·필터 실행, 페이지 나누기는 제품이 소유한다. | O | — |
| [DatePicker](date-picker.md) | 폼·필터 자리에서 날짜 **하나**를 고를 때 쓴다(생년월일, 방문일, 시작일 필터). 평소에는 필드 트리거만 보이고, 누르면 Web은 필드에 붙은 팝오버, Native는 [Sheet](sheet.md) 안에 같은 달력 격자를 연다. | O | O |
| [DateRangePicker](date-range-picker.md) | 시작~끝 날짜 **구간**을 고를 때 쓴다(통계 기간, 예약, 검색 필터). 필드 트리거나 오버레이 없이 달력 격자를 그 자리에 펼쳐 둔다. | O | O |
| [DescriptionList](description-list.md) | 라벨-값 쌍의 묶음을 보여 줄 때 쓴다. | O | O |
| [DesignSystemProvider](design-system-provider.md) | 앱 루트에 한 번 둔다. | O | O |
| [Dialog](dialog.md) | 화면 흐름을 잠시 멈추고 사용자의 주의가 필요한 **짧은 작업**에 쓴다. | O | O |
| [Divider](divider.md) | 서로 다른 내용 묶음 사이에 얇은 구분선이 필요할 때 쓴다. | O | O |
| [EditorScreen](editor-screen.md) | 글쓰기·프로필 수정처럼 한 화면 전체가 편집 흐름일 때 쓴다. | O | O |
| [EffectSurface](effect-surface.md) | 환영·온보딩·빈 히어로처럼 분위기를 주는 배경이 필요할 때 내용 뒤에 장식 레이어(mesh·glow·grain)를 깐다. | O | O |
| [EmptyState](empty-state.md) | 목록이 비었거나 검색 결과가 0건이라 **아직 없음**을 알릴 때 쓴다. | O | O |
| [Field](field.md) | 라벨·도움말·오류를 가진 입력 칸에 쓴다. | O | O |
| [FilePicker](file-picker.md) | 사용자가 업로드할 로컬 파일을 고르게 할 때 쓴다. | O | O |
| [FloatingActionButton](floating-action-button.md) | 목록·피드처럼 스크롤되는 콘텐츠 위에 떠 있는 **단일 생성 행동**(새 기록 추가, 새 글 작성)에 쓴다. | O | O |
| [Form](form.md) | 여러 [Field](field.md)를 한 화면에 쌓고 한 번에 제출할 때 쓴다. | O | O |
| [Grid](grid.md) | 카드·타일처럼 같은 모양의 자식을 창 크기에 따라 열 수를 바꿔 배치할 때 쓴다. | O | O |
| [Heading](heading.md) | 자리를 모르는 큰 제목 글자 하나가 필요할 때 쓴다. | O | O |
| [Icon](icon.md) | HJM semantic 이름(`search`, `back`, `chevronEnd`, `notifications` 등 43개)으로 고르는 그림 기호에 쓴다. | O | O |
| [IconButton](icon-button.md) | 보이는 글자 없이 아이콘만으로 표시하는 행동에 쓴다. | O | O |
| [Image](image.md) | 원본 크기를 아는 사진·차트 이미지를 로드 전에 자리를 잡아 두고, 실패해도 의미를 잃지 않게 보여 줄 때 쓴다. | O | O |
| [ImageComparison](image-comparison.md) | 같은 좌표와 가로세로 비율의 전후 이미지를 한 프레임에서 비교할 때 쓴다. | O | O |
| [KeyboardAvoiding](keyboard-avoiding.md) | 추가 native peer 없이 하단 행동(BottomCTA, 채팅 입력창)이 소프트웨어 키보드에 가려지지 않게 할 때 쓴다. | — | O |
| [KeyboardDock](keyboard-dock.md) | `react-native-keyboard-controller`를 설치한 앱에서 화면 하단에 고정된 행동(BottomCTA, 채팅 입력창)이 키보드와 함께 위아래로 움직이게 할 때 쓴다. | — | O |
| [KeyboardFormScrollView](keyboard-form-scroll-view.md) | 입력 필드가 여러 개인 세로 스크롤 폼(가입, 프로필 수정, 주소 입력)에서 포커스된 필드가 키보드에 가려지지 않게 스크롤해 줄 때 쓴다. | — | O |
| [KeyboardMotionProvider](keyboard-motion-provider.md) | `@hjmds/react-native/keyboard-controller` 어댑터(KeyboardDock, KeyboardFormScrollView)를 쓰는 앱의 루트에 **한 번** 설치한다. | — | O |
| [Layout](layout.md) | 앱의 상시 골격(header · sidebar · main · footer)을 한 번 세울 때 쓴다. | O | O |
| [Link](link.md) | 사용자가 복사하거나 새 탭으로 열 수 있는 **목적지**로 이동할 때 쓴다. | O | O |
| [List](list.md) | 이미 다 불러온, 개수가 많지 않은 행들을 이름 있는 목록 하나로 묶을 때 쓴다. | O | O |
| [ListDetailScreen](list-detail-screen.md) | 목록 화면에서 한 항목의 상세를 같은 화면 안에서 열고, 뒤로 오면 목록의 입력·스크롤이 그대로 남아야 할 때 쓴다. | O | O |
| [ListRow](list-row.md) | 목록의 한 줄에 쓴다. | O | O |
| [LoadMore](load-more.md) | 이미 그린 항목을 그대로 둔 채 목록 끝에서 다음 페이지를 요청하는 footer에 쓴다. | O | O |
| [Masonry](masonry.md) | 높이가 서로 다른 카드(사진 피드, 핀보드, 갤러리)를 여러 열에 빈틈없이 쌓을 때 쓴다. | O | O |
| [MediaSelectionScreen](media-selection-screen.md) | 고른 사진·영상을 큰 썸네일 격자로 보여 주고, 각 항목의 업로드 상태·재시도·취소·순서 이동·삭제와 "추가"·"완료" 행동을 한 화면에 묶을 때 쓴다. | O | O |
| [Mentions](mentions.md) | 여러 줄 입력 중 `@`(사람)·`#`(해시태그) 같은 트리거를 치면 후보를 띄우고, 고른 후보를 트리거부터 커서까지 자리에 넣고 공백 하나를 붙이는 입력에 쓴다. | O | O |
| [Menu](menu.md) | 트리거 버튼을 누르면 뜨는 **항목 목록**에 쓴다. | O | O |
| [Menubar](menubar.md) | 데스크톱 Web 앱 상단에 항상 같은 자리에 있는 가로 메뉴 막대(파일·편집·보기)에 쓴다. | O | — |
| [MessageComposer](message-composer.md) | 채팅·DM·댓글 입력창에 쓴다. | O | O |
| [ModerationScreen](moderation-screen.md) | 게시물·댓글·사용자 **신고** 화면에 쓴다. | O | O |
| [Notice](notice.md) | 화면 흐름 안 **제자리에 남아 있는** 상태 알림에 쓴다. | O | O |
| [NotificationInboxScreen](notification-inbox-screen.md) | 알림함 화면 전체 틀에 쓴다. | O | O |
| [NotificationItem](notification-item.md) | 알림함의 알림 한 행에 쓴다. | O | O |
| [NumberField](number-field.md) | 범위가 정해진 **정확한 수 하나**를 입력받을 때 쓴다. | O | O |
| [OnboardingScreen](onboarding-screen.md) | 첫 실행 소개·초기 설정처럼 **몇 단계를 차례로 넘기는 화면**에 쓴다. | O | O |
| [OtpField](otp-field.md) | 문자·메일로 받은 **숫자 인증번호**를 칸 모양으로 입력받을 때 쓴다. | O | O |
| [Pagination](pagination.md) | 총 개수(또는 총 페이지 수)가 정해진 결과 집합에서 사용자가 **임의의 페이지로 바로 이동**해야 할 때 Web에서 쓴다. | O | — |
| [PasswordField](password-field.md) | 비밀번호를 입력받고, 필요할 때만 값을 눈으로 확인하게 할 때 쓴다. | O | O |
| [PermissionScreen](permission-screen.md) | 카메라·위치·알림 같은 권한이 **왜 필요한지 설명하고 다음 행동을 고르게 하는** 화면에 쓴다. | O | O |
| [PhotoSourceSheet](photo-source-sheet.md) | 사진 버튼 하나에서 **앨범에서 고르기 / 촬영하기**를 고르게 할 때 쓴다. | O | O |
| [Popover](popover.md) | 트리거에 붙어 뜨는 비모달 표면 안에 **포커스를 받는 임의 콘텐츠**를 둘 때 쓴다. | O | — |
| [ProfileScreen](profile-screen.md) | 내 프로필(또는 계정) 화면 틀에 쓴다. | O | O |
| [Progress](progress.md) | 작업이 얼마나 진행됐는지 보여 줄 때 쓴다. | O | O |
| [QRCode](qr-code.md) | 문자열(초대 링크, 연결 코드, 결제·체크인 URL)을 다른 기기의 카메라로 스캔하게 할 때 쓴다. | O | O |
| [Radio](radio.md) | 라디오 한 개를 제품이 직접 배치해야 할 때만 쓴다. | O | O |
| [RadioGroup](radio-group.md) | 한 화면에 펼쳐 둔 선택지 중 정확히 하나를 고를 때 쓴다. | O | O |
| [Rating](rating.md) | 사용자가 정수 별점을 고르거나, 이미 계산된 평균 점수를 읽기 전용으로 보여 줄 때 쓴다. | O | O |
| [Result](result.md) | 사용자 행동 뒤 흐름이 **끝난** 화면에 쓴다. | O | O |
| [ScreenLayout](screen-layout.md) | 한 라우트 화면의 뼈대가 필요할 때 쓴다. | O | O |
| [SearchField](search-field.md) | 목록·화면 안에서 검색어를 입력받을 때 쓴다. | O | O |
| [SearchScreen](search-screen.md) | 검색어 입력, 필터, 최근 검색, 결과 목록을 갖춘 검색 화면 전체에 쓴다. | O | O |
| [Section](section.md) | 화면 안의 내용 묶음에 제목·설명·머리 행동(“모두 보기”, “편집”)을 붙일 때 쓴다. | O | O |
| [SegmentedControl](segmented-control.md) | 2~4개의 짧은 보기 중 **항상 하나가 선택된** 전환에 쓴다. | O | O |
| [Select](select.md) | 폼 한 칸에서 여러 선택지 중 하나를 고르게 할 때 쓴다. | O | O |
| [SettingsScreen](settings-screen.md) | 앱의 설정 화면 전체에 쓴다. | O | O |
| [SharedTransitionElement](shared-transition-element.md) | 목록의 카드(사진·썸네일)를 눌러 상세 화면으로 갈 때, 같은 요소가 두 화면 사이에서 확대·축소되어 이어지는 공유 요소 전환에 쓴다. | — | O |
| [SharedTransitionScreen](shared-transition-screen.md) | `createHjmTransitionStack()`으로 만든 stack에서 공유 요소 전환을 쓸 때, **각 라우트 본문**을 감싼다. | — | O |
| [Sheet](sheet.md) | 현재 화면 위에 모달로 띄우는 보조 작업 패널에 쓴다. | O | O |
| [Sidebar](sidebar.md) | 데스크톱 Web의 세로 내비게이션에 쓴다. | O | — |
| [SidePanel](side-panel.md) | Web 화면 가장자리(시작·끝)에 도킹되어 밀려 나오는 보조 패널에 쓴다. | O | — |
| [Skeleton](skeleton.md) | 데이터가 오기 전, 곧 채워질 콘텐츠의 **모양을 미리 보여 줄 때** 쓴다. | O | O |
| [SkipNav](skip-nav.md) | Web 화면에서 반복되는 머리(내비게이션·헤더)를 건너뛰고 본문으로 가는 링크가 필요할 때 쓴다. | O | — |
| [Slider](slider.md) | 범위 안에서 값 하나를 대략적으로, 연속 조작으로 고를 때 쓴다. | O | O |
| [SortableCollection](sortable-collection.md) | 작은 목록의 순서를 사용자가 바꾸고, 그 순서를 제품이 저장할 때 쓴다(즐겨찾기 순서, 할 일 순서 등). 드래그와 함께 각 행에 "앞으로/뒤로" 버튼과 키보드·접근성 action이 항상 붙는다. | O | O |
| [Spinner](spinner.md) | 진행량을 모르고 도착할 내용의 모양도 정해지지 않은 **짧은 대기**를 한 자리에서 알릴 때 쓴다. | O | O |
| [Splitter](splitter.md) | 넓은 Web 화면에서 두 영역의 경계를 사용자가 드래그나 키보드로 옮겨 크기를 정할 때 쓴다. | O | — |
| [Stack](stack.md) | 자식들을 한 방향으로 늘어놓고 사이 간격을 토큰으로 맞출 때 쓴다. | O | O |
| [Statistic](statistic.md) | 라벨이 붙은 **숫자 지표 하나**(또는 여러 개)를 보여 줄 때 쓴다. | O | O |
| [Steps](steps.md) | 여러 단계로 된 **선형 흐름에서 지금 어디인지** 보여 줄 때 쓴다. | O | O |
| [Surface](surface.md) | 배경·테두리·radius를 가진 **의미 없는 상자**가 필요할 때 쓴다. | O | O |
| [SwipeActions](swipe-actions.md) | 목록 행 하나에 붙은 **삭제·보관 같은 행 단위 행동**을, Native에서는 행을 밀어 드러내고 Web에서는 행 아래 버튼으로 바로 보여 줄 때 쓴다. | O | O |
| [Switch](switch.md) | 켜고 끄는 즉시 반영되는 설정 하나에 쓴다. | O | O |
| [Tabs](tabs.md) | 같은 화면 안에서 **서로 다른 패널 여러 개 중 하나를 보여 줄 때** 쓴다. | O | O |
| [Tag](tag.md) | 반복해서 나오는 **정적 메타데이터 한 조각**에 쓴다. | O | O |
| [TagsInput](tags-input.md) | 사용자가 **자유 입력으로 여러 값을 모으는 필드**에 쓴다. | O | O |
| [Text](text.md) | 화면의 모든 일반 글자에 쓴다. | O | O |
| [TextArea](text-area.md) | 여러 줄 자유 글을 받는 입력에 쓴다. | O | O |
| [TextFormat](text-format.md) | 도움말·개발자 안내·약관 본문 안에서 단축키(`⌘S`), 짧은 코드 조각(`pnpm add …`), 인용문을 표시할 때 쓴다. | O | — |
| [TextTransition](text-transition.md) | 같은 자리의 짧은 문자열이 바뀔 때(상태 문구, 버튼 옆 안내, 단계 이름) 바뀐 순간을 짧은 등장 모션으로 알린다. | O | O |
| [ThinkingOrb](thinking-orb.md) | AI 에이전트가 실제로 검색·생성·듣기 같은 작업을 하는 동안 그 단계를 보여 줄 때만 쓴다. | O | O |
| [Timeline](timeline.md) | 이미 일어난 일을 시간 순서대로 보여 줄 때 쓴다. | O | O |
| [Toast](toast.md) | 방금 한 행동의 결과처럼 **무시해도 안전한 짧은 알림**에 쓴다. | O | O |
| [ToggleGroup](toggle-group.md) | 여러 개를 동시에 켜고 끄는 짧은 버튼 묶음에 쓴다. | O | O |
| [Tooltip](tooltip.md) | Web에서 이미 이름과 focus를 가진 컨트롤(대개 [IconButton](icon-button.md))에 **짧은 보충 설명 한 문장**을 붙일 때 쓴다. | O | — |
| [Top](top.md) | 화면 **본문의 첫 블록**에 쓴다. | O | O |
| [TopBar](top-bar.md) | 화면 맨 위에 붙는 **크롬**에 쓴다. | O | O |
| [Tour](tour.md) | 새 화면·새 기능을 처음 만난 사용자에게 화면의 여러 요소를 순서대로 짚어 설명할 때 쓴다. | O | — |
| [TransferList](transfer-list.md) | 한 항목 집합을 두 목록으로 나누고 사용자가 항목을 오가게 할 때 쓴다. | O | O |
| [Tree](tree.md) | 깊이가 정해지지 않은 계층 데이터를 펼치고 접으며 탐색하고, 그 안에서 하나 또는 여럿을 고를 때 쓴다. | O | — |
| [UploadItem](upload-item.md) | 사용자가 고른 파일 **한 개**의 업로드 상태(대기·전송 중·완료·실패)를 한 행으로 보여 줄 때 쓴다. | O | O |
| [VirtualList](virtual-list.md) | 행 높이가 **모두 같은** 긴 목록(수백~수천 행)을 정해진 높이 안에서 스크롤할 때 쓴다. | O | O |
| [VisuallyHidden](visually-hidden.md) | Web에서 화면에는 보이지 않지만 스크린 리더는 읽어야 하는 **문맥 문구**를 덧붙일 때 쓴다. | O | — |
| [Watermark](watermark.md) | Web에서 문서 미리보기·초안 화면 위에 "초안", 프로젝트 이름 같은 **장식용 출처 표시 텍스트**를 비스듬히 반복해 깔 때 쓴다. | O | — |
