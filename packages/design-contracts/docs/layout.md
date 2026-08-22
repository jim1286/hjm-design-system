# Layout contract

**문제.** 앱의 지속적인 구조 골격 — 헤더, 사이드바, 본문, 푸터가 어떻게 배치되고,
스크린 리더 사용자가 반복되는 내비게이션을 건너뛸 수 있는지. antd `Layout`
(alias `AppShell`) → HJM `Layout`(`src/component-references.ts`,
`relationship: "direct"`).

**먼저 뺀 것 — 이미 다른 컴포넌트가 소유한다.** 헤더 크롬은 이미
`TopBar`(native, beta), 푸터 내비게이션은 이미 `BottomNavigation`(adaptive,
beta)이다. `Layout`이 그 콘텐츠나 상태를 다시 계약하면 두 곳이 같은 것을
소유하게 된다 — DataTable이 Pagination/LoadMore를 소유하지 않고 합성하기로 한
것과 같은 실수를 피한다. `Layout`은 **header/footer가 있다는 사실**만 알고
(`hasHeader?`/`hasFooter?`), 그 안의 내용은 모른다.

**판정 기준 통과 여부.**

- **제품 의미**: 있다. "이 화면이 지금 앱의 상시 골격 안에 있는가, 아니면 모달
  위에 떠 있는가"는 사용자에게 실제로 다른 뜻이다.
- **접근성 계약**: 있다 — 그리고 이게 Stack/Grid와 갈리는 지점이다. `main`
  랜드마크는 **정확히 하나**여야 하고, 헤더나 사이드바처럼 반복되는 내비게이션이
  `main` 앞에 있으면 WCAG 2.4.1(Bypass Blocks)에 따라 skip link가 있어야 한다.
  Web 전용 `validateLayoutWebDescriptor`가 이 규칙을 강제한다 — `hasHeader`나
  `sidebar`가 있는데 `skipLinkLabel`이 없으면 던진다. 공통
  `validateLayoutRegions`는 region/sidebar 구조만 검사하므로, bypass-link 개념이
  없는 Native에 Web 요구를 강제하지 않는다. 기존 `validateLayoutDescriptor`는
  Web validator의 호환 alias다.
- **플랫폼 번역**: 성립하지만 비대칭적으로 성립한다. Web은 실제 랜드마크
  엘리먼트(`<header>`/`<nav>`/`<main>`/`<footer>`)가 있다. Native는 랜드마크
  개념 자체가 없다 — `accessibilityRole`은 heading/control용이지 페이지 영역용이
  아니다. 그래서 Native는 순서와 `accessibilityViewIsModal`(오버레이 사이드바일
  때)로 근사할 뿐, 진짜 랜드마크 parity는 없다. 이 비대칭을 감추지 않고
  `native: { roles: [], states: [], actions: [] }`로 정직하게 비워 뒀다 —
  BottomNavigation이 iOS의 불안정한 tab role에 대해 button+selected fallback을
  명시한 것과 같은 태도다.

**일반화한 계약 — 좁힌 이유.**

- 사이드바의 `role`(`navigation` | `complementary`)과 `mode`(`persistent` |
  `overlay`)를 **독립된 축**으로 뒀다. 처음에는 `mode`에서 `role`을 유도하려
  했다(오버레이면 `complementary`, 상시 노출이면 `navigation`) — 그런데 그건
  틀린 논리다. `role`은 **내용의 의미**(주 내비게이션인가, 본문과 관련된 보조
  콘텐츠인가)이고 `mode`는 **표시 방식**(항상 보이는가, 열고 닫는 오버레이인가)이라
  서로 다른 축이다. 상시 노출된 필터 패널(`complementary` + `persistent`)도,
  오버레이로 여닫는 주 내비게이션(`navigation` + `overlay`, 좁은 화면의 햄버거
  메뉴)도 둘 다 실제로 존재하는 조합이다.
- `mode: "overlay"`일 때 그 열림/닫힘 생명주기는 **`SidePanel`을 그대로
  쓴다.** `Layout`은 `SheetOpenState`/`SidePanelOpenState` 모양의 새 controlled
  상태를 만들지 않는다 — `layoutBehavior.controlled`가 빈 배열인 이유다. 두
  곳이 "열려 있는가"를 각자 소유하면 반드시 갈린다는 것을 DataTable/SidePanel
  작업에서 이미 확인했다.
- **넣지 않은 것**: `main` 안의 임의 콘텐츠 배치(그건 Stack/Grid 계약을
  합성한다), persistent↔overlay 전환 class 자체(공통 breakpoint와
  `ResponsiveValue`는 `docs/responsive-grid.md`를 쓰되 어느 class에서 모드를
  바꿀지는 제품이 선언한다), 사이드바 리사이즈(그건 [[splitter]]가 이미
  다루는 문제이고 필요하면 Layout이 Splitter를 합성한다).

**HJM 기본값.** Skip link는 평상시 숨어 있다가 키보드 포커스가 닿을 때만
보인다(`visibility: "focus-only"`) — identity.md의 "조용한 화면 위에 중요한
순간만 선명하게"를 그대로 따른 것으로, 마우스/터치 사용자에게는 매 화면 잡음이고
키보드 사용자에게는 페이지 첫 랜드마크다. `main`의 `maxWidth`/좌우 padding은
새 숫자를 만들지 않고 `foundations.ts`의 `layout.contentMaxWidth`/
`layout.pagePadding.regular`를 그대로 쓴다.

**플랫폼 번역.** Web: `banner`/`navigation`/`complementary`/`main`/`contentinfo`
랜드마크 role. Native: 랜드마크 대응 없음 — 순서와 heading, 오버레이
사이드바의 `accessibilityViewIsModal`로 같은 사용자 의도(지금 이 콘텐츠가
상시 골격인가 임시로 뜬 것인가)를 다른 방식으로 전달한다.

Web의 `footer` slot은 `Layout`이 `<footer>` contentinfo를 정확히 한 번 소유한다.
`BottomNavigation`은 자체 루트를 이름 있는 `<nav>`로 렌더링하고 contentinfo를
만들지 않으므로 `footer={<BottomNavigation ... />}` 합성 결과도 `<footer>` 하나와
`<nav>` 하나다. Native `Layout`은 같은 source order만 유지하며 skip link를
렌더링하거나 요구하지 않는다. `skipLinkLabel` Native prop은 이전 호출부 호환을
위해 deprecated 상태로만 남아 있다.

**현재 검증과 남은 증거.** 공통 descriptor를 직접 소비하는 first-party Web/RN renderer가
추가되어 catalog와 두 surface를 `beta`로 승격했다. Web renderer는 실제
`header`/`nav|aside`/`main`/`footer` landmark, BottomNavigation과의 단일-landmark 합성,
skip-link focus 이동, persistent/overlay sidebar 합성을 SSR·browser test로 검증한다.
Native renderer는 같은 region 순서와 overlay
adapter를 유지하되 존재하지 않는 landmark role을 만들지 않는 기본 실행 증거를 제공한다.
실제 product shell의 브라우저·VoiceOver·TalkBack 검증과 200% 글자 크기 증거는 stable
승격 전까지 명시적인 debt로 남는다.
