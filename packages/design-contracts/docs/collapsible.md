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

## Renderer evidence

- Web keyboard proof tabs to the native button, toggles with Enter, then closes with Space;
  it checks `aria-expanded`, the controlled region relationship, and that closed content leaves
  the tree. The narrow long-copy case places a long unbroken label in the trigger to verify that
  disclosure chrome does not widen its container.
- Native renderer tests inspect the `button` role and expanded state, invoke the rendered
  `Pressable` action, and verify that opening and closing adds and removes the content. This is
  host-renderer evidence; it does not claim physical keyboard, VoiceOver, or TalkBack verification.
- Native and Web long-copy fixtures put the long label in the trigger itself. The child body stays
  short so the scenario tests the constrained interactive label rather than arbitrary content.

## 프로필 도구의 표현

2026-10-07 테마 전환 시 입력이 사라지는 문제를 피하려고 `presentation="inline"`과 `keepMounted`를 추가했다.
inline은 트리거를 숨기고 항상 내용을 펼친다. 기본 disclosure는 기존 open/defaultOpen 규칙을 유지한다.
keepMounted가 있어도 닫힌 내용은 포커스·스크린리더·터치 대상에서 제외한다. 단순 read-only 내용은 기존 기본값을 쓴다.

## 제목과 준비 상태 (미게시 로컬 소스, 2026-10-20)

번뚝의 평가 패널은 정적 제목 옆에 펼치기 행동을 두고, 평가 중에는 같은 행동 자리에 로딩을 둔다. 제품마다 헤더·busy·접힘을 다시 조립하지 않도록 `title`과 `pendingLabel`을 기존 Collapsible에 연결했다.

- `title`은 trigger 밖에 있으므로 제목의 heading 의미와 행동의 접근성 이름을 각각 유지한다. 제목은 시작 쪽, 행동은 끝 쪽이며 최소 행동 영역은44다.
- `pendingLabel`이 있으면 한 개의 작은 Spinner가 trigger를 대신하고 본문은 보이지 않으며 root는 busy다. 완료 후 기존 펼침 상태를 사용하고 자동으로 펼치지 않는다.
- `keepMounted`는 준비 중에도 초안을 보존하며 hidden/접근성 제외를 유지한다. Web에서 준비 전환으로 초점이 있던 본문과 trigger가 사라지면 host로 복구한다. 외부 초점을 가져오지 않는다.
- 기존 제목 없는 trigger와 inline의 기본 동작은 유지한다. 이 추가 prop은 아직 게시 패키지 제공을 뜻하지 않는다.
