# Grid, Flex, Space, Masonry — 계약을 만들지 않는다

## 제약

`docs/architecture.md`가 이미 `Stack`에 대해 이 판정을 내려 뒀다:

> Stack은 반복되는 내부 flex를 감싸는 것만으로 제품 의미나 접근성 계약이 생기지
> 않으므로 실제 paired layout 요구가 나타날 때까지 planned recipe 이상으로
> 공개하지 않는다.

이 문서는 그 판정을 뒤집지 않는다. `Grid`·`Flex`·`Space`·`Masonry` 네 개가 각각
`Stack`과 같은 부류(개발자가 flex/grid를 덜 쓰려는 편의 래퍼)인지, 아니면 실제로
제품 의미나 접근성 계약을 갖는지를 하나씩 판정한다. 네 개를 한 문서에 모은
이유는 넷 다 같은 결론(계약 없음)이라 개별 문서 여섯 개보다 판정 논리를 한
자리에서 비교하는 것이 다음 사람에게 더 유용하기 때문이다 — `Layout`과
`Splitter`는 반대 결론이라 각자 문서(`docs/layout.md`, `docs/splitter.md`)에
남겼다.

판정 기준은 셋이다: (1) 제품 의미가 생기는가 (2) 접근성 계약이 생기는가 (3)
플랫폼 번역이 성립하는가(Web과 Native가 각자 다른 기법으로 같은 결과를 내는
공유 semantic이 있는가).

## Flex — Stack과 사실상 같은 문제

antd `Flex`의 표면(`gap`, `vertical`/방향, `align`, `justify`, `wrap`)은 이미
`stackRecipe`(`src/component-recipes.ts`)의 `axis`/`gap`/`align`/`justify`/`wrap`과
거의 1:1로 겹친다. 이것은 "비슷한 컴포넌트"가 아니라 **같은 문제를 두 번 계약할
뻔한 자리**다 — Dropdown이 Menu와 같은 문제였던 것과 같은 종류의 중복
(`docs/dropdown.md`).

1. 제품 의미: 없다. flex 컨테이너라는 사실 자체가 사용자에게 전달하는 뜻이
   없다 — Stack과 동일한 판정.
2. 접근성 계약: 없다. DOM 순서가 시각 순서와 일치하는 한 스크린 리더는 flex
   컨테이너 유무를 신경 쓰지 않는다.
3. 플랫폼 번역: Web flexbox와 RN flexbox는 애초에 같은 모델이라 "적응"이 필요
   없다 — 이것도 Stack의 결론과 같다.

**결론**: 별도 계약을 만들지 않는다. catalog의 `Flex` row는 리드 판단으로
`Stack`의 alias로 흡수하거나(Dropdown→Menu와 같은 처리), 최소한 이 문서를
연결해 "Stack과 같은 판정"임을 표시한다.

## Space — Stack + 선택적 구분선

antd `Space`(alias 후보 `Inline`)는 Stack과 같은 gap 래퍼에 항목 사이 구분선을
자동으로 넣는 기능(`split`)이 더해진 것이다. 그런데 구분선은 이미
`Divider`(beta, `dividerRecipe`)로 존재한다 — Space가 하는 일은 "Stack처럼
배치하고 그 사이에 이미 있는 Divider를 자동으로 끼워 넣는다"는 조합 편의이지,
새 상태 축이나 새 접근성 개념이 아니다.

1. 제품 의미: 없다 — Stack과 동일.
2. 접근성 계약: 없다. 구분선은 `Divider`가 이미 `aria-hidden` 등 자기 계약을
   갖고 있고, Space가 그 위에 새로 얹을 규칙이 없다.
3. 플랫폼 번역: Stack과 동일하게 성립하지 않을 이유가 없지만, 성립 여부를
   가를 만한 고유 표면 자체가 없다.

**결론**: 별도 계약을 만들지 않는다. `Space`는 Flex보다는 구분선 삽입이라는
실제 차이가 있어 Stack의 단순 alias로 흡수하자고 권하지는 않는다 — catalog
row(`aliases: ["Inline"]`)는 이름 자리로 남기고 이 문서를 연결한다.

## Grid — 2차원 flex일 뿐, 데이터 그리드가 아니다

antd `Grid`(Row/Col 24열 시스템)는 임의 콘텐츠를 반응형으로 배열하는 문제다.
DataTable(이미 계약됨, `docs/data-table.md`)이 이미 "행/열이 있는 데이터"의
계약을 소유하므로 이름이 겹치는 걱정은 없다 — `Grid`는 순수 레이아웃이다.

1. 제품 의미: 없다. 카드 여러 개를 2차원으로 배열한다는 사실 자체는 사용자에게
   전달되는 뜻이 없다 — 1차원이냐 2차원이냐만 다를 뿐 Stack과 같은 판정이다.
2. 접근성 계약: 없다. CSS Grid는 시각 배치만 바꾸고 DOM 순서(=낭독 순서)는
   그대로다 — 그리드라서 새로 필요한 규칙이 없다.
3. 플랫폼 번역: Web CSS Grid와 RN flexWrap 기반 근사는 같은 이름의 파라미터로
   반응하지 않는다 — `docs/virtual-list.md`가 windowing 파라미터에 대해 내린
   판정("각 플랫폼 렌더링 엔진이 내부적으로 요구하는 힌트일 뿐, 공유할 semantic이
   없다")과 같다.

**결론**: 별도 계약을 만들지 않는다. catalog row는 그대로 두고 이 문서를
연결한다.

## Masonry — 순수 렌더링 알고리즘, 공유 semantic이 없다

Masonry(폭포수형 그리드)는 넷 중 유일하게 실제 구현 난이도가 있다(항목 높이를
측정해 가장 짧은 열에 배치). 하지만 판정 기준은 난이도가 아니라 사용자 의미와
접근성 계약이다.

1. 제품 의미: 없다. 어떤 배치 알고리즘을 쓰든 콘텐츠의 뜻은 바뀌지 않는다.
2. 접근성 계약: 없다. 시각 위치와 무관하게 낭독 순서는 논리적 DOM 순서를
   따라야 한다는 규칙은 Masonry 전용이 아니라 모든 레이아웃에 적용되는 일반
   원칙이다.
3. 플랫폼 번역: **넷 중 가장 강하게 성립하지 않는다.** Web은 CSS
   `grid-template-rows: masonry`(실험적) 또는 JS 컬럼 패킹을, RN은 순수 JS
   측정 기반 패킹을 쓴다 — 이름도 파라미터도 공유하지 않는 각 플랫폼의 렌더링
   기법이다. `docs/virtual-list.md`의 windowing 판정과 정확히 같은 이유로
   공유할 semantic 자체가 없다.

**결론**: 별도 계약을 만들지 않는다. catalog row는 그대로 두고 이 문서를
연결한다.

## 뒤집힐 조건

다음 중 하나가 실제로 측정되면 해당 항목만 다시 연다 — 넷을 하나의 판정 세트로
묶었다고 해서 항상 함께 뒤집히는 것은 아니다.

- **Flex/Space**: Stack이 먼저 `planned recipe`를 넘어 실제 접근성 계약이
  필요한 vertical slice를 얻는다면(`docs/architecture.md`가 예고한 "실제
  paired layout 요구"), 그 계약이 Flex/Space에도 적용되는지 함께 재검토한다.
- **Grid**: 반응형 카드 그리드에서 키보드 탐색 순서나 포커스 규칙이 시각
  순서와 어긋나는 실제 버그가 여러 제품에서 반복 측정되면, "탐색 순서 계약"이라는
  새 축이 성립하는지 연다.
- **Masonry**: Web과 Native 렌더러가 같은 이름의 패킹 파라미터로 검증 가능한
  공유 semantic을 갖게 되거나(가능성 낮음), 스크린 리더 낭독 순서 문제가
  Masonry에서만 특이하게 발생하는 실측 사례가 나오면 재검토한다.

## 배선 명세 제안 (리드 적용)

- `Flex`: `Stack`의 alias로 흡수 권고(Dropdown→Menu 선례) — `{ name: "Stack",
  ..., aliases: ["Flex"] }`로 합치고 별도 `Flex` row 제거. 대안: catalog row를
  그대로 두고 이 문서만 연결.
- `Space`, `Grid`, `Masonry`: catalog row를 그대로 두고(`status: "planned"`
  유지, recipe/behavior 없음), 이 문서를 참고 링크로만 연결한다.
