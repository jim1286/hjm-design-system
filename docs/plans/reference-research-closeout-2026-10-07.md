# 레퍼런스 조사 마무리와 적용 결정

날짜: 2026-10-07 · 상태: 필요한 조사와 후보 판단 마무리 · 전수 검토 완료 아님

## 최신 범위와 완료 기준

사용자가 **“이제 조사 마무리해”, “필요한것만 조사해”**라고 지시했다. 페이지 수 확보보다
테마·구성·상호작용에 필요한 적용 판단을 마무리한다. 이미 저장한 URL/본문/코드/시각/동작
원장은 보존하며, 수집 또는 본문 독해를 전체 원제품 검토로 바꾸지 않는다. 미독해 소개문,
추가 URL, 모든 사이트/환경 조사 자체는 현재 후속 작업·완료 조건·릴리스 차단 대상이 아니다.
새 실험에서 실제로 제공하는 행동과 플랫폼 계약의 검증은 여전히 필요하다.

OS 최대 글자와 최대값을 모사한 확대는 설계·구현·검증·후속·완료/릴리스 차단에서 제외한다.
과거 수행 기록은 보존한다. 일반 코드 push에서 원격 CI/dispatch/버전 상승을 실행하지 않는다.

조사 마무리는 각 후보의 기존 API와 중복 여부, 채택/개선/신규/보류 이유, 필요한 구현 근거가
확정됐다는 뜻이다. 실제 실험 등록·승급·npm 게시·소비 앱 반영은 각각 별도 상태로 관리한다.

## 11개 사이트를 사용하는 범위

| 사이트 | 적용에 쓰는 근거 | 판단과 경계 |
| --- | --- | --- |
| [Minimal](https://minimal.gallery/) | 미니멀·에디토리얼의 위계, 여백, 실제 갤러리 기본 화면 | 기존 Section/Heading/Grid/Asset 배치 변형. 소개문은 제품 동작 근거가 아니며 추가 소개 독해를 중단한다 |
| [DesignBookmark](https://designbookmark.com/) | 제품 목적별 구성과 테마 후보, 도구 소개 | 제품 브랜드/자산은 슬롯으로 공급. 도구·폰트·이미지 라이선스는 제품별 선택 때 확인한다 |
| [Component Gallery](https://component.gallery/) | 역할별 비교와 목록·카드·캐러셀 의미 | 이미 있는 HJM 의미·행동 계약을 우선한다. 갤러리와 원제품 상태 검증을 구분한다 |
| [CTA](https://www.cta.gallery/) | 주 행동, 사회적 증거, 가입/다운로드/선택 흐름 배치 | 기존 Button·Form·Notice·ScreenLayout 조합. 여러 CTA 표현을 별도 버튼 엔진으로 등록하지 않는다 |
| [21st](https://21st.dev/) | 확인한 공개 구현과 목적별 인터페이스 | 잠긴 코드나 Loading/NotFound 본문에서 기능을 추정하지 않는다. 미독해 12,460 URL 원장은 전수 미완료 상태로 보존한다 |
| [Aceternity](https://ui.aceternity.com/) | Manual 코드, 선택한 실제 상태/확장 카드·가로 카드 탐색 | 입력·모달·복구는 HJM 엔진을 유지한다. 다중 카드가 보이는 유한 목록 배치는 List companion으로 구현하고 카드 상세 실험에 연결했다 |
| [Magic UI](https://magicui.design/) | 제공 Manual 코드, 터미널/날짜·시각/미디어/누름 표현 | 명령 기록·날짜/시각 선택은 실제 실험에 연결했다. 장식 모션은 상태 확정 엔진과 분리한다 |
| [Motion Primitives](https://motion-primitives.com/) | 전환·탭·팝오버·캐러셀·반복의 제공 코드와 선택한 실제 흐름 | 내용 전환 비교는 등록했다. 반복/배율/공유 요소는 지원하지 않는 동작을 기존 API 이름으로 제공했다고 표시하지 않는다 |
| [Uiverse](https://uiverse.io/) | 누름·초점·표면 표현 | Button/Pressable 의미를 유지하며 표현만 선택적으로 검토한다. CSS 복사는 Native 동등 구현이 아니다 |
| [3dicons](https://3dicons.co/) | 선택한 아이콘의 각도·재질·다운로드/라이선스 흐름 | Asset 슬롯과 제품 소유 자산에 흡수한다. 기능별 아이콘과 모든 스타일 자동 생성 완료를 뜻하지 않는다 |
| [Refero Styles](https://styles.refero.design/) | 역할별 표면/라운드/타입/밀도와 레이아웃 비교 | 추출 CSS의 잘못된 hex·줄 높이 단위·알파 소실·출처 불일치를 격리한다. 원제품 결함이나 공식 토큰으로 취급하지 않는다 |

[확정 판단 원장](reference-adoption-decisions-2026-10-07.json)에 후보 149건 각각의 API·이유·필수 확인과 출처 원장 SHA를 보존했다.
재사용 96·개선 24·신규 검토 10·보류 19이며, 서로 다른 출처의 같은 요구가 포함된 **후보 기록 수**다.
149개의 새 API 또는 등록 실험을 뜻하지 않는다. 재사용 판정도 제안한 모든 변형의 흡수 완료 증거가 아니다.
가로 목록/상세, 테마 전파, 팔레트/대비, 글자 역할, 같은 상태 비교, 영상 미리보기, 재질/깊이, 기술값 표시를
8개 중복 통합 판단으로 연결했다. 새로운 글꼴 역할·경계 모양 등 실제 차이는 통합하면서 지우지 않았다.

각 관찰의 실제 범위와 원본 SHA는 [A](../qa/2026-10-07-reference-parallel-a.md),
[B](../qa/2026-10-07-reference-parallel-b.md), [C](../qa/2026-10-07-reference-parallel-c.md)에 있다.

## 확정된 적용 단위와 남은 구현

| 적용 단위 | 기존 기능과 결정 | 현재 상태 | 필요한 후속 |
| --- | --- | --- | --- |
| 10종 테마와 앱 소유 설정 | `defineHjmDesignProfile`·Provider·semantic palette·Heading/Surface·OverviewScreen·Tabs 기본값 재사용 | 10종 구현과 기존 실험에 앱 소유 설정 2종을 추가. Web 30조합·상태 유지 및 일부 좁은 다크/RTL/모션 감소 확인, Native 등록/타입 확인. [결과](../qa/2026-10-07-product-theme-propagation.md). 미게시 | Native 실제 흐름과 남은 공개 컴포넌트 토큰 소비 검수. 브랜드·폰트·로고/그림·설정 저장은 제품 소유 |
| 내용 전환 | 기존 `ContentTransition`와 Tabs/OnboardingScreen 합성 | `실험/구성/비교와 검증/내용 전환 비교` 등록 | 실제 제공 행동 검수 후 승급·게시 |
| 날짜·시각 선택 | 기존 DatePicker/Select, 날짜와 시각 draft/요청 수명 분리 | `실험/구성/선택과 필터/날짜와 시각 선택` 등록 | 지원 플랫폼의 실제 흐름 검수 후 승급·게시 |
| 명령 기록 | CodeBlock/Tabs/ClipboardButton, OS 복사 수명 개선 | `실험/구성/정보 표시/명령 기록 표시` 등록, 복사 및 메뉴 입력 회귀 수정 main 반영 | Native 실제 OS/입력 경계 검수, 승급·게시. 셸 실행/실시간 서버 기록은 제품 소유 |
| 여러 카드 탐색과 상세 | List의 기존 세로 의미·Carousel의 단일 active panel과 다른 유한 다중 항목 배치. Card.actions→Dialog는 기존 API 재사용 | `CollectionRail` 계약·양 renderer와 카드 상세 실험 등록. Web 10종 light/dark·폭/끝·초안/모달 복귀 검수, Native host 회귀/타입 확인. [결과](../qa/2026-10-07-collection-detail.md). 1.15.0 이후 미게시 | Native 실제 touch/읽기 순서/OS 초점 검수와 승급·게시. 후기/미디어 목적별 변형은 별도 미반영 |
| 나머지 목적별 구성·표현 | 각 조사 작업의 후보 판단을 전역 중복 병합 | 후보 처분 완료. 개별 변형의 적용·등록은 별도 | 기존 경로에 변형을 흡수하거나 필요한 고유 구성을 등록. 불채택·보류도 이유/조건 보존 |

[실제 등록부](reference-experiment-registrations-2026-10-07.json)는 root가 양 Storybook 파일,
사용 지침과 검증 근거를 확인한 항목만 담는다. 후보 카탈로그의 개수를 등록 수로 사용하지 않는다.

## 마지막 필요한 원제품 확인 — 테마 선택

root의 MCP Playwright 전용 신규 탭에서 [8bitcn Theme Selector](https://www.8bitcn.com/docs/components/theme-selector)를 확인했다.
이것은 앞선 IAB나 Native OS 검증과 다른 Web 브라우저 흐름이다. 기존 blank 탭은 보존하고
본인 신규 탭만 닫았다. DOM/접근성/선택 흐름 확인이며 화면 픽셀 전수·모바일·전체 테마 검토가 아니다.

1. 기본 `theme-default light`에서 Theme combobox를 열고 ArrowDown→Enter로 Sega 선택.
   두 combobox가 Sega로 일치하며 닫힌 trigger로 초점이 돌아왔다.
2. URL에 `?theme=sega`가 생겼고 root CSS `--primary`가
   `lab(7.78201% -.0000149012 0)`에서 `lab(39.7551% 16.9771 -69.7)`로 변경됐다.
3. 관찰한 URL로 새 문서를 열어 Sega 선택과 `theme-sega light`가 유지됨을 확인했다.
   당시 theme 관련 localStorage 키는 없었다. 이를 계정/OS/영구 저장 검증으로 확대하지 않는다.
4. Toggle theme 클릭으로 URL `mode=dark`, root `theme-sega dark`가 됐다. Sega 선택은 유지됐다.
5. 메뉴를 다시 열고 Escape로 닫았을 때 listbox 0, trigger combobox 초점과 Sega 선택이 유지됐다.

선택과 취소는 기존 Select/SegmentedControl, 전파는 HJM Provider에 흡수한다. URL/설정 저장은
앱 소유로 두며 이 외부 Provider·전역 CSS·게임 브랜드 팔레트를 HJM의 새 테마 엔진으로 복제하지 않는다.
폰트/자산 라이선스와 HJM의 light/dark 검증을 외부 CSS import만으로 통과했다고 표시하지 않는다.

## 적용과 게시 순서

1. 후보 처분과 출처를 확정했다. 원장의 8개 통합 판단을 바탕으로 기존 대상에 변형을 연결한다.
2. 기존 실험에 흡수할 변형부터 연결하고 필요한 고유 배치/동작을 보완한다. 공개 API 변경에는
   공통 계약·두 renderer·사용 지침·Changeset을 같은 변경으로 제공한다.
3. 실제 등록·UI/상태·플랫폼 검증을 끝낸 항목을 검토 후 승급한다. 기능 추가 후 검증을 반복해야 하는
   경우와 단순 문서 정리를 구분한다. 원격 CI는 실제 버전 상승 시 수행한다.
4. npm 게시 버전/타입을 확인한 뒤 중앙 release record와 소비 앱 dependency/lock/contract를 갱신한다.
   게시·제품 적용·운영 공개를 별도로 확인한다. 과거 1.14.0 게시를 이번 변경 게시로 안내하지 않는다.
