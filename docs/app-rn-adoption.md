# app-rn 채택 계획 — 어느 계약을 채택하면 결함이 실제로 줄어드는가

이 문서는 코드를 만들지 않는다. `hjm-design-system`·`yajalal/modules/app-rn` 두 저장소를 읽기 전용으로
조사해, 「어느 계약을 app-rn이 채택하면 실측된 결함이 실제로 줄어드는가」에 근거로 답한다.
근거가 되는 실측 자료:

- `/Users/jimin/Desktop/yajalal/.claude/qa/runs/20260818_234500_app-rn-ui-design/review.md` — 28화면 검수 요약, 반복 패턴 표
- 같은 폴더의 `designer-brief.md`(반복 패턴 원문, 8개 항목), `bugs.md`(결함 ID), `reviews/*.md`(화면별 보고서 19편)
- `modules/app-rn/DESIGN_SYSTEM.md` — 판단 기준(§1~§10), 특히 §7 컴포넌트 경계
- `modules/app-rn/src/lib/theme/*`, `modules/app-rn/src/design-boundary.test.ts` — 실제로 무엇이 경계를 건너가는지
- `docs/promotion-candidates.md`, `src/catalog.ts`, `docs/expansion-roadmap.md` — hjm 쪽 승격 후보와 성숙도

## 0. 가장 먼저 답해야 했던 질문 — 그 경계로 무엇이 건너가는가

리드의 짐작대로였다. **토큰(색·간격·타이포·radius·motion)만 건너가고, 컴포넌트 계약은 하나도
건너가지 않는다.** `modules/app-rn/src/design-boundary.test.ts:512-551`의
`hjmImportsOutsideTheme` 감사는 `@hjm/design-system` import를 `lib/theme/` 밖에서 쓰면
빌드를 깨뜨린다 — 그래서 이 확인은 근사치가 아니라 게이트로 강제된 사실이다.

`lib/theme/` 안에서 실제로 `@hjm/design-system`을 import하는 이름을 전부 세면:

- 순수 토큰: `spacing`, `radius`, `motion`, `typography`, `withAlpha`, `control`, `glyph`,
  `overlay`, `scrim`, `shadow`, `brandGradient`, `onBrandGradient`, `onAccentFill`,
  `accentFill`, `ACCENTS`, `THEMES` — `shared-theme-bridge.ts:1-6`, `index.ts:9-16,1240-1254`
- 타입: `AccentTone`, `ResolvedTheme`, `ThemeColors`, `ThemePreference`, `TextVariant`,
  `GlyphSize`, `FieldShape`, `FieldVariant`, `ButtonSize`, `SegmentedControlSize` —
  `index.ts:1258-1268,1838`, `foundations.ts:1`
- 시각 레시피(순수 함수/객체, 행동 없음) **딱 넷**: `buttonRecipe`(`buttons.ts:1`),
  `surfaceRecipe`(`surfaces.ts:1`), `fieldRecipe`·`segmentedControlRecipe`(`index.ts:9-16`)

그런데 실제 컴포넌트 레이어(`components/ui/*.tsx`)가 쓰는 시각 레시피는 이 넷이 아니다.
`index.ts`를 훑으면 **19곳**에 다음과 같은 주석이 붙어 있고, 이 주석 자체가 "아직 채택
전"이라는 저자의 진단이다:

> `/** Temporary v0.1 bridge matching the [upstream/renderer-neutral] HJM v0.2 <X> recipe exactly. */`

| 줄 | 대상 | hjm 쪽 정의 |
|---|---|---|
| `index.ts:102` | Icon | `src/icon.ts` (`iconRecipe`, `component-recipes.ts`) |
| `index.ts:223` | Sheet(behavior) | `src/sheet.ts` |
| `index.ts:1017` | Menu | `src/component-recipes.ts` |
| `index.ts:1311` | AlertDialog(type) | `src/alert-dialog.ts` |
| `index.ts:1865` | Tabs | `src/component-recipes.ts` |
| `index.ts:1914` | SearchField | `src/component-recipes.ts` |
| `index.ts:2002` | Chip | `src/component-recipes.ts` |
| `index.ts:2056` | Accordion | `src/component-recipes.ts` |
| `index.ts:2110` | AlertDialog(recipe) | `src/component-recipes.ts` |
| `index.ts:2269` | Badge | `src/component-recipes.ts:1428` 부근 |
| `index.ts:2338` | Switch | `src/component-recipes.ts` |
| `index.ts:2383` | Progress | `src/component-recipes.ts` |
| `index.ts:2404` | **Statistic** | `src/component-recipes.ts:1428`, `src/statistic.ts` |
| `index.ts:2488` | Toast | `src/toast.ts` |
| `index.ts:2595` | Divider | `src/component-recipes.ts:539` |
| `index.ts:2608` | Text | `src/component-recipes.ts` |
| `index.ts:2675` | **List** | `src/component-recipes.ts:551` |
| `index.ts:2687` | **ListRow** | `src/component-recipes.ts:564` |
| `index.ts:2722` | **Section** | `src/component-recipes.ts:1923` |

즉 "56개 계약 중 무엇을 채택할까"는 잘못된 질문 구조다. **정답은 이미 저자들이 적어
뒀다 — 19개 자리가 명시적으로 "임시 다리"라고 스스로 선언했다.** 이 문서가 답할 질문은
"이 19개 중 무엇을 먼저 실제 import로 바꾸면 결함이 줄어드는가"이다.

`expansion-roadmap.md`의 "공개 배치 → 현재 실제 앱에서 검증 중" 절은 Button/Field/Surface/
IconButton/Badge/CounterBadge/SegmentedControl/Tabs/SearchField/Checkbox 계열/List/ListRow/
Divider/Section/Notice/EmptyState/Skeleton/Sheet/Dialog/Toast/BottomCTA/TopBar/Select/Combobox
**약 24개**를 나열하지만, 실측하면 그중 진짜로 import되는 것은 Button·Field·Surface·
SegmentedControl 넷뿐이다(위 표). 나머지는 hjm 쪽 테스트가 app-rn 모양을 본떠 검증한
것이지, app-rn이 실제로 그 코드를 쓰고 있다는 뜻이 아니다. 이 간극 자체가
`expansion-roadmap.md`가 이미 경고한 실수("네 문서가 존재하지 않는 화면을 후보로
적어 뒀다")와 같은 모양이라 별도로 적어 둔다 — 다음 저자가 로드맵 문구만 보고
"이미 검증됐다"로 오해하지 않도록.

## 1. 1순위 결함 계열 — 지금은 채택할 계약이 없다 (설계 중)

확산 1위(§9, 「상태가 화면 크롬을 삼킨다」, 6화면+라우트 7개, `bugs.md:295-303,355-358`)와
7위(§6, 「구역 실패를 화면 전체로 그린다」, 3화면, `designer-brief.md:82-84`)는 **같은
원인**이다: app-rn은 `AppStateView`(화면 전체)와 `AppStateRegion`(구역)을 구별하는데
(`DESIGN_SYSTEM.md:184-188`), **hjm 카탈로그에는 이 축이 없다.** `Result`(`catalog.ts`의
`status: "planned"`)를 이 축으로 흡수할 수 있는지는 이미 조사됐고 결론은 "흡수 아님"이다
— `docs/promotion-candidates.md`의 "후속 판정 완료" 절: Result의 실제 문제(행동 뒤 flow
terminus)는 두 제품 어디에도 없고, 두 제품이 실제로 가르는 축은 "실패가 화면 전체를
막는가 구역만 막는가"라는 **제3의 축**이며 Result의 `status`에도 EmptyState의 tone에도
없다.

**그러니 이 두 계열은 이번 「처음 셋」에 넣지 않는다.** 다른 저작자가 이 축을 설계
중이므로, 설계가 나오면 이 문서에서 확산 범위가 가장 넓은(6+7, 3화면) 최우선 후보가
된다. 지금 고르는 셋은 **이미 있는 계약 중에서** 고른 것이고, 이 축의 부재가 이번 선택이
결함 1·2위를 다루지 못하는 이유임을 여기 명시해 둔다 — 다음 사람이 "왜 가장 큰 결함이
채택 계획에 없나"를 다시 묻지 않도록.

## 2. 후보 평가

### 2.1 Statistic — 채택 권고 1순위

- **인용**: app-rn `lib/theme/index.ts:2404`("Temporary v0.1 bridge matching the
  renderer-neutral HJM v0.2 Statistic recipe exactly")부터 `index.ts:2405-2469`까지가
  `statisticRecipe` 전체 재구현이고, `components/ui/statistic-renderer-contract.ts:1-9`가
  거기서 `resolveStatisticDescriptor`, `statisticTrendMarks`, `validateStatisticGroup`을
  가져다 쓴다. hjm 쪽 원본은 `src/statistic.ts:16-131`(`StatisticDescriptor`,
  `validateStatisticDescriptor`, `resolveStatisticDescriptor`, `statisticTrendMarks`) +
  `src/component-recipes.ts:1428`(`statisticRecipe`, 슬롯·밀도·톤).
- **지금 자체 코드가 하는 일**: label/value/prefix/suffix/hint/trend를 가진 통계 카드
  하나(`AppStatistic`, `components/ui/AppStatistic.tsx:37-97`)와 그룹(`AppStatisticGroup`,
  `:150-190`)을 렌더링한다. 실사용처는 `home/HomeScreen.tsx:262`(관심 선수 행의 보조
  통계), `player-explorer/PlayerExplorerScreen.tsx:953`, `fa/FaCenterScreen.tsx:424`(FA
  카드의 3열 주요 기록, `columns={fontScale >= 1.6 ? 1 : 3}`)이다. 이 셋은 label/value
  전용이거나 hint까지만 쓰고, 실측 범위 안에서 trend를 함께 쓰는 자리는 못 찾았다.
- **채택 비용**: `resolveStatisticDescriptor`·`validateStatisticGroup`·
  `statisticTrendMarks`·디스크립터 타입은 hjm 쪽과 이미 필드 단위로 동일하다(같은 이름,
  같은 옵셔널 구조 — `statistic.ts:16-25` vs `AppStatisticProps` 정의). **열 수 계산
  (`resolveStatisticColumnCount`, `statistic-renderer-contract.ts:65-` 부근, `fontScale`
  기반 단조 축소)은 hjm `statistic.ts`에 아예 없다** — 의도적으로 없다. hjm
  `src/design-system-provider.ts:11-18`가 "`description-list.ts`'s local `fontScale`
  clamp, which is that one component's own layout math"라고 명시하듯, 배율 반응형 레이아웃
  계산은 공용 계약이 아니라 렌더러 몫으로 hjm 스스로 설계했다. 그래서 채택은 **디스크립터
  검증·트렌드 마크만 hjm import로 바꾸고, 열 수 계산은 그대로 app-rn 소유로 남기는** 부분
  치환이다 — 배율 회귀를 재도입할 위험이 없다.
- **채택하면 사라지는 결함**: `review.md:36`의 반복 패턴 2("기준이 다른 두 수를 `·`로
  잇는다", §8, 5화면 — `designer-brief.md:85-86`이 원문 지목한 곳은 홈·랭킹·FA)와
  `reviews/history.md:106`의 D-4("커리어 최고·최저의 모집단이 규정 출장 시즌인데 캡션이
  그 말을 하지 않고 기준이 다른 세 수를 `·`로 이었다")가 이 계열이다. **다만 이건
  조건부다** — 지금 그 자리들(홈의 순위 카드, 랭킹, FA 요약 캡션, 커리어 곡선)은
  `AppStatistic`을 쓰지 않고 손으로 만든 캡션 문자열이다. `AppStatistic`을 채택하는
  것 자체가 이 결함을 지우지 않는다 — **label/hint/trend가 독립된 필드인 컴포넌트로
  그 캡션들을 옮겨야** "두 비교를 한 문자열에 이어붙이는" 실수 자체가 구조적으로
  불가능해진다(hint와 trend가 애초에 다른 슬롯이라 하나로 뭉칠 수 없다). 그러므로 이
  채택의 값은 "지금 바로 결함이 줄어든다"가 아니라 "계약을 정리해 두면 다음 리팩터가
  그 자리들을 옮길 때 같은 실수를 구조적으로 막는다"는 것이다 — 정직하게 조건부로
  적는다.

### 2.2 Icon — 채택 권고 2순위

- **인용**: app-rn `lib/theme/icon.ts:9-53`의 `semanticIconNames` 42개 배열이 hjm
  `src/icon.ts:9-53`의 배열과 **순서까지 완전히 동일하다**(직접 대조 완료, 한 글자도
  다르지 않다). `index.ts:102`("Temporary v0.1 bridge matching the renderer-neutral HJM
  v0.2 Icon recipe exactly")가 `iconRecipe`를 다시 선언한다.
- **지금 자체 코드가 하는 일**: `components/ui/AppIcon.tsx`가 `lucide-react-native`
  글리프를 이 42개 semantic name에 매핑해 모든 화면에 공급한다(`design-boundary.test.ts`의
  `LUCIDE_VALUE_IMPORT_BASELINE`이 이 매핑의 유일한 창구임을 강제).
- **채택 비용**: 사실상 0에 가깝다 — 배열이 이미 완전히 같으므로 `export` 문 하나를
  `@hjm/design-system`으로 바꾸는 문제다. `expansion-roadmap.md`의 Icon 절
  ("Yajalal Statistic trend mark에서 같은 semantic registry·tone·size·stroke·RTL 계약을
  실제 renderer로 검증했다")이 이미 이 정확한 이름 목록을 기준으로 hjm 쪽 beta 승격
  근거를 삼았다 — 즉 hjm 저자가 검증에 쓴 "실제 renderer"가 바로 이 앱의 모양이다.
- **채택하면 사라지는 결함**: 이번 라운드에서 아이콘 자체를 지목한 결함은 **찾지
  못했다**(`bugs.md`·`reviews/*.md` 전체에서 "아이콘"·"Icon" 검색 시 §6 인용문 하나뿐).
  그래서 이 후보는 defect-fix가 아니라 **예방/중복 제거** 근거로 든다 — 두 저장소가
  독립적으로 42개 이름을 유지하면 한쪽만 늘어나는 순간(`ai`처럼 이미 있는 이름 옆에
  다른 이름으로 같은 개념을 또 추가하는 식) §8 「같은 개념에는 하나의 단어」와 같은
  모양의 아이콘판 분열이 생긴다. 지금은 그 분열이 **없다**(완전 동일)는 것이 이 채택의
  가장 싼 창(window)이다 — 나중에 둘이 갈라진 뒤 합치는 것보다 지금 합치는 비용이 확실히
  낮다.

### 2.3 List / ListRow / Section / Divider — 채택 권고 3순위 (묶음)

- **인용**: `index.ts:2595`(Divider), `2675`(List), `2687`(ListRow), `2722`(Section) 네
  자리가 연달아 "Temporary v0.1 bridge … recipe exactly"로 표시돼 있다. hjm 원본은
  `component-recipes.ts:539`(divider), `551`(list), `564`(listRow), `1923`(section).
- **지금 자체 코드가 하는 일**: `AppList`/`AppListRow`/`AppSection`/`AppDivider`가 앱
  전체 화면 구조의 뼈대다 — `design-boundary.test.ts`의 `RAW_TEXT_BASELINE`만 봐도
  `AppListRow.tsx`·`AppSection` 계열이 거의 모든 화면 파일에서 참조된다.
- **채택 비용**: 이 넷은 **행동을 전혀 갖지 않는 순수 시각 레시피**다(색·간격·radius·
  최소 높이·구분선 유무) — `ListRow`의 press 처리, 스프레드 안전성, 인터랙션 여부는
  `AppListRow.tsx`/`design-boundary.test.ts`의 `appListRow`/`appLinkedListRowForbiddenProps`
  감사가 이미 별도로 강제하고 있고 그 로직은 레시피 교체와 무관하게 그대로 app-rn에
  남는다. 즉 이 셋(List/ListRow/Section/Divider)의 recipe만 hjm import로 바꾸는 것은
  **행동 회귀 위험이 없는, 가장 안전한 범주의 채택**이다. `ListRow`의
  `states.selectedBackground: themeColor("surfaceAccent")`(`index.ts:2698`)는 §6이 요구한
  대로 선택 상태 전용으로 이미 올바르게 쓰이고 있어(로컬 재구현이 hjm 계약과 어긋나는
  자리를 찾지 못했다), 치환이 시각적 회귀를 낼 가능성도 낮다.
- **채택하면 사라지는 결함**: **이번 라운드에서 List/ListRow/Section/Divider의 레시피
  자체를 지목한 결함은 없다.** 이 셋도 Icon과 같은 이유로 든다 — defect-fix가 아니라
  **가장 넓은 중복 표면을 가장 싼 값에 줄이는** 근거다. 다만 Icon과 달리 이름 목록이
  완전히 같다는 확증은 못 했다(레시피 필드 형태는 대응되지만 `listRowRecipe`의
  `density.compact.oneLineMinHeight: sharedControl.minTouchTarget` 같은 자리는 이미
  공용 토큰을 참조해 hjm 쪽과 자연히 맞물려 있다는 정황일 뿐, 필드 단위 완전 대조는
  하지 않았다) — 그래서 3순위로 낮춘다.

### 2.4 함정을 확인한 자리 — 채택하지 않는 이유를 적는다

- **Tag / AppBadge** — `docs/promotion-candidates.md`가 "승격 가능"으로 이미 실측한
  후보(`FaCenterScreen.tsx:270,369`)이고 이름 문제도 없다(팀 지적대로 `AppBadge`는
  실제로 `Tag`의 문제를 푼다). 그런데 이번 조사에서 **AppBadge의 `tone="brand"`가
  26개 파일에 흩어져 있는 것을 발견**하고(`grep`으로 확인, 예:
  `features/lineup/LineupScreen.tsx:466`, `features/ai/AiAnalysisScreen.tsx:516`,
  `features/live/LiveScreen.tsx:792,820`) §6 위반(선택 아닌 정적 라벨이 브랜드 틴트를
  입는 것)을 의심했으나, `index.ts:2284-2290`의 주석이 이미 그 교훈을 반영해 뒀다 —
  `brand` 톤의 `background`는 `surfaceAlt`(중립)이고 `content`만 브랜드색이다("The brand
  tint now means 'selected' everywhere, so a badge that only labels something … cannot
  wear it"). **즉 의심한 결함은 이미 로컬에서 고쳐져 있다.** Tag 계약을 채택해도
  지금 없는 결함을 지울 수 없으므로 이번 셋에서 뺀다.
- **Chip** — `reviews/overall-onboarding.md:59-60`에 실제 결함이 있다
  (`OverallScreen.tsx:256-278`가 순수 요약 칩 줄에 `selectionMode="single"`을 넘겨
  `accessibilityRole="radio"`+`surfaceAccent` 선택 면을 입힌다, §6 위반). 그러나 이건
  **호출부가 계약을 잘못 쓴 것**이지 `AppChip`/`chipRecipe`(`index.ts:2002`)의 결함이
  아니다 — hjm의 `Chip` 계약을 채택해도 호출부가 여전히 `selectionMode="single"`을
  잘못 넘기면 같은 결함이 재현된다. 채택 후보가 아니라 **개발자에게 넘길 화면 버그**다.
- **Result** — `docs/promotion-candidates.md`의 "후속 판정 완료" 절이 이미 "흡수 아님"
  으로 답했다(위 §1 참고). 채택 후보 아님.
- **DataTable** — `catalog.ts`에 `platform: "web"`으로 고정돼 있어 RN 앱인 app-rn에는
  애초에 대상이 아니다. `StatTable`/`StandingsTable`의 배율 버그
  (`reviews/live-standings.md:53-57`의 D-7 — 계약이 계산한 `columnScale`을 렌더러가
  한 번도 읽지 않는 버그)는 app-rn 자체 계약(`stat-table-contract.ts`,
  `standings-table-contract.ts`)의 배선 문제이지 hjm 승격으로 풀리는 문제가 아니다.
- **Carousel** — `docs/promotion-candidates.md`가 이미 "보류"로 하향 조정했다(필수
  계약인 previous/next·dot·`inert`·adjustable 접근성이 `HomeGameCarousel`에 전혀 없다).
  같은 결론을 유지한다.

## 3. 결론 — 처음 셋

| 순위 | 후보 | 결함 연결 | 비용 | 비고 |
|---|---|---|---|---|
| 1 | **Statistic** | §8 반복 패턴 2(5화면) — 조건부: 계약 채택 자체가 아니라 호출부 이전까지 마쳐야 닫힌다 | 낮음(디스크립터·검증·트렌드 마크만 교체, 배율 계산은 로컬 유지) | 이미 `index.ts:2404`에 "temporary" 명시 |
| 2 | **Icon** | 없음(예방/중복 제거) | 사실상 0(이름 목록 완전 동일) | hjm이 이미 이 앱 모양으로 beta 검증을 마쳤다고 주장(`expansion-roadmap.md`) — 검증 근거를 실제로 확인하려면 import 자체가 필요 |
| 3 | **List/ListRow/Section/Divider** | 없음(예방/중복 제거, 가장 넓은 표면) | 낮음(행동 없는 순수 레시피, 기존 행동 계약과 분리돼 있음) | `selectedBackground` 등 §6 규칙과 이미 정합적이라 회귀 위험 낮음 |

우선순위는 확산 범위보다 **비용과 회귀 위험**으로 갈랐다 — 이번 조사의 결론은 지금
당장 defect count를 줄이는 채택이 하나(Statistic, 그것도 조건부)뿐이라는 것이었고,
그래서 나머지 둘은 "결함을 지운다"가 아니라 "이미 저자 스스로 임시라고 적어 둔 19개
다리 중, 지금 합쳐도 안전하고 나중에 갈라지면 비싸지는 것부터 닫는다"는 다른 기준으로
골랐다. §1의 상태 축이 설계되면 그것이 이 표의 1순위를 대체해야 한다.

## 4. 게이트

`cd /Users/jimin/Desktop/hjm-design-system && pnpm typecheck && pnpm test` — 이 문서
하나만 추가했고 `src/`·`test/`·공유 파일, app-rn·BurnTok 어느 파일도 고치지 않았다.
`pnpm build`는 실행하지 않았다.
