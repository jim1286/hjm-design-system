# Collapsible contract

**문제.** 접었다 펴는 한 덩어리. "더 보기", 필터 패널, 접히는 본문처럼 **이웃이 없는
disclosure**다.

**Accordion과 다른 것은 개수가 아니라 관계다.** Accordion의 항목들은 서로를 안다 —
하나를 열면 다른 것이 닫히는 정책, 항목 사이 구분선, 그룹 전체의 키보드 이동이 있다.
Collapsible에는 그 셋이 전부 없다. `items.length === 1`인 Accordion으로 대신하면 그룹
chrome이 따라오고 그걸 다시 CSS로 지우게 된다. 그래서 별도로 둔다 — 상태 어휘와 모션은
공유한다.

**닫힌 내용은 트리에서 뺀다.** 시각적으로만 숨기면 화면 리더와 브라우저 찾기가 그대로
도달한다. "접혀 있다"는 표시와 실제가 어긋나므로 renderer는 unmount한다. 애니메이션을
위해 남겨 두고 싶다면 그건 제품이 아니라 이 계약을 바꿀 일이다.

**trigger는 `aria-expanded`와 `aria-controls`를 함께 낸다.** 상태만 알리고 무엇이 열렸는지
가리키지 않으면 사용자는 방금 나타난 것을 찾아야 한다.

**Web·Native 공통.** 네이티브도 `button` role에 expanded 상태를 그대로 쓴다.
