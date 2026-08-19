# SidePanel contract

**문제.** 화면 가장자리에서 밀려 나오는 보조 콘텐츠 — 상세 편집, 필터, 보조
내비게이션 — 를 보여준다. antd `Drawer`는 `docs/ant-design-coverage.md`가 이미
`Sheet`(adaptive, 주로 하단)와 `SidePanel`(Web)로 **decomposed**하기로 선언해
뒀다(`src/component-references.ts`). 이 문서의 본체는 "SidePanel이 Sheet와 정확히
어디서 다른가"다 — 같은 곳은 재사용하고, 다른 곳만 새로 계약한다.

**Sheet와 같은 것 (재사용).**

- 열림 계약의 모양은 `SheetOpenState`와 동일한 controlled/uncontrolled 쌍이다
  (`open`/`defaultOpen`/`onOpenChange`). `sheet.ts`를 제네릭하게 고치는 것도
  검토했지만 그 파일은 이 배치의 다른 저작자·리드가 쓰는 공유 파일이라 건드릴 수
  없고, 아래 `modal` 분기 로직 자체가 새로 필요하므로 그대로 가져와도 절약되는
  것이 없다 — 그래서 `SidePanelOpenState`로 같은 모양을 다시 선언했다.
- `close-action`/`escape`/`programmatic`은 Sheet와 같은 의미다. `programmatic`은
  controlled owner의 권한이라 `dismissible`/`busy`와 무관하게 항상 허용된다 —
  `canDismissSidePanel`의 첫 줄이 `canDismissSheet`와 같다.
- Reduced Motion에서도 exit 콜백은 항상 한 번 발생한다(Sheet와 동일 원칙).

**Sheet와 다른 것 (새로 계약).**

1. **edge, not placement.** Sheet의 `placement` 기본값은 `bottom`이고 모바일
   바텀시트가 기준이다. SidePanel은 애초에 가장자리에서 나온다는 것이 정체성이라
   `edge: "start" | "end"`(논리 방향, RTL에서 뒤집힘)만 갖는다 — `top`/`bottom`은
   Sheet의 자리로 남겨 두고 가져오지 않는다.
2. **`modal`은 Sheet에 없는 축이다.** Sheet는 항상 모달이라 이 축이 필요 없었다.
   SidePanel은 리드가 지목한 대로 **비모달**(콘텐츠를 옆으로 밀거나 겹쳐 보여주되
   나머지 페이지가 계속 상호작용 가능한 경우)이 실제로 다른 컴포넌트가 되는 지점이다.
   - 비모달에는 배경을 클릭해서 닫을 대상이 없다 — 나머지 페이지가 그대로
     살아있는 상호작용 표면이기 때문이다. 그래서 `outsideDismiss`를 `false`로
     **기본값 처리**하지 않고, `SidePanelDismissPolicy`를 `modal` 판별 유니언으로
     나눠 `modal: false` 분기에는 `outsideDismiss` 필드 자체가 없다(`never`).
     `test/side-panel.test.ts`가 `@ts-expect-error`로 이 조합이 컴파일조차 되지
     않음을 확인한다 — `SheetOpenState`가 controlled/uncontrolled를 섞지 않는 것과
     같은 방식으로 "무효 조합을 타입이 막는다."
   - focus trap과 스크롤 락은 `modal: true`일 때만 적용한다. `modal: false`는
     Web 랜드마크(`role="dialog"` 대신 보조 영역)로 남아 포커스를 가두지 않고
     열려 있는 동안에도 페이지 나머지가 tab 가능해야 한다. `behaviorRegistry`의
     `web.focus` 필드는 값 하나만 가질 수 있어 기본 설정(`modal: true` →
     `"trap"`)만 기록했고, `modal: false`의 예외는 여기 prose와 scenarios에
     남긴다 — 이 계약이 이미 대표값 하나를 적고 나머지를 scenario로 미루는
     자리(Select의 `activeDescendant`처럼)와 같은 방식이다.
   - 콘텐츠를 실제로 밀어내는 layout(flex/grid로 형제 콘텐츠 폭을 줄이는 것)과
     떠 있는 overlay로 렌더링하는 것 중 어느 쪽인지는 **이 계약에 없다** — 그건
     DOM 배치 전략이라 renderer/제품 몫이다. 계약은 dismiss·focus 의미와 시각
     토큰까지만 고정한다.
3. **`back`/`swipe`가 없다.** SidePanel은 Web 전용(`platform: "web"`)이라 Android
   하드웨어 back도, 실측된 swipe-to-dismiss 요구도 없다. `SidePanelDismissReason`은
   `close-action | escape | outside | programmatic` 네 값뿐이다.
4. **`createSheetLifecycle` 대응물이 없다.** 그 lifecycle counter는 Android
   persistent native Modal이 dismiss 완료 시점을 스스로 알려주지 않는 문제를
   풀기 위한 것이었다. Web에는 그 문제가 없다 — `sheetRecipe`/`dialogRecipe`가
   이미 Web에 가정하는 평범한 `transitionend`/exit-callback 패턴으로 충분하다.
5. **radius가 다르다.** Sheet의 `content.radius`는 `xl`(공중에 뜬 카드처럼 둥근
   모서리). SidePanel은 도킹된 가장자리에 그대로 붙는 서랍이라 `radius: null`
   (뷰포트 경계에 flush) — Sheet 토큰을 그대로 베끼지 않은 자리 중 하나다.

**HJM 기본값.** `modal: true`가 기본이다 — Sheet와 가장 가까운, 가장 많이 검증된
경로를 기본으로 두고 비모달은 명시적 opt-in으로 남긴다(측정된 요구가 나타나면
그때 기본을 재검토한다). 폭은 `compact 320 / regular 400 / wide 560`이며 header
target은 `control.minTouchTarget`(44) 이상을 유지한다.

**플랫폼 번역.** Web 전용이다. `modal: true`는 `role="dialog"` + Tab trap +
스크롤 락, `modal: false`는 보조 landmark + 트랩 없음이다. `dismiss`는
`["escape", "outside"]`만 공개한다 — Sheet의 web dismiss 목록과 같은 관례로,
버튼 클릭(`close-action`)은 renderer가 직접 `requestClose`를 호출하는 일반
동작이라 "플랫폼이 감지하는 중단 벡터" 목록에 넣지 않는다.

**검증 화면.** 아직 실제 제품 vertical slice가 없다 — catalog는 `planned`으로
남고, `beta` 승격은 로드맵 gate(실제 화면 검증)를 통과한 뒤 리드가 진행한다.
