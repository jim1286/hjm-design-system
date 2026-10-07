# QA 리포트 — Component Gallery 공개 페이지 검토

## 1. 최종 판정

**기본 desktop/light 66경로·2,671개 카드 목록과 하단 시각 검토 완료. linked 원본·다른 환경·실제 동작과 11개 사이트 전수조사는 미완료다.** 공개 HTML 66개 경로의 첫 화면, 컴포넌트 정의 60개와 상세 지침 12개를 읽었다. 131개 URL의 본문을 비교해 65개 slash 변형이 같은 본문임을 확인했다. URL 발견·본문 추출·전체 페이지 캡처를 사람이 모든 예제를 검토한 것으로 처리하지 않는다.

2026-10-07 사용자가 처음 요청한 전체 페이지 검토의 누락을 지적했다. 이미 수행한 HJM 반영·게시와 이 전수조사의 완료 상태를 분리하기 위해 페이지별 증거를 기록한다.

## 2. 대상과 이력

- 기준 HJM: main `809fa28ebf1efaec9e48ec3b10c0c242f4b6131b`. 이 검토에서 제품 구현·공개 API·릴리스는 변경하지 않았다.
- 대상: 실제 공개 `https://component.gallery/`, sitemap-index와 sitemap-0, HTML anchor로 발견한 동일 호스트 페이지.
- 실행: 2026-10-07 KST, Codex. 로그인·양식 제출·외부 디자인 시스템의 변경 없음.
- 외부 source commit은 제공되지 않아 본문 SHA-256·스크린샷 SHA-256·시각 검토 범위를 작업 중 보유한다.

| 대상 | 전·후 | 판정과 주요 변화 |
| --- | --- | --- |
| URL 목록 | slash 변형을 별도 페이지로 계산 → 131변형/66본문 경로로 분리 | 동일 본문 65쌍, 불일치 0. redirect를 확인했다고 표현하지 않음 |
| 정의·상세 지침 | 추출 → 실제 읽기 | 정의 60개, 상세 지침 12개. 원문의 ARIA 오류 2개를 W3C와 대조 |
| 시각 확인 | 캡처 → 첫 본문/첫 예제 행 확인 | 전체 폭 모음 11장으로 66개 경로 확인. 하단 모든 예제는 미완료 |

## 3. 환경과 검증 범위

- 별도 headless Google Chrome 154.0.8037.98, 1440×1000, 기본 light/desktop, 로그인 없음. 실서비스 페이지이며 합성 fixture가 아니다.
- 첫 시각 검토: 1440px 전체 폭, y=75~1200 본문·첫 예제 행. 초기 모음의 좌측 절단은 작업 산출물 crop 문제라 전체 폭으로 다시 만들고 66페이지를 재확인했다. 사이트 UI 결함으로 보고하지 않는다.
- 공통 정의/별칭 60개, 상세 본문이 있는 Accordion·Breadcrumbs·Button group·Button·Carousel·Pagination·Popover·Quote·Rating·Rich text editor·Tabs·Tree view의 상세 지침 전체를 읽었다.
- About·Contribute·Design systems·홈의 본문과 목록을 읽었다. Changelog 전체 본문도 추가로 읽었고, general 페이지의 하단 시각 확인은 계속 진행한다.
- 기본 2,671개 카드·하단 목록 시각 검토는 아래 후속에서 완료했다. linked design system의 원래 구현·동작, dark/mobile/큰 글자/RTL·스크린리더는 미완료다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 시나리오·조건 | 실제 결과 | 판단·흡수 방향 |
| --- | --- | --- |
| 131개 동일 호스트 URL의 본문 digest 비교 | 66개 경로, 65쌍 동일, 불일치 0 | 중복을 완료 페이지 수로 늘리지 않음 |
| Tabs 상세 지침 | 세로 탭에 Left/Right, 가로 탭에 Up/Down 설명 | 축이 반대로 적혀 있다. 원문 그대로 HJM 키보드 계약에 넣지 않음 |
| Popover 상세 지침 | 열린 상태에 aria-expanded=false 설명 | 열린 상태의 실제 의미와 모순. 열린 상태 true/닫힘 false 계약을 유지 |
| Carousel 상세 지침 | 부분 노출·보이는 탐색·비활성 콘텐츠·자동 재생 정지 지침 | Carousel/CarouselMotion의 peek·표현 비교 후보. 문서의 최소 크기를 기존 HJM 44px 행동 기준 대신 사용하지 않음 |
| Accordion·Breadcrumbs·Pagination·Tree view | 구조·현재 항목·내용 연결·계층과 키보드에 관한 설명 | 기존 상태·접근성 엔진 유지. 갤러리의 실제 구현과 동작을 추가 검토한 뒤 표현만 비교 |
| Quote 상세 지침 | blockquote/figure/cite·중복 pull quote·언어별 인용부호 구분 | 독립 구성 필요 여부를 기존 공개 API와 비교. 저자 이름을 창작물 cite 의미로 잘못 넣지 않음 |
| Rating·Rich text editor | 읽기 전용/선택형 평점과 문서 편집 구분 | Rating은 기존 1.14 API 비교. 편집 모델·paste·HTML 보안·플랫폼 host는 별도 소유 경계 |
| Button·Button group | 링크/버튼 의미, 행동 묶음과 toolbar 구분 | 특정 primary 위치·단일 줄·cursor 관례를 제품 RTL·큰 글자 계약보다 우선하지 않음 |
| About·Contribute | 재사용 가능한 코드·사용 지침·고유 기능을 디자인 시스템 조건으로 설명 | 스크린샷/재색상만으로 새 공개 API를 추가하지 않는 기존 HJM 원칙과 비교 |

원문 오류의 재현: [Tabs](https://component.gallery/components/tabs/)와 [Popover](https://component.gallery/components/popover/) 상세 지침을 읽고 해당 키 설명·expanded 문구를 확인한다. [W3C APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)는 가로 Left/Right, 세로 Up/Down을 설명하며, [W3C APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)는 보이는 내용에 expanded=true를 설명한다. 외부 사이트는 수정하지 않았고 HJM 코드 오류로 분류하지 않았다.

## 5. 검사·관찰 결과

| 도구·조건 | 수치·판정 | 해석 |
| --- | --- | --- |
| sitemap + HTML anchor closure | 방문 131, 발견 131, 미방문 0, HTTP 200 131, page error 0 | 해당 공개 경로 발견의 closure이며 모든 UI 상태 완료는 아님 |
| 본문 SHA-256 그룹 | 고유 경로 66, 동일 slash 쌍 65, 불일치 0 | 동일 렌더된 본문 비교. HTTP redirect equivalence 주장 안 함 |
| 전체 폭 첫 본문 모음 | 11장, 66경로 실제 시각 확인 | 하단 예제 미리보기를 모두 확인한 것으로 계산하지 않음 |
| 상세 지침 + W3C 원문 | 12개 읽음, ARIA 설명 오류 2개 대조 | 다수 사례의 관례와 공식 행동 규칙을 구분 |
| lazy image 전체 scroll 캡처 | 66페이지 완료 | capture는 source/visual review와 별도 상태로 보존. main img 2,853개는 로드 실패 0, page error 0. 장식/중복 이미지가 포함되므로 2,671개 예제 전수 시각 확인 수로 쓰지 않음 |

### 긴 페이지 캡처의 신뢰성 재확인

하단 전수 시각 검토를 시작하면서 기존 fullPage 이미지의 일부 구간이 실제 본문과 다른 것을 발견했다. Changelog에는 빈 구간이 있었고 Accordion은 약 16,384px 부근에서 상단 내용이 다시 나타났다. 본문 추출과 이미지 로드 성공은 전체 긴 화면의 올바른 paint 증거가 아니다. 외부 사이트의 실제 사용자 화면 결함으로 확정하지 않는다.

content-visibility를 임시로 visible로 설정한 재캡처는 Changelog 본문을 보였지만 Accordion의 반복은 남았다. 이 캡처 방법은 채택하지 않았고 해당 작업 소유 프로세스만 종료했다. 원본을 수정하지 않은 실제 scroll viewport(1440×1000, 100px 겹침)를 차례로 캡처하는 방식으로 전환했다. 아직 모든 새 캡처를 시각 검토하지 않았으므로 하단 전수 완료로 계산하지 않는다.

기존 모음에서 홈·About·Contribute·Design systems의 보이는 본문/목록과 컴포넌트 색인 하단을 추가로 읽었다. Accordion 101개 예제의 기본 thumbnail/카드 표현은 확인했지만 원본 linked 구현과 실제 접힘 동작은 별도다. 분리선·묶인 테두리·카드형·본문 일부 노출·inline 더보기·좌/우 indicator를 기존 Accordion/Collapsible의 표현 비교 후보로 기록한다. 긴 페이지의 상세 지침/footer 화면은 새 viewport 캡처로 다시 확인한다.

### 실제 scroll viewport로 하단 재검토

Accordion의 y=15,300~22,817 구간을 실제 스크롤 viewport 9장으로 연속 확인했다. 마지막 Details/Workday 예제 카드, 상세 설명·두 markup 방식·상호작용·스타일·사용 지침·각주·Resources·Name distribution·footer가 정상 표시됐다. 기존 과대 fullPage 캡처의 상단 반복을 실제 사이트 결함으로 분류하지 않는다. 기본 예제 카드 101개 확인 범위는 기존 모음에서 보인 상단 목록과 이 마지막 카드 확인을 합친 것이며 linked design system의 구현/동작 검토는 여전히 남아 있다.

새 viewport 9장의 URL·위치·SHA-256·검토 시각을 작업 증거에 보존했다.

### 실제 viewport 추가 검토와 기존 API 대조

후속으로 실제 viewport 모음 43장, 원본 viewport 172장을 확인했다. 초기 9장과 겹치는 것을 중복 계산하지 않는다. 홈·About·Changelog·Contribute·Design systems·컴포넌트 색인 6개 경로와 Accordion·Alert·Avatar·Badge·Breadcrumbs 5개 컴포넌트 경로는 기본 desktop/light에서 상단부터 footer까지 확인했다. Button group은 첫 viewport만 추가 확인해 전체 검토로 세지 않는다.

Changelog의 실제 y=0~34,975 구간은 본문과 footer를 정상 표시한다. 기존 fullPage의 빈 구간/상단 반복은 이 실제 viewport에 나타나지 않았다. Design systems 목록 95개 카드와 컴포넌트 색인 60개 카드도 확인했으며 linked 원본 사이트의 현재 상태를 확인한 것은 아니다.

갤러리의 기본 예제 카드/thumbnail은 Accordion 101, Alert 108, Avatar 38, Badge 123, Breadcrumbs 55, 합계 425개를 확인했다. 이것은 2,671개 중 기본 목록의 시각 범위이며 예제의 실제 행동·hover·dark·모바일·접근성 통과 수가 아니다. 작은 thumbnail의 내부 문구·상태는 원본 구현을 확인해야 한다.

| 추가 관찰 | HJM 실제 구현 대조 | 후속 판단 |
| --- | --- | --- |
| Alert: inline 고지·banner·제목/본문·선택 action·닫기·상태 강조 | 양 Notice가 title/description/action/icon/tone을 제공한다. Web은 tone으로 live 역할을 정하고 Native는 announcement를 별도 선택한다 | 새 Alert wrapper를 만들지 않는다. 상시 안내/동적 고지와 확인 Dialog를 구분하고, dismissible/배치/강조 변형은 원본 행동과 기존 Toast/Notice를 비교 |
| Avatar: 원/둥근 사각형·초기 글자·사진·상태 표시·겹친 묶음/overflow | Web Avatar는 shape와 AvatarGroup을 제공한다. Native Avatar는 이미지 host와 fallback을 제공하지만 shape prop/AvatarGroup은 현재 없다 | 같은 이름의 양 플랫폼 지원을 추정하지 않는다. Native 모양·그룹과 상태 표시가 필요한지 원본 접근성/overflow 동작을 읽고 기존 Avatar 엔진 확장으로 검토 |
| Badge: 상태 label·카운터·dot·filled/outline·삭제/선택 chip·복합 label | 양 Badge의 variant/leading, Tag, CounterBadge, Chip/TagsInput은 서로 다른 의미를 제공한다 | 갤러리의 Tag/Chip 별칭을 API 통합 이유로 쓰지 않는다. static/selection/removal/count 의미별 기존 API에 흡수하고 compound/dot 표현만 추가 비교 |
| Breadcrumbs: 여러 separator·현재 항목·home·중간 경로 축약/menu | Web Breadcrumb는 label/items/현재 위치/separator를 제공한다. catalog는 Native unsupported다 | separator 표현은 기존 슬롯을 쓴다. 중간 경로 overflow는 실제 탐색·포커스 확인 뒤 검토하고 Native에 Web 탐색을 자동 복제하지 않음 |

위 판단은 공개 API 대응표, catalog, 양 renderer의 실제 구현과 대조한 후보 분류다. 새 변형 구현·실험 등록·기능 검증 완료를 뜻하지 않는다. 사용자 후속 요구에 따라 디자인 프리셋은 색·재질뿐 아니라 이런 상호작용·구성·화면 변형을 선택하는 경로까지 제공해야 한다. 단순 재색상으로 전 단계 요구를 완료 처리하지 않는다.

### 후속: 버튼·카드·캐러셀·체크박스 하단

실제 viewport 모음 44~65번을 추가로 직접 확인했다. 새 88개 viewport를 기존 172개와
합쳐 **65모음 / 260개 고유 viewport**다. Button group·Button·Card·Carousel·Checkbox는
각각 상단부터 footer까지 확인했고, 완전히 확인한 기본 desktop/light 갤러리 경로는
기존 11개에서 16개가 됐다. 원본 구현의 모든 상태를 검토한 수치가 아니다.

| 추가 경로 | 기본 예제 카드 수 | 시각 관찰과 기존 HJM 대조 |
| --- | --- | --- |
| Button group | 35 | 연결된 버튼·분리된 primary/secondary·toggle·split action이 섞인다. 행동 묶음은 Button+Stack, 선택은 ToggleGroup/SegmentedControl을 먼저 사용한다. Menu 초점·기본 행동은 split action 원본에서 별도 확인 |
| Button | 118 | solid/outline/link·pill·아이콘·floating·timed·split 표현. 양 Button의 tone/size/shape/align/selected/loading/leading/trailing과 IconButton을 먼저 사용한다. 타이머·floating 배치·서버 확정은 thumbnail로 추정하지 않음 |
| Card | 77 | media 위/옆·본문/metadata·독립 action·선택·문서 카드가 보인다. 양 Card의 media/title/description/children/actions 슬롯과 DocumentResource를 비교. 카드 전체 링크와 내부 버튼은 다른 의미로 유지 |
| Carousel | 22 | 단일 슬라이드·filmstrip·부분 노출·여러 항목·banner·indicator 표현. 양 Carousel/CarouselMotion은 유한 keyed 선택과 단일 active 의미를 제공한다. 여러 보이는 항목·peek는 새 가시성/초점 계약을 검토해야 하며 현재 API로 동등하다고 표현하지 않음 |
| Checkbox | 84 | 기본 행·설명·그룹·카드형·선택/미선택·중간 상태 thumbnail. 양 Checkbox의 presentation/description/leading과 CheckboxGroup 엔진을 우선한다. Card.selected를 다중 선택 엔진으로 대체하지 않음 |

추가 336개와 기존 425개를 합쳐 기본 thumbnail/card 표현 **761/2,671개**를 확인했다.
갤러리 footer·Resources·이름 분포까지 읽었으며 linked 원본, hover·실제 선택·모션·추가
환경·작은 thumbnail 내부 문구는 여전히 별도 검토 대상이다.

Card를 대조하다 Native 내부 media clip은 foundation radius, 외부 Surface는 Provider
profile radius를 쓰는 실제 누락을 발견했다. 내부도 같은 토큰에 연결했고,
[테마 QA 후속](2026-10-07-design-profile-research.md#후속-native-card의-테마-모서리)에
수정 전·후 및 Node 검사 범위를 기록했다. 이는 원본 Card 77개의 실제 동작을 검증했다는 뜻이 아니다.

### 후속: 색상·입력·날짜·패널·문서·글자·목록

실제 viewport 모음 66~105번을 직접 확인하고 원본 이미지 SHA-256을 대조했다.
직전 연속 검토에서 읽었지만 원장에 아직 남기지 않은 66~97번도 이번 기록에 포함한다.
**105모음 / 420개 고유 viewport**, 완전한 기본 desktop/light 경로 **36개**다.
다음 Modal 페이지는 아직 이 수치에 포함하지 않는다.

| 추가 경로 | 보이는 기본 사례 카드 수 | 관찰·대조 후보 |
| --- | --- | --- |
| [color-picker](https://component.gallery/components/color-picker/) | 18 | Hex field/swatches, palette, hue/saturation plane, slider and wheel. Constrained semantic choice and free colour selection need distinct validation; thumbnails do not prove keyboard behaviour. |
| [combobox](https://component.gallery/components/combobox/) | 37 | Autocomplete, lookup, filtered input, grouped results and tag/clear affordances. Query, selected value and async results must remain separate; compare Combobox/Select/Menu meanings before adoption. |
| [date-input](https://component.gallery/components/date-input/) | 18 | Segmented day/month/year, locale field, calendar trigger, clear and expiry month/year. Memorable dates, range, time and timezone are separate requirements. |
| [datepicker](https://component.gallery/components/datepicker/) | 44 | Single/range calendars, month scrolling, time/month pickers and relative presets. Selection rules and locale conversion cannot be inferred from the gallery appearance. |
| [drawer](https://component.gallery/components/drawer/) | 38 | Side and bottom panels, fixed actions, navigation and task panels. Modal/non-modal, dismissal, focus return and routing are separate original behaviour checks. |
| [dropdown-menu](https://component.gallery/components/dropdown-menu/) | 49 | Action/context menus, leading icons, destructive items, checks/radios, separators and submenus. Listbox/select aliases do not establish action-menu equivalence. |
| [empty-state](https://component.gallery/components/empty-state/) | 16 | No data, no results, permission/error, completion and onboarding thumbnails are mixed. Keep real state and appropriate recovery/action semantics. |
| [fieldset](https://component.gallery/components/fieldset/) | 32 | Legends, hints/errors, grouped radio/checkbox controls, nested bordered/unbordered field groups. Do not substitute a generic visual card for field grouping semantics. |
| [file-upload](https://component.gallery/components/file-upload/) | 32 | Button/native file field/dropzone, accepted type and size hints, single/multiple files and progress. File choice, drag/drop, upload transport and retry require distinct owners. |
| [file](https://component.gallery/components/file/) | 6 | Download links, file type/size metadata, document previews and file lists. Reuse document resource choices before adding a duplicate visual component. |
| [footer](https://component.gallery/components/footer/) | 19 | Compact legal/copyright, multi-column links, social/newsletter and language controls. Site footer and fixed screen CTA/info are different placements. |
| [form](https://component.gallery/components/form/) | 21 | Stacked/inline/grid fields, submit/reset, hint and validation appearances. Layout themes must preserve values, validation and grouping semantics. |
| [header](https://component.gallery/components/header/) | 38 | Site mastheads/navigation, app top bars, page/back titles, search and account controls. Global navigation and local page heading remain distinct scopes. |
| [heading](https://component.gallery/components/heading/) | 29 | Display/subheading/eyebrow hierarchy. Visual scale is independent of semantic document level; audit full theme-token consumption in current Heading. |
| [hero](https://component.gallery/components/hero/) | 9 | Image overlay, split image/copy and title-only banners with multiple CTA choices. Screen structure reusable; imagery, text and brand belong to product. |
| [icon](https://component.gallery/components/icon/) | 45 | Stroke, filled, multicolour, sizing and service glyphs. Decorative/meaningful and RTL semantics matter; no logo/font asset licensing inferred. |
| [image](https://component.gallery/components/image/) | 29 | Photo/placeholder/thumbnail, borders, crop and figure caption appearances. Alt text, loading/error and aspect ratio need original implementation checks. |
| [label](https://component.gallery/components/label/) | 15 | Field labels with required/optional indicators and question/checkbox labels. Typography alone does not establish association with a field. |
| [link](https://component.gallery/components/link/) | 64 | Inline, standalone arrow, external, back and button/tile-style links. Navigation destination and real action semantics remain separate regardless of visual shape. |
| [list](https://component.gallery/components/list/) | 67 | Ordered/unordered/description, nested, comparison, grouped and action lists. Marker style, key/value relation, navigation and selection are different contracts. |

추가 626개를 합쳐 기본 갤러리 카드 **1,387/2,671개**를 확인했다. 일부 카드는 X 등의
placeholder 이미지로 표시돼 목록·이름·배치는 확인했지만 원본 컴포넌트 모양을 봤다고
계산하지 않는다. 기존 img 로드 실패 0은 실제 원본 미리보기 제공의 증거가 아니다.

이 배치의 표는 시각 관찰과 후보 분류다. 원본 구현·상태·모션·키보드·dark/모바일 및
현재 HJM API source 대조를 끝낸 것으로 표시하지 않는다. Heading의 기본 글자와 문서
단계 구분은 기존 계약을 유지하며, 큰 제목을 포함한 프로필 토큰 연결을 후속 감사한다.


### 후속: 모달·탐색 하단

106~113 모음의 새 viewport 32장을 직접 확인해 **113모음 / 452개 고유 viewport**다.
Modal 82개·Navigation 62개 카드의 기본 갤러리 표현과 footer를 읽었다. 완전한 기본
경로는 **38개**, 보이는 갤러리 카드는 **1,531/2,671개**다. Pagination 첫 2개 viewport는
봤지만 경로·48개 전체 사례 완료로 세지 않는다.

Modal은 입력·확인·오류·timeout 등이 섞이고 Navigation은 site/app/in-page·side/bottom/rail
등이 섞인다. 기존 상태·초점·취소·경로 계약은 실제 원본 동작을 비교한 뒤 선택한다.
이 두 페이지의 HJM source 전체 대조와 원본의 focus trap·복귀·키보드 검토는 미완료다.

Heading source 대조에서는 level1/2 프로필 누락을 확인해 기존 Heading을 확장했다.
[제목 테마 후속 QA](2026-10-07-design-profile-research.md#후속-테마의-다섯-제목-단계)에
같은 원장의 시각 관찰과 별개인 코드·로컬 검증 범위를 기록한다.

### 후속: 페이지 나누기·팝오버 하단

114~120 모음의 새 viewport 28장을 직접 확인했다. 총 **120모음 / 480개 고유 viewport**,
완전한 기본 desktop/light 경로 **40개**, 보이는 기본 갤러리 카드 **1,629/2,671개**다.
Pagination 48·Popover 50개 추가이며 앞서 읽은 Pagination 첫 2 viewport를 중복 계산하지 않는다.

페이지 나누기는 번호·첫/끝·이전/다음·현재/전체·항목 수·페이지 선택이 섞이고,
팝오버는 안내·확인·메뉴·입력 폼이 섞인다. 각각 gallery 상세 설명·markup·이름 분포·resources·
footer도 읽었다. pagination의 route/link와 데이터 목록 paging, popover의 modal/non-modal·
menu·tooltip 의미는 원본 동작과 기존 엔진을 비교한 뒤 결정한다. 새 API 채택 판단은 미완료다.
Popover의 잘못된 expanded 설명은 앞선 공식 명세 대조 기록과 동일한 문제이며 중복 오류로 세지 않는다.

### 후속: 기본 desktop/light 경로 전수 시각 검토

121~189 모음의 실제 viewport 276장을 기존 480장과 합쳐 원본 digest를 대조했다.
**189모음 / 756개 고유 viewport / 66개 완전한 기본 경로**다. 컴포넌트 60개 경로의
보이는 기본 사례 카드 **2,671/2,671개**, 일반 경로 6개의 하단까지 확인했다. 앞선 연속
검토에서 읽은 121~128 모음도 이번 원장에 보존하며 다시 방문한 것으로 중복 계산하지 않는다.

| 추가 경로 | 기본 사례 카드 | 관찰·비교 후보 |
| --- | --- | --- |
| [progress-bar](https://component.gallery/components/progress-bar/) | 40 | Lines/rings, labels, percentage and varied track geometry. Known progress, unknown duration and target ranges differ; a still preview cannot prove truthful progress or animation. |
| [progress-indicator](https://component.gallery/components/progress-indicator/) | 38 | Discrete horizontal/vertical steps, timeline-like status and bar/ring forms. Compare Steps, Timeline and Progress by task meaning. |
| [quote](https://component.gallery/components/quote/) | 11 | Bordered quotes, pull quotes and testimonial attribution. Compare semantic quote/source/caption roles; the embedded example visibly failed to display. |
| [radio-button](https://component.gallery/components/radio-button/) | 85 | Dots, descriptive cards, disabled options and yes/no groups. Some previews show checkboxes or select-all wording; category membership does not prove single-choice semantics. |
| [rating](https://component.gallery/components/rating/) | 19 | Whole/fractional stars, scores, review totals and risk glyphs. Separate aggregate display from selectable user input. |
| [rich-text-editor](https://component.gallery/components/rich-text-editor/) | 5 | Five toolbar/document previews plus complete lower guidance. Compare document model, paste, sanitization and native host boundaries before adopting an editor adapter. |
| [search-input](https://component.gallery/components/search-input/) | 30 | Icon fields, submit buttons, pills, helpers and voice/filter affordances. Query submission, live filtering and suggestions differ; preserve input/result state on profile changes. |
| [segmented-control](https://component.gallery/components/segmented-control/) | 28 | Pills, underlines, boxes, icons and descriptive options. Single choice, multiple toggles and tab panels need different semantics. |
| [select](https://component.gallery/components/select/) | 82 | Native/custom, searchable, hierarchical and multiselect previews. Selected value, query, hierarchy and action menus remain distinct. |
| [separator](https://component.gallery/components/separator/) | 34 | Thin/thick, vertical/horizontal, OR labels and decorative rules. Compare decorative versus semantic separation with existing Divider. |
| [skeleton](https://component.gallery/components/skeleton/) | 30 | Lines, circles and composite card placeholders. Still appearances do not prove shimmer motion; compare geometry, busy announcements and reduced motion. |
| [skip-link](https://component.gallery/components/skip-link/) | 14 | High-contrast focus links, main/footer destinations and multiple skip links. Some placeholders; compare destination focus and page landmarks with SkipNav. |
| [slider](https://component.gallery/components/slider/) | 38 | Single/range thumbs, values, marks, volume and brightness. Original min/max/step, keyboard, touch and multi-thumb order remain unverified. |
| [spinner](https://component.gallery/components/spinner/) | 66 | Arcs/rings, dots/squares, logos, inline text and overlays. Unknown-duration feedback differs from determinate progress; motion/announcement/blocking need runtime evidence. |
| [stack](https://component.gallery/components/stack/) | 10 | Horizontal/vertical item wrappers, badges and consistent gaps. Compare Stack/Inline and wrapping before adding a duplicate spacing API. |
| [stepper](https://component.gallery/components/stepper/) | 20 | Numeric quantity controls, spinbuttons and travellers. Gallery Stepper changes a number; compare NumberField separately from task Steps. |
| [table](https://component.gallery/components/table/) | 73 | Tables, summaries/comparisons, tree tables and grids with statuses/actions. Compare sorting/selection/editing and responsive reading with the existing engines. |
| [tabs](https://component.gallery/components/tabs/) | 80 | Horizontal/vertical, pill, underline and icon forms. Full guidance re-read; reversed arrow axes are the already recorded error. Activation and panel persistence remain unverified. |
| [text-input](https://component.gallery/components/text-input/) | 72 | Border/underline/fill, floating labels, helpers and prefilled values. Label association, composition input and failure recovery need runtime review. |
| [textarea](https://component.gallery/components/textarea/) | 52 | Multiline, counters/helpers, resize handles, filled and floating-label forms. Compare auto-growth, resize, max length and composed-input recovery. |
| [toast](https://component.gallery/components/toast/) | 41 | Compact/multiline, close, undo/action, timestamps and progress previews. Compare duration, announcement, pause and recovery with Toast/NoticeBanner. |
| [toggle](https://component.gallery/components/toggle/) | 60 | Track/thumb, check/cross, on/off text, switch cards and yes/no segments. Immediate boolean settings, form checkbox and radio choice differ. |
| [tooltip](https://component.gallery/components/tooltip/) | 74 | Hover/focus labels mixed with callouts, hover cards, links and close buttons. Keep noninteractive Tooltip distinct from interactive Popover/menu. |
| [tree-view](https://component.gallery/components/tree-view/) | 14 | Nested folders/text, checkboxes, icons and selected rows. Expansion and selection are independent; keyboard, async loading and focus remain unverified. |
| [video](https://component.gallery/components/video/) | 15 | Native controls, service embed posters and animated-image previews. Playback/captions/fullscreen, provider resources and native host remain unverified. |
| [visually-hidden](https://component.gallery/components/visually-hidden/) | 11 | All eleven cards use placeholders; only names, metadata and layout are visible. DOM and assistive-technology behaviour cannot be certified visually. |

추가 1,042개를 포함한 수치다. X placeholder·작은 내부 문구·Quote의 깨진 embedded 예제는
원본 표현/동작을 검증한 것으로 처리하지 않는다. VisuallyHidden 11개는 모두 placeholder다.
Tabs의 축 설명 오류는 기존 2개 오류 중 하나의 재확인이며 새 오류로 중복 집계하지 않는다.

**기본 목록·하단 시각 검토 완료이며, 사이트 전체 기능 검토 완료는 아니다.** linked 원본,
필터/정렬/검색·테마·작은 화면·키보드·스크린리더·HJM source 대조와 최종 채택 판단이 남았다.
`visualReview`, `interactionReview`, `adoptionDecision`의 pending을 일괄 완료로 바꾸지 않았다.
Radio는 [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)의 단일 선택 의미와
대조했고 Tooltip은 [APG 작업 중 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)의
초점 없는 popup과 focusable dialog 구분을 대조했다. 이는 각 linked 원본의 동작 검증은 아니다.
상세 지침 12개의 독해 수치도 중복 증가시키지 않는다.

## 6. 미확인 범위와 후속 조건

| 미확인 항목 | 후속 조건 |
| --- | --- |
| 기본 카드/하단 검토 이후 원본 표현 | 기본 2,671개 목록 검토는 완료. placeholder와 작은 내부 글자는 원본에서 확인 |
| general-page 추가 환경/탐색 | 기본 desktop/light 하단 확인은 완료. filter/sort/search·환경과 linked 원본은 별도 확인 |
| filter/sort/search/테마·작은 화면·키보드 | 공개 탐색 흐름을 실제 UI로 확인. 외부 폼 제출 없음 |
| 원본 linked implementation | 채택 권장 후보의 의미·상태·모션·접근성·의존성·라이선스를 원본과 대조 |
| 11개 사이트 전체·HJM 실험·검증·승격·릴리스·소비 앱 | 이 사이트의 일부 확인을 전체 완료 근거로 사용하지 않고 전체 비교 후 진행 |

## 7. 보관 처리

- 원시 본문·캡처·digest·도구는 현재 전수조사의 재검토 자료이므로 보존한다. 검토와 QA 기록이 끝나기 전 삭제하지 않는다.
- 이 보고서는 지속 가능한 판단·확인 수치·재현·미확인 범위를 보존한다. 임시 raw 경로는 영구 문서 링크로 만들지 않는다.
- [사이트 목록](../plans/reference-site-inventory.json), [페이지별 검토 원장](../plans/reference-component-review-ledger.json)에 이 보고서를 연결한다.
