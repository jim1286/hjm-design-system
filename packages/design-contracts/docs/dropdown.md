# Dropdown — 별도 컴포넌트를 만들지 않는다

## 판정

Ant Design에서 `Dropdown`은 "트리거에 붙는 오버레이"이고 그 안의 항목 목록은 별도
컴포넌트 `Menu`가 채운다. 두 컴포넌트가 나뉜 이유는 Ant Design의 Dropdown이 임의
콘텐츠(`dropdownRender`)도 담을 수 있는 범용 오버레이 셸이기 때문이다.

HJM에는 이 분리가 없다. `menuRecipe`(`src/component-recipes.ts:628`)의 anatomy는 이미
`trigger, content, viewport, section, sectionLabel, item, ...`이고, `behaviorRegistry.menu`
(`src/behaviors.ts:815`)는 `open`/`defaultOpen`/`onOpenChange`/`selection`/`asyncState`를
직접 controlled 축으로 가진다. 즉 HJM의 `Menu`는 이미 **트리거 + 떠 있는 표면 + 항목
목록**을 한 컴포넌트가 끝까지 소유한다. `expansion-roadmap.md`도 Menu를 "Web anchored
surface와 RN Sheet가 같은 결과를 만드는 adaptive 슬라이스"로 이미 beta 검증했다고
기록한다.

그래서 Ant Design 기준 "Dropdown"이 실제로 풀던 문제 — 트리거를 누르면 뜨는 action
목록 — 는 HJM에서 이미 `Menu` 하나로 완결된 문제다. 여기에 이름만 다른 `Dropdown`을
새로 만들면:

- `menuRecipe`와 거의 같은 `trigger`/`content`/`viewport` anatomy를 다시 선언하게 되고,
- `behaviorRegistry.menu`와 거의 같은 `open`/`dismiss`/`selection` 축을 다시 계약하게
  되어, 두 컴포넌트가 같은 상태를 서로 다른 이름으로 소유하는 정확히 그 실수(Tag가
  `docs/tag.md`에서 Chip의 `selected`와 별도 `closable` 축을 만들지 않기로 한 것과 같은
  종류의 실수)를 반복한다.

## 임의 콘텐츠 오버레이는 이미 다른 곳에 있다

**셋 중 2번 선택지 검토.** "Menu는 항목 collection만 다루고 Dropdown은 임의 콘텐츠를
담는 표면"이라는 분리가 가능한지 검토했다. 그런데 "트리거에 붙어 임의 콘텐츠를 보여
주는 Web 오버레이"는 이미 catalog에 `Popover`(`category: overlay`, `platform: web`,
`status: planned`)로 자리를 예약해 두었다. Ant Design의 crosswalk도 `Popover`를
`category: "data-display"`, `relationship: "direct"`로 이미 별도 target에 연결해 두었다
(`src/component-references.ts:102`). 즉 "임의 콘텐츠 담는 트리거 오버레이"라는 문제는
HJM 안에서 이미 `Popover`의 이름표를 달고 대기 중이다.

여기서 `Dropdown`을 "임의 콘텐츠"용으로 다시 정의하면 `Popover`와 완전히 같은 문제를
두 이름으로 계약하게 된다. 브리프가 명시한 대로 Popover와 Dropdown을 동시에 만들지
않기로 하고, 두 planned 항목 중 실제 제품에서 먼저 요구가 나오는 쪽만 계약한다. 지금은
어느 쪽도 vertical slice 근거가 없으므로 **아무것도 만들지 않는다.**

## 결론

1. Menu가 이미 트리거+표면+항목 목록의 문제를 완결한다 — antd Dropdown의 압도적 다수
   사용법("Dropdown + Menu" 조합)이 정확히 이 문제다.
2. Dropdown이 항목 목록이 아닌 임의 콘텐츠를 위한 것이라는 대안은 이미 `Popover`가
   점유한 문제와 구분되지 않는다.
3. 측정된 제품 수요 없이 겹치는 두 표면을 만들지 않는 것이 이 저장소의 원칙이다
   (`docs/authoring-brief.md`: "없는 컴포넌트를 만드는 것보다 안 만드는 이유를 남기는
   것이 이 저장소에 더 값지다").

`src/dropdown.ts`, `test/dropdown.test.ts`는 만들지 않는다. `antDesignReferenceComponents`의
`Dropdown → Dropdown` crosswalk(`relationship: "direct"`)도 바꿀 필요가 없다 — target
`ComponentId`는 유지하되, catalog의 실제 구현 결정만 아래로 옮긴다.

## 배선 명세 제안 (리드 적용)

두 가지 중 하나를 리드가 고른다. 이 저작자의 권고는 (a)다.

**(a) 권고: Menu의 alias로 흡수.**

```ts
{ name: "Menu", category: "navigation", platform: "adaptive", status: "beta",
  recipe: "menuRecipe", behavior: "menu", aliases: ["Dropdown"] }
```

기존 `{ name: "Dropdown", ... status: "planned" }` catalog row는 제거한다. Ant Design
crosswalk의 `Dropdown` source entry는 그대로 두되(같은 `Menu` target을 이미 가리키고
있어 변경이 필요 없다), Component Explorer의 "Dropdown" 검색은 `aliases`를 통해 Menu로
안내된다.

**(b) 대안: planned 유지 + 이유만 기록.** catalog row를 건드리지 않고 이 문서만 링크한다.
alias 흡수가 Component Explorer 표시 방식과 충돌하거나 추후 Menu가 collection 전용으로
좁아질 계획이 있다면 이 대안을 쓴다.

이 저작자 판단으로는 (a)가 맞다 — `aliases`는 이미 `FloatingActionButton: aliases:
["FloatButton", "FAB"]`처럼 "다른 생태계 이름으로 찾아와도 같은 HJM 컴포넌트로
안내한다"는 정확히 이 용도로 쓰이고 있다.
