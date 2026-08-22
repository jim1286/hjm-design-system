# ContentState scope axis

**문제.** 로딩·빈 화면·오류는 화면 전체를 대신할 수도, 화면의 한 구역만 대신할 수도
있다. 야잘알은 이 둘을 위해 이미 서로 다른 컴포넌트를 쓰고 있다 —
`AppStateView`(화면 전체, 유일한 출구, 채움 버튼)와 `AppStateRegion`(한 구역, 선택적
복구, ghost + 브랜드 텍스트)(`modules/app-rn/src/components/ui/AppStateView.tsx`,
`AppStateRegion.tsx`). 이 구분은 `DESIGN_SYSTEM.md` §6 「오류 복구 행동」이 이미
문장으로 규정해 뒀고, UI 검수(`review.md`)에서 이 축이 없어서 생긴 결함이 확산 1위
(상태가 화면 크롬을 삼킨다, 6화면+라우트 7개)와 7위(구역 실패를 화면 전체 컴포넌트로
그린다, 3화면)를 차지했다. 그런데 이 축은 `Result`의 `status`(success/failure/info,
`docs/result.md`가 이미 확인)에도, `EmptyState`의 시각 recipe에도 없다 — 어느 계약도
"이 실패가 화면 전체를 막는가, 구역만 막는가"를 모른다.

## 판정 — 새 컴포넌트도 아니고 `EmptyState`/`Result`의 축도 아니다

세 후보를 확인했다.

1. **`EmptyState`에 붙이는 안.** 기각. `emptyStateRecipe`(`src/component-recipes.ts`)는
   지금 icon/title/description/action의 **시각 토큰만** 있고 descriptor·validator·
   content 상태 자체가 없다(`loading`을 표현할 수 없다 — 실제 제품은 loading을
   `AppSkeleton`으로 완전히 다른 모양으로 그린다). scope 축은 loading에도 적용되는
   축이라 EmptyState 하나로는 담기지 않는다.
2. **`Result`에 붙이는 안.** 기각. `docs/result.md`가 이미 확인한 대로 Result가 푸는
   문제(사용자 행동 뒤의 flow terminus — 결제 성공/실패)는 이 축이 관측된 화면
   (데이터 로드 실패)과 다르다. `status`(success/failure/info)와 `scope`(screen/region)는
   서로 다른 실물 질문이라 하나의 필드로 묶으면 Result가 갖지 않는 질문(로딩 중엔
   무엇을 보여줄지)까지 떠안는다.
3. **독립된 공용 축 + 작은 계약.** 채택. `docs/expansion-roadmap.md`의 「공통 상태 축」
   표(interaction/availability/value/validation/content)에 들어갈 만큼 여러 컴포넌트가
   참조할 개념이지만, 그 표의 다른 축과 성격이 다르다 — 그것들은 **한 인스턴스가
   시간에 따라 오가는 상태**(hover→pressed, idle→loading)인데 `scope`는 **저작 시점에
   한 번 정해지는 배치 결정**이다(화면을 만들 때 "이 실패가 전체냐 구역이냐"를 정하지,
   렌더링 도중 전체와 구역을 오가지 않는다). 그래서 `content` 축의 **직교 차원**으로
   문서에는 나란히 두되, 별도 모듈(`src/content-state.ts`)로 분리했다 — `EmptyState`가
   나중에 loading을 포함하는 완전한 descriptor를 갖추면 이 모듈의 타입을 `import`해서
   쓸 자리다.

`content` 축과의 직교 확인: `ContentStateStatus`는 공통 축의 `loading|empty|error`만
쓴다(`idle`·`success`는 블록 자체를 그리지 않고, `loadingMore`·`complete`는 `LoadMore`
footer 전용이라 이 계약 밖이다 — footer는 정의상 항상 region이므로 그 축이 필요 없다).
세 상태 모두 screen과 region 양쪽에서 실제로 관측된다(로딩 스켈레톤은 전체 화면일 수도
`MatchDetailSectionState`처럼 구역일 수도 있다, 빈 화면도 마찬가지, 오류도 마찬가지) —
그래서 새 축이 맞다.

## 일반화한 계약

```ts
const regionError = {
  status: "error",
  scope: "region",
  title: "불러오지 못했어요",
  description: "기본 경기 정보는 그대로 볼 수 있어요.",
  action: { label: "다시 불러오기", onAction: retry },
} satisfies ContentStateDescriptor;
```

- `scope: "screen" | "region"`. `status: "loading" | "empty" | "error"`(공통 `content`
  축의 부분집합).
- `loading`은 `title`/`description`/`action`이 **없다** — `loadingLabel`만 필수다.
  실제 컴포넌트도 로딩을 스켈레톤만으로 그린다.
- `action`은 최대 하나다(`Result`의 primary+secondary 두 개짜리 계약과 다르다 — 이
  문제의 실물에는 복구 행동이 항상 하나였다).
- `resolveContentStateActionEmphasis(scope)`가 `"sole" | "optional"`을 반환한다.
  `screen`은 콘텐츠 층의 유일한 행동이므로 강조, `region`은 선택지 중 하나이므로
  비강조다. Button tone 이름에 직접 묶지 않았다 — HJM의 현재 `ghost` tone
  (`src/recipes.ts`)은 `content: "textMuted"`로 해석되는데, 이 저장소의 실제 region
  복구 버튼은 **브랜드 텍스트**다(`AppButton tone="link"`,
  `modules/app-rn/src/features/match-detail/SectionState.tsx:30`). `ghost`가 아니라
  브랜드 틴트 저강조 tone이 필요하다는 뜻이라, Button의 tone vocabulary가 그 tone을
  갖추기 전까지는 제품이 로컬로 매핑한다.

## HJM 기본값 — 접근성이 이 계약의 핵심이다

`scope`가 실제로 강제하는 것은 버튼 두께보다 **접근성 발표 범위**다. 구역 실패를
낭독할 때 사용자가 화면 전체가 실패했다고 오해하면 안 된다는 요구를
`resolveContentStateAnnouncement(status, scope)`로 코드화했다.

| status | scope | web role/live | native live/role | focus 이동 |
|---|---|---|---|---|
| loading | 무관 | status/polite | polite/progressbar | 안 함 |
| empty | 무관 | status/polite | polite/text | **안 함** (screen이어도) |
| error | screen | alert/assertive | assertive/alert | **함** |
| error | region | alert/assertive | assertive/alert | **안 함** |

세 가지가 이 표에서 의도적으로 대칭이 아니다.

- **empty는 scope와 무관하게 focus를 옮기지 않는다.** §8.4 "빈 상태는 결핍이 아니라
  초대다"— 화면 전체가 비어도 침묵을 깨고 끼어들 정도로 급하지 않다. `moveFocus =
  scope === "screen"`을 모든 status에 일괄 적용하면 이 규칙을 놓친다 — 그래서
  `resolveContentStateAnnouncement`는 `empty` 분기에서 scope를 아예 참조하지 않는다.
  테스트가 이 함정(모든 status에 같은 공식을 재사용하는 것)을 직접 겨눈다.
- **error만 scope로 focus 이동이 갈린다.** screen은 지킬 다른 초점이 없으니 블록으로
  이동해도 안전하지만, region은 사용자가 화면의 다른 곳에서 하던 일이 있을 수 있어
  강제로 끌어오면 "화면 전체가 죽었다"는 오해를 만든다 — 이게 이 계약이 푸는 핵심
  문제다.
- **live/role 자체(assertive/alert)는 error에서 scope와 무관하게 항상 켠다.** 발표
  **강도**는 실패의 심각성(오류)에서 오지 화면 범위에서 오지 않는다. scope가 바꾸는
  것은 발표가 사용자의 **초점**까지 끌고 오느냐일 뿐이다.

## 이 축이 아닌 것 — 「상태가 화면 크롬을 삼킨다」와의 경계

UI 검수 표에서 확산 1위(§9, 6화면+라우트 7개)와 7위(§6, 3화면)는 언뜻 같은 결함처럼
보이지만 서로 다르다.

- **7위(구역→화면 오분류)**는 `scope` **값 선택**이 틀렸다 — 구역 실패인데 `screen`
  컴포넌트를 골라 실패하지 않은 나머지 콘텐츠까지 덮어썼다. 이 계약의 문서와
  validator가 두 값의 의미 차이를 명확히 해 막는 종류의 실수다.
- **1위(크롬 삼킴)**는 `scope: "screen"`을 **올바르게 골랐어도** 나는 실수다 —
  컴포넌트를 화면 크롬(`AppScaffold`/`AppScreen`) **밖**에 두면 상단바·뒤로가기·탭
  바까지 함께 사라진다. 이건 값의 문제가 아니라 **배치**의 문제다. 즉 `scope:
  "screen"`의 진짜 의미는 "화면 전체"가 아니라 **"영구 크롬 안의 콘텐츠 영역
  전체"**다 — 크롬은 어떤 scope 값도 건드리지 않는다. 이 계약은 JSX 트리를 모르므로
  (런타임 의존성 금지) 이 불변식을 **강제할 수 없다** — 타입도 validator도 "이
  컴포넌트가 실제로 크롬의 자손인가"를 알 방법이 없다. 그래서 이 계약은 이 요구사항을
  **문서화된 렌더러 의무**로만 남기고, 실제 강제는 제품이 구조적 가드로 해야 한다.
  야잘알의 `modules/app-rn/src/screen-chrome-boundary.test.ts`(JSX 조상을 정적으로
  세는 vitest)가 정확히 이 역할이고, 참조 구현은
  `modules/app-rn/src/features/home/HomeScreen.tsx:73-113`(`AppStateView`가
  `AppScaffold`의 자손)이다. 이 계약을 다음에 다른 제품에 적용하는 저작자는 같은
  구조적 가드를 그 제품 레이어에 새로 만들어야 한다 — 패키지가 대신해 줄 수 없다.

**결론**: 두 결함은 같은 축(scope) 위에 있지만 방향이 다르다. 하나는 **값 선택
오류**, 하나는 **배치 불변식 위반**이다. 이 모듈은 전자를 명세하고, 후자는 명세할 수
없다는 사실과 그 대신 필요한 장치를 문서화한다.

## 플랫폼 번역

Web/RN 모두 아이콘(있으면)+제목+설명+action 세로 배치는 `EmptyState`의 시각 grammar를
그대로 따른다 — 이 모듈은 그 grammar를 다시 정의하지 않는다. 이 모듈이 추가하는 것은:

- Web: `role`/`aria-live`를 상태 블록 컨테이너 자신에만 건다. region은 그 블록이 속한
  landmark(예: `main`)의 형제로 존재해야 하고, 별도 landmark를 새로 열지 않는다 —
  그래야 보조기기가 "페이지의 일부가 바뀌었다"로 읽지 "새 페이지"로 읽지 않는다.
- Native: `accessibilityLiveRegion`/`accessibilityRole`은 블록 컨테이너에, focus 이동은
  `moveAccessibilityFocus`가 참일 때만 렌더러가 명시적으로 수행한다(예:
  `AccessibilityInfo.setAccessibilityFocus`) — 기본값은 발표만 하고 focus는 그대로
  둔다.

## 검증 화면

- `modules/app-rn/src/features/home/HomeScreen.tsx:73-113` — `AppStateView`가
  `AppScaffold` 자손. `scope: "screen"`이 크롬 불변식을 지킨 참조 구현.
- `modules/app-rn/src/features/match-detail/SectionState.tsx:20-56` — `status ===
  'error'`일 때 `AppNotice announcement="assertive"` + `AppButton tone="link"`,
  나머지는 `AppStateRegion`(`compact`) 기본 복구 tone(`link`)에 위임. `scope:
  "region"`의 실물 — 저강조 action이 `ghost`가 아니라 브랜드 텍스트임을 실제로 보여
  준다.
- `modules/app-rn/src/screen-chrome-boundary.test.ts:61-74`
  (`CHROME_ESCAPE_BASELINE`) — 크롬 불변식이 아직 안 지켜지는 파일 11개 21건의 실측
  목록. `scope: "screen"`을 선택한 화면 중 몇이 아직 배치 불변식을 어기는지 보여주는
  현재 상태.

`planned → beta` 승격에는 이 모듈을 실제로 소비하는 renderer(예: `EmptyState`가 이
타입을 받아들이는 시점, 또는 `AppStateView`/`AppStateRegion`이 이 계약으로 재작성되는
시점)의 vertical slice가 필요하다. 지금은 계약만 있고 어떤 renderer도 아직 이 모듈을
import하지 않는다.
