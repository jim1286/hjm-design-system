# Affix — 계약을 만들지 않는다

## 문제로 제기된 것

Ant Design `Affix`는 스크롤이 특정 지점을 지나면 임의 요소를 화면에 고정합니다. 검토
관찰은 두 가지였습니다 — `TopBar`가 이미 있고(`src/layout.ts:9`, RN `native`, beta), Web
CSS `position: sticky`가 대부분을 푼다면, 이것이 컴포넌트인지 아니면 레이아웃 기법인지
확인하라는 것과, `docs/expansion-roadmap.md`의 `Stack` 판정("반복되는 내부 flex를 감싸는
것만으로 제품 의미나 접근성 계약이 생기지 않는다")이 그대로 적용될 가능성이 높다는
것이었습니다.

## 판정: 만들지 않는다

### 1. 관찰된 모든 실사용은 이미 다른 컴포넌트나 CSS 한 줄이 소유한다

- **BurnTok** 웹 헤더(`apps/web/src/app/page.tsx:118`, `messages/page.tsx:27`,
  `u/[id]/ProfileClient.tsx:80`, `c/[id]/StoryClient.tsx:287`,
  `notifications/page.tsx:44`)는 모두 `<header className="sticky top-0 ...">`로 상단바를
  고정합니다. 이는 정확히 `TopBar`의 자리이고, `position: sticky` 한 줄로 끝나는
  문제입니다 — 스크롤 진행률 계산, 고정 해제 조건 분기, 별도 controlled 상태 없이 CSS가
  전부 해결합니다.
- **Yajalal RN**에도 이미 `TopBar` 구현(`modules/app-rn/src/components/ui/AppTopBar.tsx`)이
  있습니다. Native는애초에 헤더가 화면 최상단에 고정 마운트되는 것이 기본값이라
  "스크롤 임계값을 지나면 고정"이라는 Affix 특유의 조건 자체가 성립하지 않습니다.
- 그 외 "고정" 관련 코드는 각 컴포넌트가 이미 소유한 문제입니다: `StatTable`의 첫 열
  고정(`stickyFirstColumn`, `stat-table-contract.ts:23`)은 표 내부 anatomy이고,
  `BottomCTA`의 하단 고정 영역(`AppBottomCTA.tsx:39` "Safe-area-aware sticky action
  area")은 이미 별도 컴포넌트로 계약돼 있습니다. 둘 다 "임의 요소를 고정하는 범용
  wrapper"를 필요로 하지 않습니다.

### 2. 임의 콘텐츠를 고정하는 범용 요구 자체가 관측되지 않는다

antd `Affix`의 핵심 사용법 — 헤더도 테이블도 아닌 **임의 콘텐츠**(플로팅 목차, 사이드
액션 카드 등)를 스크롤 중간에 고정 — 는 두 제품 어디에도 없습니다. 있는 모든 "고정"
사례는 위처럼 헤더(TopBar) 아니면 특정 컴포넌트 내부 anatomy(StatTable, BottomCTA)로
이미 이름이 있습니다.

### 3. 계약할 상태 축이 없다

Affix가 컴포넌트가 되려면 "Web과 Native가 각자 다른 기법으로 같은 결과를 낸다"는 공유
semantic이 있어야 합니다(`docs/architecture.md`의 `adaptive` 정의). 그런데 Web은 CSS
`position: sticky`(레이아웃 엔진이 처리, JS 상태 없음), Native는 애초에 스크롤에 따라
고정/해제되는 개념 자체가 드뭅니다(헤더는 기본 고정, 그 외에는 `stickyHeaderIndices`처럼
리스트 컴포넌트가 소유). 이는 `docs/virtual-list.md`가 항목 높이 추정을 판정한 것과 같은
모양입니다 — 이름도 단위도 의미도 대응하지 않는 렌더러 힌트일 뿐, 공유할 사용자 의미가
없습니다.

`Stack`의 판정과 같은 자리입니다: 반복되는 CSS 속성 하나를 감싸는 것만으로 제품 의미나
접근성 계약이 생기지 않습니다.

## 만들지 않은 것

`src/affix.ts`, `test/affix.test.ts`는 없습니다. `componentCatalog`의
`{ name: "Affix", category: "utility", platform: "web", status: "planned" }` 행과
crosswalk의 `Affix → Affix` direct 관계(`src/component-references.ts:125`)는 건드리지
않습니다.

## 뒤집힐 조건

1. 헤더도 테이블도 CTA도 아닌 **임의 콘텐츠**를 스크롤 중간 지점부터 고정해야 하는 실제
   화면(예: 긴 폼 옆의 플로팅 요약 카드)이 두 제품 중 하나에 나타난다.
2. 그 화면에서 CSS `position: sticky`만으로 부족한 요구(예: 여러 sticky 요소의 겹침
   순서 조정, 고정 해제 시점의 접근성 발표)가 측정된다.
