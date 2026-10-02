# HJM 디자인 시스템 컴포넌트 중복 조사

2026년 10월 1일 현재 checkout의 계약, React Web, React Native 공개 API를 조사했다. 컴포넌트가 완전히 중복돼 즉시 삭제해야 한다는 결론은 없지만, 표·메뉴·필드·캐러셀에는 기능 또는 내부 구현이 겹치는 부분이 있다. 특히 메뉴는 검색 동작이 이미 갈라져 있고, Table을 표시 전용으로 설명하는 문서가 구현의 정렬 기능을 충분히 반영하지 않는다.

후속 변경과 검증 결과는 [개선 결과](IMPROVEMENTS.md)에 기록했다. 아래는 개선 전 snapshot이며 당시 source 위치와 판정을 보존한다.

## 조사 범위와 검증 한계

- 세 public package의 manifest version은 모두 1.10.0이다. npm 게시 상태를 조사한 결과는 아니다.
- 카탈로그 103개 전부를 역할 군에 배정하고 공개 renderer 선언과 연결했다. Web 103개, Native 83개가 지원 표면이며 20개는 Native unsupported다.
- Web의 JavaScript 공개 진입점 69개와 Native 54개를 TypeScript symbol로 추적했다. 같은 export의 재노출은 정의 파일을 기준으로 하나로 계산했다.
- 고유 public runtime value는 Web 140개, Native 123개다. 이 중 대문자로 시작하는 컴포넌트·provider·보조 export는 각각 121개, 106개다. 카탈로그 개념 provider를 실제 이름에 대응하면 카탈로그 밖 이름은 Web 18개, Native 23개이며 이 수는 플랫폼별 출현 수다.
- 세 package의 src 안 TypeScript/TSX 256개, 55,933행을 목록화하고 동일 token 블록을 기계적으로 대조했다. 역할이 유사한 군은 관련 구현·계약·CSS·설계 문서를 직접 대조했다. 모든 55,933행을 수작업으로 읽었다는 뜻은 아니다.
- 카탈로그 name 및 aliases 중복은 0건이다. renderer별 같은 public export 이름이 다른 정의 파일로 해석되는 충돌도 발견되지 않았다. root/family/granular 재노출은 정상적인 배포 경로다.
- recipe를 공유하는 군은 6개, behavior를 공유하는 군은 1개다. 이것만으로 중복이라고 판정하지 않았다.
- 기본 Web/Native 대응 소스는 플랫폼 구현이므로 중복 제거 대상으로 세지 않았다. 선택형 확장과 내부 helper도 포함했다. 소비 앱의 자체 wrapper는 이번 HJM 저장소 전수 목록의 범위 밖이다.
- 기존 미커밋 변경을 포함한 working tree 조사다. Git HEAD는 `8543b6fb886321cff9a5d50837ffcb99db6b859e`이다. 소스 SHA와 공개 선언 위치는 [조사 목록](../../../docs/audits/component-overlap-2026-10-01/inventory.json)에 남겼다.
- 이번 조사에서는 실행 테스트·브라우저·Device Hub 화면 검증·배포를 수행하지 않았다. 동작 차이는 코드에서 확인했으며 사용자 입력으로 재현한 버그로 주장하지 않는다. 기존 구현·lockfile·배포 설정은 변경하지 않았다.

## 정리가 필요한 여섯 영역

### F1 표의 정렬 기능 중복과 문서 불일치

확인 사실: 공개 `Table`은 `sortable`, `sortDirection`, `onSortChange`, header button과 `aria-sort`를 제공한다. 클릭할 때 ascending/descending을 전환한다. `DataTable`도 정렬 header와 callback을 별도로 구현하면서 선택·tri-state·async 상태를 추가한다. 그러나 data-table 문서는 Table을 표시용이며 정렬 상태 순환이 없는 것으로 설명한다. DataTable의 tri-state sort와 Table의 두 방향 전환은 다르지만 정렬 기능 전체가 분리돼 있다는 설명은 맞지 않는다.

근거: [packages/react/src/advanced-display.tsx](../../../packages/react/src/advanced-display.tsx) 595–703행, [packages/react/src/data-table.tsx](../../../packages/react/src/data-table.tsx) 47–194행, [packages/design-contracts/docs/data-table.md](../../../packages/design-contracts/docs/data-table.md) 87–89행.

판정: 기능의 부분 중복이며 문서와 코드의 경계가 어긋난다. Table은 caption·generic row·emptyState 경로가 있어 바로 DataTable로 대체하면 기능을 잃을 수 있다.

제안: 먼저 문서에 Table의 두 방향 정렬과 DataTable의 추가 계약을 정확히 적고, header/cell shell와 정렬 정책을 공통화한다. 공개 API 제거는 소비처와 caption·emptyState·row 모델 호환성을 확인한 뒤 별도 migration으로 판단한다.

### F2 메뉴 항목 탐색이 별도로 구현돼 동작이 갈림

확인 사실: `Menu`의 typeahead는 500ms, 현재 항목 다음부터 탐색, 반복 문자 순환, `textValue`를 사용한다. `MorphingMenu`는 600ms, DOM `textContent`로 처음부터 찾고 반복 문자 순환이 없다. `ContextMenu`는 700ms, `textValue`로 처음부터 찾는다. 모두 같은 항목 목록을 빠르게 찾는 기능을 각자 유지한다.

근거: [packages/react/src/overlays.tsx](../../../packages/react/src/overlays.tsx) 1197–1217행, [packages/react/src/menu-morph.tsx](../../../packages/react/src/menu-morph.tsx) 43–60행, [packages/react/src/context-menu.tsx](../../../packages/react/src/context-menu.tsx) 83–116행. 선택형 메뉴의 의도는 [packages/design-contracts/docs/optional-adapters.md](../../../packages/design-contracts/docs/optional-adapters.md) Behavior boundaries에 있다.

판정: 메뉴의 열림 방식과 presentation은 구분할 이유가 있지만 검색 정책의 반복은 실제 유지보수 중복이다. 렌더링 label과 textValue가 다르면 MorphingMenu의 검색 결과가 기본 Menu와 달라질 수 있다. 이 결과는 코드로부터의 추론이며 브라우저 재현은 미실행이다.

제안: 순수 항목 탐색·반복 문자·timeout 정책을 shared helper로 추출하고 Menu/MorphingMenu/ContextMenu에서 소비한다. Menubar의 좌우 상위 메뉴 이동과 Native OS 메뉴는 해당 host에 유지한다. API 통합보다 behavior 공유가 우선이다.

### F3 Native 입력 프레임의 반복과 스타일 계약 분산

확인 사실: 공개 `Field`는 forms.tsx에서 라벨·description/error·required 표시를 만든다. `TextField`와 `TextArea`는 inputs.tsx의 별도 `FieldRenderer`와 `FieldMessage`가 같은 슬롯을 만든다. Field는 spacing.xs와 Text tone primary를 직접 쓰고, FieldRenderer는 fieldRecipe의 label color/fontWeight/textVariant를 쓴다. `GestureSheetInput`은 BottomSheetTextInput에 별도 border·radius·fontSize·48 높이를 적용하며 fieldRecipe를 소비하지 않는다.

근거: [packages/react-native/src/forms.tsx](../../../packages/react-native/src/forms.tsx) 138–175행, [packages/react-native/src/inputs.tsx](../../../packages/react-native/src/inputs.tsx) 184–412행, [packages/react-native/src/sheet-gesture.tsx](../../../packages/react-native/src/sheet-gesture.tsx) 14–21행.

판정: Field는 custom control의 프레임, TextField는 실제 input이므로 공개 API는 구분된다. 중복은 label/support/error presentation의 소유권에 있다. GestureSheetInput의 keyboard host는 필요하지만 독자 스타일이 추가됐다.

제안: 공용 Native field frame에서 label/support/error/required 스타일을 소유하고 control host를 슬롯으로 받는다. GestureSheetInput의 keyboard tracking host는 보존하되 기본 input presentation을 같은 recipe에 연결한다. Search/Password/OTP/Number/Date 계열은 기능 고유 affordance를 유지한다.

### F4 기본 캐러셀과 모션 캐러셀의 병렬 의미 계약

확인 사실: 기본 Carousel은 carousel descriptor, controlled/uncontrolled selection, accessible-name composer, autoplay·pause, 비활성 슬라이드 처리 등을 제공한다. `CarouselMotion`은 interaction-adapters의 `SortableItem`과 `validateCarousel`을 사용해 별도 currentKey·slide rendering·이전/다음 버튼을 구현한다. Web은 Embla, Native는 Reanimated Carousel을 사용하며 기본 Carousel을 내부에서 소비하지 않는다.

근거: [packages/react/src/carousel.tsx](../../../packages/react/src/carousel.tsx) 23행 이후, [packages/react/src/carousel-motion.tsx](../../../packages/react/src/carousel-motion.tsx) 11행 이후, [packages/react-native/src/carousel.tsx](../../../packages/react-native/src/carousel.tsx) 24행 이후, [packages/react-native/src/carousel-motion.tsx](../../../packages/react-native/src/carousel-motion.tsx) 21행 이후.

판정: swipe/motion host와 optional dependency 격리는 의도된 확장이다. 다만 단순 presentation 변경처럼 보이는 이름에 비해 base의 선택·label·autoplay 계약을 온전히 잇는 adapter는 아니다. 슬라이드 선택과 내비게이션 의미가 두 경로에 유지된다.

제안: 외부 motion host는 선택형 subpath에 두고, 공통 Carousel descriptor·selection·accessible naming을 연결한다. autoplay를 지원하지 않는 확장이라는 범위도 문서에 명확히 적는다. 기본 Carousel API에 optional native peer를 강제하지 않는다.

### F5 카탈로그만으로는 공개 범위를 전부 볼 수 없음

확인 사실: 실제 `TextField`, `Table`, `NativeSelect` 등은 공개되어 있으나 canonical componentCatalog에는 별도 이름으로 없고, group/provider/optional extension도 목록 밖이다. 같은 카탈로그 row를 여러 export가 구현하는 경우와 별도 확장을 구분해야 한다.

근거: [packages/design-contracts/src/catalog.ts](../../../packages/design-contracts/src/catalog.ts), [packages/react/src/index.ts](../../../packages/react/src/index.ts), [packages/react-native/src/index.ts](../../../packages/react-native/src/index.ts), 양 renderer package.json의 exports. 아래 전체 부록에 외부 이름을 별도로 기록했다.

판정: 103개가 전체 공개 컴포넌트 API 수라는 주장은 틀리다. 목록 밖이라는 이유로 unsupported나 중복으로 판정할 수도 없다. 카탈로그는 의미 계약, package exports는 실제 사용 API다.

제안: 동결된 canonical catalog를 불필요하게 늘리기보다 public API→canonical family/companion/optional extension 대응표를 생성한다. 특히 Field와 TextField, DataTable과 Table, Select와 NativeSelect의 선택 기준을 소비 문서에 연결한다.

### F6 소규모 내부 코드 복제

확인 사실: Popover/Tooltip 계약은 object guard와 open-state key validation 구조를 반복한다. ThinkingOrb의 braid/ribbon은 ghost sphere의 점 생성 루프가 동일하다. Button/IconButton의 disabled 처리 일부도 반복된다. 100 token 이상 완전 일치 탐지는 이와 별도로 lattice/orbits 안의 수학 루프 반복도 찾았다.

근거: [packages/design-contracts/src/popover.ts](../../../packages/design-contracts/src/popover.ts) 128행 이후, [packages/design-contracts/src/tooltip.ts](../../../packages/design-contracts/src/tooltip.ts) 74행 이후, [packages/design-contracts/src/internal/thinking-orb/braid.ts](../../../packages/design-contracts/src/internal/thinking-orb/braid.ts) 14–24행, [packages/design-contracts/src/internal/thinking-orb/ribbon.ts](../../../packages/design-contracts/src/internal/thinking-orb/ribbon.ts) 22–32행, [packages/react/src/actions.tsx](../../../packages/react/src/actions.tsx) 56–169행.

판정: 공개 컴포넌트 삭제 사유가 아니라 낮은 우선순위의 내부 정리 후보다. Tooltip의 비상호작용 도움말과 Popover의 interactive content는 의미가 다르며 ThinkingOrb 모드의 주 알고리즘도 서로 다르다.

제안: 공용 validator 또는 ghost-dot helper를 추출할 수 있다. 수학 코드의 대칭 루프나 짧은 host 속성까지 모두 일반화할 필요는 없다. 수정 시 모드별 렌더 결과와 기존 API error 문구를 보존한다.

## 비슷해 보여도 유지해야 하는 구분

- **글자와 제목** — Text, TextFormat, Heading: 본문, 코드·인용 등의 의미 요소, 문서 제목은 의미와 typography 축이 다르다.
- **아이콘과 미디어** — Icon, Avatar, Asset, Image: Icon은 glyph, Avatar는 식별 이미지·initial fallback, Image는 로딩·오류·fit, Asset은 미디어 프레임·animation 허용 상태를 소유한다.
- **표면과 구획** — Surface, Card, Section: Surface는 표면 primitive, Card는 media·제목·actions를 갖는 콘텐츠 묶음, Section은 제목이 있는 구획이다. Card는 Surface를 소비한다.
- **배치와 화면 골격** — Stack, Container, AspectRatio, Grid, Layout, Masonry, Splitter, AuthScreenLayout: 방향·간격, 최대 너비, 종횡비, 정규 격자, 화면 슬롯, 높이가 다른 타일, pane 조절, 로그인 화면 골격은 다른 문제다.
- **상단 제목** — Top, TopBar: Top은 eyebrow·제목·설명 블록, TopBar는 뒤로가기와 화면 navigation actions를 담는 chrome이다.
- **행동** — Button, IconButton, Link, BottomCTA, FloatingActionButton, AuthProviderButton: 일반 행동, 이름 있는 아이콘 행동, 이동, 하단 행동 배치, 떠 있는 생성 행동, 제공자 브랜드 행동은 각각 계약이 있다. disabled 처리의 일부 반복은 낮은 비용의 내부 정리 후보다.
- **입력 필드** — Field, TextArea, SearchField, PasswordField, OtpField, NumberField, Slider: 입력 방식은 구분된다. Native 라벨·설명·오류 프레임은 여러 경로로 구현돼 있어 공유가 필요하다. TextField는 별도 공개 API 목록에서 조사했다.
- **선택 컨트롤** — Checkbox, Radio, CheckboxGroup, RadioGroup, Switch, Chip, SegmentedControl, ToggleGroup: checkbox는 복수 선택, radio는 단일 선택, switch는 즉시 설정, chip은 compact 선택, segmented는 단일 버튼 선택, toggle은 복수 버튼 선택이다. recipe 공유는 중복 API가 아니다.
- **컬렉션과 자유 입력** — Select, Combobox, Mentions, TransferList, TagsInput: Select는 후보 선택, Combobox는 입력으로 후보 필터링, Mentions는 caret 위치 삽입, TransferList는 집합 이동, TagsInput은 자유 입력 다중값이다. NativeSelect는 브라우저 기본 선택기로 따로 확인했다.
- **날짜** — DatePicker, DateRangePicker, Calendar: 양 renderer의 DatePicker와 DateRangePicker가 Calendar를 재사용한다. 단일 날짜 trigger와 범위 선택 정책은 중복이 아니다.
- **폼과 동의** — Form, Agreement: Form은 제출 상태·재진입·첫 오류 포커스, Agreement는 동의 집계·필수 조건·전문 열기다.
- **파일** — FilePicker, UploadItem: 선택·accept/크기/개수와 업로드 상태·취소/재시도는 다른 lifecycle이다.
- **이동과 진행** — Tabs, Sidebar, BottomNavigation, Breadcrumb, Pagination, LoadMore, Steps, Anchor: 패널 선택, 경로 이동, 계층 경로, 페이지 선택, 추가 요청, 단계 요약, 문서 내 위치 이동은 서로 다른 상태를 소유한다.
- **메뉴** — Menu, Menubar, ContextMenu: trigger·오른쪽 클릭·menubar 탐색은 유지하되 항목 탐색·typeahead 정책을 공유할 수 있다. MorphingMenu도 같은 군에서 확인했다.
- **작은 상태 표식** — Badge, CounterBadge, Tag: Badge는 상태·강조와 size/variant, CounterBadge는 bounded 숫자·dot, Tag는 짧은 분류 label이다. CSS 일부는 이미 공동 selector를 쓴다.
- **목록** — List, ListRow, VirtualList: List는 목록 묶음, ListRow는 한 행, VirtualList는 일정 높이 행의 windowing/Native FlatList 경로다.
- **접기** — Collapsible, Accordion: 단일 disclosure와 그룹 single/multiple expanded 정책이다. trigger/panel의 내부 shell은 공유 가능하지만 공개 API 통합 필요성은 낮다.
- **구조화된 정보** — Statistic, DescriptionList, DataTable, Timeline, Tree: 수치, 이름·값, 행·열과 선택/정렬, 시간 이력, 계층 정보 탐색은 구분된다. DataTable과 공개 Table은 정렬 표 영역에서 겹친다.
- **캐러셀** — Carousel: 기본 Carousel과 선택형 CarouselMotion이 별도 상태·슬라이드 renderer를 유지한다. 삭제보다 공통 의미 계약 연결이 적절하다.
- **피드백** — EmptyState, Notice, Progress, ThinkingOrb, Spinner, Skeleton, Result, BottomInfo, Toast: 빈 콘텐츠, inline 상태, 진행률, AI 상태 시각화, 불확정 대기, 로딩 자리, 완료 결과, 상시 보조 안내, 일시 알림이다. Toast Liquid는 별도 store가 아니라 Toast presentation adapter다.
- **오버레이** — Dialog, AlertDialog, Sheet, SidePanel, Popover, Tooltip, CommandPalette, Tour: modal, 확인 결정, 하단 sheet, 옆 panel, anchored interactive popup, 비상호작용 도움말, 명령 탐색, 단계 안내를 구분한다. Web modal hook은 공용이다. GestureSheet는 선택형 host다.
- **보조 기능** — Divider, QRCode, Affix, Watermark, SkipNav, VisuallyHidden: 구분선, QR 출력, 고정 위치, 반복 watermark, 내용으로 건너뛰기, 접근성 전용 text로 기능이 다르다.
- **색 선택** — ColorPicker: Web color input으로 다른 값 선택기와 값 타입·host가 다르다.
- **환경 provider** — DesignSystemProvider: 카탈로그의 개념명이며 실제 공개 renderer 이름은 HjmProvider와 HjmNativeProvider다. 세 개의 독립 provider 구현이라는 뜻이 아니다.

## 권장 작업 순서

1. 메뉴 검색 정책과 Native field presentation의 소유권을 하나로 만든다. 이미 갈라진 의미·스타일을 줄이는 효과가 가장 크다.
2. Table/DataTable의 실제 기능을 문서와 선택 기준에 반영하고, 공용 header·sort helper를 설계한다.
3. CarouselMotion을 공용 캐러셀 의미 계약에 연결하고 public API 대응표를 만든다.
4. 공통 validator와 ThinkingOrb ghost-dot loop는 주변 작업과 함께 정리한다.

위 순서는 이번 조사 결과에 대한 제안이다. 컴포넌트 제거·호환성 변경·소비 앱 migration·릴리스는 이 조사에서 실행하지 않았다.

## 카탈로그 전수 부록

각 행의 판정은 역할 중복 조사 결과이며, 구현 품질·기기 동작·stable 증거를 새로 인증한 것이 아니다. 구현 위치는 공개 symbol의 원본 선언으로 연결했다. DesignSystemProvider는 실제 renderer 이름으로 대응했다.

| 이름 | 역할 군 | 판정 | Web 정의 | Native 정의 |
| --- | --- | --- | --- | --- |
| Text | 글자와 제목 | 역할 분리 유지 | [layout.tsx 315행](../../../packages/react/src/layout.tsx) | [primitives.tsx 182행](../../../packages/react-native/src/primitives.tsx) |
| TextFormat | 글자와 제목 | 역할 분리 유지 | [text-formats.tsx 22행](../../../packages/react/src/text-formats.tsx) | 미지원 |
| Heading | 글자와 제목 | 역할 분리 유지 | [heading.tsx 20행](../../../packages/react/src/heading.tsx) | [heading.tsx 19행](../../../packages/react-native/src/heading.tsx) |
| Icon | 아이콘과 미디어 | 역할 분리 유지 | [supplemental-display.tsx 91행](../../../packages/react/src/supplemental-display.tsx) | [primitives.tsx 552행](../../../packages/react-native/src/primitives.tsx) |
| Surface | 표면과 구획 | 정상 조합 | [layout.tsx 351행](../../../packages/react/src/layout.tsx) | [primitives.tsx 268행](../../../packages/react-native/src/primitives.tsx) |
| Divider | 보조 기능 | 역할 분리 유지 | [advanced-display.tsx 329행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 702행](../../../packages/react-native/src/data-display.tsx) |
| Section | 표면과 구획 | 정상 조합 | [layout.tsx 593행](../../../packages/react/src/layout.tsx) | [primitives.tsx 635행](../../../packages/react-native/src/primitives.tsx) |
| Stack | 배치와 화면 골격 | 역할 분리 유지 | [layout.tsx 404행](../../../packages/react/src/layout.tsx) | [primitives.tsx 350행](../../../packages/react-native/src/primitives.tsx) |
| Container | 배치와 화면 골격 | 역할 분리 유지 | [layout.tsx 449행](../../../packages/react/src/layout.tsx) | [primitives.tsx 392행](../../../packages/react-native/src/primitives.tsx) |
| AspectRatio | 배치와 화면 골격 | 역할 분리 유지 | [layout.tsx 481행](../../../packages/react/src/layout.tsx) | [primitives.tsx 421행](../../../packages/react-native/src/primitives.tsx) |
| Grid | 배치와 화면 골격 | 역할 분리 유지 | [layout.tsx 527행](../../../packages/react/src/layout.tsx) | [primitives.tsx 457행](../../../packages/react-native/src/primitives.tsx) |
| Layout | 배치와 화면 골격 | 역할 분리 유지 | [layout.tsx 137행](../../../packages/react/src/layout.tsx) | [primitives.tsx 120행](../../../packages/react-native/src/primitives.tsx) |
| Top | 상단 제목 | 역할 분리 유지 | [top.tsx 17행](../../../packages/react/src/top.tsx) | [top.tsx 20행](../../../packages/react-native/src/top.tsx) |
| Masonry | 배치와 화면 골격 | 역할 분리 유지 | [masonry.tsx 5행](../../../packages/react/src/masonry.tsx) | [masonry.tsx 7행](../../../packages/react-native/src/masonry.tsx) |
| Splitter | 배치와 화면 골격 | 역할 분리 유지 | [splitter.tsx 62행](../../../packages/react/src/splitter.tsx) | 미지원 |
| Button | 행동 | 역할 분리 유지 | [actions.tsx 56행](../../../packages/react/src/actions.tsx) | [actions.tsx 97행](../../../packages/react-native/src/actions.tsx) |
| IconButton | 행동 | 역할 분리 유지 | [actions.tsx 131행](../../../packages/react/src/actions.tsx) | [actions.tsx 258행](../../../packages/react-native/src/actions.tsx) |
| Link | 행동 | 역할 분리 유지 | [actions.tsx 206행](../../../packages/react/src/actions.tsx) | [actions.tsx 376행](../../../packages/react-native/src/actions.tsx) |
| BottomCTA | 행동 | 역할 분리 유지 | [bottom-cta.tsx 43행](../../../packages/react/src/bottom-cta.tsx) | [actions.tsx 473행](../../../packages/react-native/src/actions.tsx) |
| FloatingActionButton | 행동 | 역할 분리 유지 | [floating-action-button.tsx 22행](../../../packages/react/src/floating-action-button.tsx) | [floating-action-button.tsx 22행](../../../packages/react-native/src/floating-action-button.tsx) |
| AuthScreenLayout | 배치와 화면 골격 | 역할 분리 유지 | [auth-screen.tsx 27행](../../../packages/react/src/auth-screen.tsx) | [auth-screen.tsx 32행](../../../packages/react-native/src/auth-screen.tsx) |
| AuthProviderButton | 행동 | 역할 분리 유지 | [provider-button.tsx 30행](../../../packages/react/src/provider-button.tsx) | [provider-button.tsx 26행](../../../packages/react-native/src/provider-button.tsx) |
| Field | 입력 필드 | 내부 정리 후보 F3 | [forms.tsx 133행](../../../packages/react/src/forms.tsx) | [forms.tsx 138행](../../../packages/react-native/src/forms.tsx) |
| SearchField | 입력 필드 | 내부 정리 후보 F3 | [forms.tsx 450행](../../../packages/react/src/forms.tsx) | [inputs.tsx 439행](../../../packages/react-native/src/inputs.tsx) |
| TextArea | 입력 필드 | 내부 정리 후보 F3 | [forms.tsx 335행](../../../packages/react/src/forms.tsx) | [inputs.tsx 412행](../../../packages/react-native/src/inputs.tsx) |
| PasswordField | 입력 필드 | 내부 정리 후보 F3 | [forms.tsx 555행](../../../packages/react/src/forms.tsx) | [inputs.tsx 620행](../../../packages/react-native/src/inputs.tsx) |
| OtpField | 입력 필드 | 내부 정리 후보 F3 | [forms.tsx 685행](../../../packages/react/src/forms.tsx) | [inputs.tsx 741행](../../../packages/react-native/src/inputs.tsx) |
| Checkbox | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 153행](../../../packages/react/src/selection.tsx) | [inputs.tsx 1188행](../../../packages/react-native/src/inputs.tsx) |
| Radio | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 260행](../../../packages/react/src/selection.tsx) | [inputs.tsx 1258행](../../../packages/react-native/src/inputs.tsx) |
| CheckboxGroup | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 478행](../../../packages/react/src/selection.tsx) | [inputs.tsx 1557행](../../../packages/react-native/src/inputs.tsx) |
| RadioGroup | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 536행](../../../packages/react/src/selection.tsx) | [inputs.tsx 1445행](../../../packages/react-native/src/inputs.tsx) |
| Switch | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 696행](../../../packages/react/src/selection.tsx) | [inputs.tsx 1687행](../../../packages/react-native/src/inputs.tsx) |
| Chip | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 85행](../../../packages/react/src/selection.tsx) | [inputs.tsx 2056행](../../../packages/react-native/src/inputs.tsx) |
| SegmentedControl | 선택 컨트롤 | 역할 분리 유지 | [selection.tsx 776행](../../../packages/react/src/selection.tsx) | [inputs.tsx 1859행](../../../packages/react-native/src/inputs.tsx) |
| ToggleGroup | 선택 컨트롤 | 역할 분리 유지 | [toggle-group.tsx 21행](../../../packages/react/src/toggle-group.tsx) | [toggle-group.tsx 24행](../../../packages/react-native/src/toggle-group.tsx) |
| TagsInput | 컬렉션과 자유 입력 | 역할 분리 유지 | [tags-input.tsx 51행](../../../packages/react/src/tags-input.tsx) | [tags-input.tsx 36행](../../../packages/react-native/src/tags-input.tsx) |
| Slider | 입력 필드 | 내부 정리 후보 F3 | [slider.tsx 87행](../../../packages/react/src/slider.tsx) | [slider.tsx 69행](../../../packages/react-native/src/slider.tsx) |
| NumberField | 입력 필드 | 내부 정리 후보 F3 | [number-field.tsx 85행](../../../packages/react/src/number-field.tsx) | [number-field.tsx 89행](../../../packages/react-native/src/number-field.tsx) |
| Select | 컬렉션과 자유 입력 | 역할 분리 유지 | [select.tsx 719행](../../../packages/react/src/select.tsx) | [forms.tsx 378행](../../../packages/react-native/src/forms.tsx) |
| Combobox | 컬렉션과 자유 입력 | 역할 분리 유지 | [advanced-forms.tsx 215행](../../../packages/react/src/advanced-forms.tsx) | [forms.tsx 838행](../../../packages/react-native/src/forms.tsx) |
| DatePicker | 날짜 | 정상 조합 | [date-picker.tsx 45행](../../../packages/react/src/date-picker.tsx) | [date-picker.tsx 45행](../../../packages/react-native/src/date-picker.tsx) |
| DateRangePicker | 날짜 | 정상 조합 | [date-range.tsx 32행](../../../packages/react/src/date-range.tsx) | [date-range.tsx 34행](../../../packages/react-native/src/date-range.tsx) |
| ColorPicker | 색 선택 | 별도 기능 유지 | [color-picker.tsx 9행](../../../packages/react/src/color-picker.tsx) | 미지원 |
| FilePicker | 파일 | 역할 분리 유지 | [file-picker.tsx 43행](../../../packages/react/src/file-picker.tsx) | [file-picker.tsx 33행](../../../packages/react-native/src/file-picker.tsx) |
| Form | 폼과 동의 | 정상 조합 | [advanced-forms.tsx 515행](../../../packages/react/src/advanced-forms.tsx) | [forms.tsx 196행](../../../packages/react-native/src/forms.tsx) |
| Agreement | 폼과 동의 | 정상 조합 | [agreement.tsx 37행](../../../packages/react/src/agreement.tsx) | [agreement.tsx 34행](../../../packages/react-native/src/agreement.tsx) |
| Mentions | 컬렉션과 자유 입력 | 역할 분리 유지 | [mentions.tsx 46행](../../../packages/react/src/mentions.tsx) | [mentions.tsx 40행](../../../packages/react-native/src/mentions.tsx) |
| TransferList | 컬렉션과 자유 입력 | 역할 분리 유지 | [transfer-list.tsx 49행](../../../packages/react/src/transfer-list.tsx) | [transfer-list.tsx 46행](../../../packages/react-native/src/transfer-list.tsx) |
| UploadItem | 파일 | 역할 분리 유지 | [upload-item.tsx 21행](../../../packages/react/src/upload-item.tsx) | [upload-item.tsx 25행](../../../packages/react-native/src/upload-item.tsx) |
| Tabs | 이동과 진행 | 역할 분리 유지 | [navigation.tsx 241행](../../../packages/react/src/navigation.tsx) | [navigation.tsx 267행](../../../packages/react-native/src/navigation.tsx) |
| TopBar | 상단 제목 | 역할 분리 유지 | [top-bar.tsx 21행](../../../packages/react/src/top-bar.tsx) | [navigation.tsx 1162행](../../../packages/react-native/src/navigation.tsx) |
| Sidebar | 이동과 진행 | 역할 분리 유지 | [sidebar.tsx 29행](../../../packages/react/src/sidebar.tsx) | 미지원 |
| BottomNavigation | 이동과 진행 | 역할 분리 유지 | [bottom-navigation.tsx 294행](../../../packages/react/src/bottom-navigation.tsx) | [navigation.tsx 656행](../../../packages/react-native/src/navigation.tsx) |
| Breadcrumb | 이동과 진행 | 역할 분리 유지 | [breadcrumb.tsx 62행](../../../packages/react/src/breadcrumb.tsx) | 미지원 |
| Pagination | 이동과 진행 | 역할 분리 유지 | [pagination.tsx 14행](../../../packages/react/src/pagination.tsx) | 미지원 |
| LoadMore | 이동과 진행 | 역할 분리 유지 | [supplemental-navigation.tsx 74행](../../../packages/react/src/supplemental-navigation.tsx) | [navigation.tsx 1903행](../../../packages/react-native/src/navigation.tsx) |
| Steps | 이동과 진행 | 역할 분리 유지 | [steps.tsx 23행](../../../packages/react/src/steps.tsx) | [steps.tsx 24행](../../../packages/react-native/src/steps.tsx) |
| Menubar | 메뉴 | 내부 정리 후보 F2 | [menubar.tsx 20행](../../../packages/react/src/menubar.tsx) | 미지원 |
| ContextMenu | 메뉴 | 내부 정리 후보 F2 | [context-menu.tsx 32행](../../../packages/react/src/context-menu.tsx) | 미지원 |
| Menu | 메뉴 | 내부 정리 후보 F2 | [overlays.tsx 1033행](../../../packages/react/src/overlays.tsx) | [navigation.tsx 1531행](../../../packages/react-native/src/navigation.tsx) |
| Anchor | 이동과 진행 | 역할 분리 유지 | [anchor.tsx 17행](../../../packages/react/src/anchor.tsx) | 미지원 |
| Avatar | 아이콘과 미디어 | 역할 분리 유지 | [advanced-display.tsx 230행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 647행](../../../packages/react-native/src/data-display.tsx) |
| Asset | 아이콘과 미디어 | 역할 분리 유지 | [asset.tsx 24행](../../../packages/react/src/asset.tsx) | [asset.tsx 24행](../../../packages/react-native/src/asset.tsx) |
| Badge | 작은 상태 표식 | 역할 분리 유지 | [display.tsx 50행](../../../packages/react/src/display.tsx) | [data-display.tsx 115행](../../../packages/react-native/src/data-display.tsx) |
| CounterBadge | 작은 상태 표식 | 역할 분리 유지 | [supplemental-display.tsx 350행](../../../packages/react/src/supplemental-display.tsx) | [data-display.tsx 1398행](../../../packages/react-native/src/data-display.tsx) |
| Card | 표면과 구획 | 정상 조합 | [display.tsx 128행](../../../packages/react/src/display.tsx) | [data-display.tsx 278행](../../../packages/react-native/src/data-display.tsx) |
| List | 목록 | 역할 분리 유지 | [advanced-display.tsx 362행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 1463행](../../../packages/react-native/src/data-display.tsx) |
| ListRow | 목록 | 역할 분리 유지 | [display.tsx 229행](../../../packages/react/src/display.tsx) | [data-display.tsx 399행](../../../packages/react-native/src/data-display.tsx) |
| VirtualList | 목록 | 역할 분리 유지 | [virtual-list.tsx 5행](../../../packages/react/src/virtual-list.tsx) | [virtual-list.tsx 6행](../../../packages/react-native/src/virtual-list.tsx) |
| Collapsible | 접기 | 역할 분리 유지 | [collapsible.tsx 18행](../../../packages/react/src/collapsible.tsx) | [collapsible.tsx 19행](../../../packages/react-native/src/collapsible.tsx) |
| Accordion | 접기 | 역할 분리 유지 | [advanced-display.tsx 103행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 756행](../../../packages/react-native/src/data-display.tsx) |
| Statistic | 구조화된 정보 | 부분 겹침 F1 | [advanced-display.tsx 427행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 1544행](../../../packages/react-native/src/data-display.tsx) |
| Timeline | 구조화된 정보 | 부분 겹침 F1 | [advanced-display.tsx 765행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 1832행](../../../packages/react-native/src/data-display.tsx) |
| DataTable | 구조화된 정보 | 부분 겹침 F1 | [data-table.tsx 47행](../../../packages/react/src/data-table.tsx) | 미지원 |
| Tree | 구조화된 정보 | 부분 겹침 F1 | [tree.tsx 60행](../../../packages/react/src/tree.tsx) | 미지원 |
| Calendar | 날짜 | 정상 조합 | [calendar.tsx 29행](../../../packages/react/src/calendar.tsx) | [calendar.tsx 28행](../../../packages/react-native/src/calendar.tsx) |
| Carousel | 캐러셀 | 병렬 구현 F4 | [carousel.tsx 23행](../../../packages/react/src/carousel.tsx) | [carousel.tsx 24행](../../../packages/react-native/src/carousel.tsx) |
| DescriptionList | 구조화된 정보 | 부분 겹침 F1 | [advanced-display.tsx 580행](../../../packages/react/src/advanced-display.tsx) | [data-display.tsx 922행](../../../packages/react-native/src/data-display.tsx) |
| Image | 아이콘과 미디어 | 역할 분리 유지 | [supplemental-display.tsx 218행](../../../packages/react/src/supplemental-display.tsx) | [data-display.tsx 1136행](../../../packages/react-native/src/data-display.tsx) |
| QRCode | 보조 기능 | 역할 분리 유지 | [qr-code.tsx 5행](../../../packages/react/src/qr-code.tsx) | [qr-code.tsx 7행](../../../packages/react-native/src/qr-code.tsx) |
| Tag | 작은 상태 표식 | 역할 분리 유지 | [display.tsx 92행](../../../packages/react/src/display.tsx) | [data-display.tsx 209행](../../../packages/react-native/src/data-display.tsx) |
| Tour | 오버레이 | 역할 분리 유지 | [tour.tsx 66행](../../../packages/react/src/tour.tsx) | 미지원 |
| EmptyState | 피드백 | 역할 분리 유지 | [feedback.tsx 84행](../../../packages/react/src/feedback.tsx) | [feedback.tsx 205행](../../../packages/react-native/src/feedback.tsx) |
| Notice | 피드백 | 역할 분리 유지 | [feedback.tsx 41행](../../../packages/react/src/feedback.tsx) | [feedback.tsx 97행](../../../packages/react-native/src/feedback.tsx) |
| Progress | 피드백 | 역할 분리 유지 | [feedback.tsx 209행](../../../packages/react/src/feedback.tsx) | [feedback.tsx 497행](../../../packages/react-native/src/feedback.tsx) |
| ThinkingOrb | 피드백 | 역할 분리 유지 | [thinking-orb.tsx 7행](../../../packages/react/src/thinking-orb.tsx) | [thinking-orb.tsx 10행](../../../packages/react-native/src/thinking-orb.tsx) |
| Spinner | 피드백 | 역할 분리 유지 | [feedback.tsx 280행](../../../packages/react/src/feedback.tsx) | [feedback.tsx 631행](../../../packages/react-native/src/feedback.tsx) |
| Skeleton | 피드백 | 역할 분리 유지 | [feedback.tsx 316행](../../../packages/react/src/feedback.tsx) | [feedback.tsx 667행](../../../packages/react-native/src/feedback.tsx) |
| Result | 피드백 | 역할 분리 유지 | [feedback.tsx 126행](../../../packages/react/src/feedback.tsx) | [feedback.tsx 332행](../../../packages/react-native/src/feedback.tsx) |
| BottomInfo | 피드백 | 역할 분리 유지 | [bottom-info.tsx 17행](../../../packages/react/src/bottom-info.tsx) | [bottom-info.tsx 18행](../../../packages/react-native/src/bottom-info.tsx) |
| Toast | 피드백 | 역할 분리 유지 | [toast.tsx 174행](../../../packages/react/src/toast.tsx) | [feedback.tsx 995행](../../../packages/react-native/src/feedback.tsx) |
| Watermark | 보조 기능 | 역할 분리 유지 | [watermark.tsx 5행](../../../packages/react/src/watermark.tsx) | 미지원 |
| Dialog | 오버레이 | 역할 분리 유지 | [overlays.tsx 98행](../../../packages/react/src/overlays.tsx) | [overlays.tsx 231행](../../../packages/react-native/src/overlays.tsx) |
| AlertDialog | 오버레이 | 역할 분리 유지 | [overlays.tsx 259행](../../../packages/react/src/overlays.tsx) | [overlays.tsx 489행](../../../packages/react-native/src/overlays.tsx) |
| Sheet | 오버레이 | 역할 분리 유지 | [overlays.tsx 470행](../../../packages/react/src/overlays.tsx) | [overlays.tsx 936행](../../../packages/react-native/src/overlays.tsx) |
| SidePanel | 오버레이 | 역할 분리 유지 | [side-panel.tsx 58행](../../../packages/react/src/side-panel.tsx) | 미지원 |
| Popover | 오버레이 | 역할 분리 유지 | [popover.tsx 52행](../../../packages/react/src/popover.tsx) | 미지원 |
| Tooltip | 오버레이 | 역할 분리 유지 | [overlays.tsx 670행](../../../packages/react/src/overlays.tsx) | 미지원 |
| CommandPalette | 오버레이 | 역할 분리 유지 | [command-palette.tsx 53행](../../../packages/react/src/command-palette.tsx) | 미지원 |
| Affix | 보조 기능 | 역할 분리 유지 | [affix.tsx 5행](../../../packages/react/src/affix.tsx) | 미지원 |
| DesignSystemProvider | 환경 provider | 정상 명칭 대응 | [provider.tsx 118행](../../../packages/react/src/provider.tsx) | [provider.tsx 151행](../../../packages/react-native/src/provider.tsx) |
| SkipNav | 보조 기능 | 역할 분리 유지 | [skip-nav.tsx 13행](../../../packages/react/src/skip-nav.tsx) | 미지원 |
| VisuallyHidden | 보조 기능 | 역할 분리 유지 | [layout.tsx 503행](../../../packages/react/src/layout.tsx) | 미지원 |

## 카탈로그 밖 공개 컴포넌트와 보조 export

Group/provider/host extension을 canonical 신규 컴포넌트로 세지 않았다. 모든 대문자 public value를 전수 대조했다.

### react

| API | 역할과 판정 | 원본 정의 |
| --- | --- | --- |
| TextField | Field 군의 실제 text input. 프레임과 구분 유지 F3/F5 | [237행](../../../packages/react/src/forms.tsx) |
| NativeSelect | 브라우저 select host. custom Select와 선택 기준 구분 F5 | [78행](../../../packages/react/src/advanced-forms.tsx) |
| TabPanel | Tabs companion | [190행](../../../packages/react/src/navigation.tsx) |
| AvatarGroup | Avatar companion | [297행](../../../packages/react/src/advanced-display.tsx) |
| StatisticGroup | Statistic companion | [493행](../../../packages/react/src/advanced-display.tsx) |
| Table | generic row 표. DataTable과 정렬 영역 겹침 F1/F5 | [703행](../../../packages/react/src/advanced-display.tsx) |
| ToastProvider | Toast store/provider | [289행](../../../packages/react/src/toast.tsx) |
| ClipboardButton | Button의 clipboard 행동 확장 | [26행](../../../packages/react/src/clipboard.tsx) |
| OverlayStackProvider | Dialog/Sheet orchestration | [70행](../../../packages/react/src/overlay-stack.tsx) |
| AssetGroup | Asset companion | [68행](../../../packages/react/src/asset.tsx) |
| AnimatedStatistic | Statistic을 내부 소비하는 선택형 presentation | [15행](../../../packages/react/src/statistic-motion.tsx) |
| MorphingMenu | Menu의 선택형 presentation. 탐색 공유 필요 F2 | [17행](../../../packages/react/src/menu-morph.tsx) |
| SortableCollection | 순서 변경 확장 | [32행](../../../packages/react/src/sortable.tsx) |
| SwipeActions | 행 swipe action 확장 | [10행](../../../packages/react/src/swipe-actions.tsx) |
| ContentTransition | 내용 전환 확장 | [13행](../../../packages/react/src/content-transition.tsx) |
| TextTransition | ContentTransition companion | [35행](../../../packages/react/src/content-transition.tsx) |
| CarouselMotion | 별도 캐러셀 motion host F4 | [11행](../../../packages/react/src/carousel-motion.tsx) |
| Celebration | 완료 event animation 확장 | [7행](../../../packages/react/src/celebration.tsx) |

### react-native

| API | 역할과 판정 | 원본 정의 |
| --- | --- | --- |
| TextField | Field 군의 실제 text input. 프레임과 구분 유지 F3/F5 | [406행](../../../packages/react-native/src/inputs.tsx) |
| TabPanel | Tabs companion | [236행](../../../packages/react-native/src/navigation.tsx) |
| TopBarAction | TopBar companion | [1038행](../../../packages/react-native/src/navigation.tsx) |
| StatisticGroup | Statistic companion | [1741행](../../../packages/react-native/src/data-display.tsx) |
| ToastRegion | Toast store/region | [1211행](../../../packages/react-native/src/feedback.tsx) |
| AssetGroup | Asset companion | [78행](../../../packages/react-native/src/asset.tsx) |
| KeyboardAvoiding | 기본 keyboard clearance. KeyboardDock과 같은 내용에 중첩 금지 | [29행](../../../packages/react-native/src/keyboard.tsx) |
| ImageViewer | Image의 전체 화면 확대·paging 확장 | [43행](../../../packages/react-native/src/image-viewer.tsx) |
| KeyboardMotionProvider | 선택형 keyboard host provider | [6행](../../../packages/react-native/src/keyboard-controller.tsx) |
| KeyboardDock | keyboard translation host. KeyboardAvoiding 중첩 금지 | [20행](../../../packages/react-native/src/keyboard-controller.tsx) |
| KeyboardFormScrollView | focus-aware form scroll host | [29행](../../../packages/react-native/src/keyboard-controller.tsx) |
| GestureSheetProvider | 선택형 sheet host provider | [38행](../../../packages/react-native/src/sheet-gesture.tsx) |
| GestureSheet | gesture/snap host. 기본 Sheet와 의도적 병렬 host | [56행](../../../packages/react-native/src/sheet-gesture.tsx) |
| GestureSheetInput | sheet keyboard-tracking input. presentation 공통화 F3 | [14행](../../../packages/react-native/src/sheet-gesture.tsx) |
| NativeContextMenu | OS long-press menu host. 기본 Menu와 presentation/trigger 구분 | [19행](../../../packages/react-native/src/context-menu-native.tsx) |
| SortableCollection | 순서 변경 확장 | [16행](../../../packages/react-native/src/sortable.tsx) |
| SwipeActions | 행 swipe action 확장 | [14행](../../../packages/react-native/src/swipe-actions.tsx) |
| ContentTransition | 내용 전환 확장 | [8행](../../../packages/react-native/src/content-transition.tsx) |
| TextTransition | ContentTransition companion | [25행](../../../packages/react-native/src/content-transition.tsx) |
| CarouselMotion | 별도 캐러셀 motion host F4 | [21행](../../../packages/react-native/src/carousel-motion.tsx) |
| Celebration | 완료 event animation 확장 | [8행](../../../packages/react-native/src/celebration.tsx) |
| SharedTransitionScreen | navigation transition screen host | [12행](../../../packages/react-native/src/screen-transition.tsx) |
| SharedTransitionElement | shared transition element host | [25행](../../../packages/react-native/src/screen-transition.tsx) |

## 공개 hook와 runtime helper

컴포넌트와 섞어 세지 않고 별도 확인했다. 같은 계약 함수의 재노출은 중복 구현이 아니다. 원본이 contracts dist 또는 upstream declaration인 항목도 public symbol inventory에 그대로 남겼다.

- **react**: `useHjmTheme`, `hjmCompositionStyleKeys`, `getDynamicTabPanelId`, `getTabId`, `getTabPanelId`, `getBottomNavigationGridColumn`, `isUnmodifiedPrimaryBottomNavigationClick`, `shouldHideBottomNavigationForKeyboard`, `useToast`, `useFloatingActionButtonScroll`, `resolveFloatingActionButtonContentClearance`, `useOverlayStack`, `useDialog`, `useSheet`, `useOptionalHjmTheme`, `useHjmDensityDefault`, `useTooltipCoordinator`, `reactRendererEvidenceSchemaVersion`, `reactRendererEvidence`.
- **react-native**: `useHjmNativeSafeAreaInsets`, `useHjmNativeTheme`, `hjmCompositionStyleKeys`, `getDynamicTabPanelId`, `getTabId`, `getTabPanelId`, `useToastRegion`, `useFloatingActionButtonScroll`, `resolveFloatingActionButtonContentClearance`, `resolveKeyboardAvoidanceBehavior`, `authScreenRecipe`, `reactNativeRendererEvidenceSchemaVersion`, `reactNativeRendererEvidence`, `createLiquidToastPresentation`, `dismissTopGestureSheet`, `useSharedTransitionOptions`, `createHjmTransitionStack`.

## 감사 결과 파일의 검증

보고서 생성 시 카탈로그 103개의 누락·중복 배정이 없고, 지원 renderer가 public symbol로 해석되는지 검사했다. 카탈로그 밖 대문자 export 41개 출현도 판정 누락 없이 대조했다. source inventory의 SHA는 감사 중 소스 변동 확인에 사용한다. 동일 token 대조는 이름·문자열이 바뀐 clone을 놓칠 수 있고 동일 구문이 있는 수학 알고리즘을 중복 후보로 올릴 수 있으므로 각 후보를 직접 확인했다.

최종 확인 결과: 카탈로그 103행 및 카탈로그 밖 공개 이름 41개 출현의 배정 검사를 통과했다. 문서 링크 검사는 저장소 174개 Markdown 파일에 대해 통과했고, 256개 source SHA는 조사 종료 시 동일했다. 기존 tracked 변경의 whitespace 검사도 통과했다. 이 결과는 컴포넌트 실행 테스트 통과를 의미하지 않는다.
