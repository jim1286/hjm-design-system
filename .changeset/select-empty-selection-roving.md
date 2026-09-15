---
"@hjmds/react": patch
---

Select의 빈 선택 항목에서 화살표 키가 움직이지 못하던 문제를 고친다.

`disallowEmptySelection: false` · `loop: false`(둘 다 `selectBehaviorDefaults`)에서 선택이
없으면 roving `aria-activedescendant`가 빈 선택 항목에서 시작하는데, 그 항목이 목록 끝에
그려져 있고 `moveHighlight`가 `next`를 `loop`가 켜진 경우에만 허용했다. 결과적으로 기본값을
쓰는 모든 Select에서 목록을 연 키보드 사용자는 `Home`을 먼저 눌러야 선택을 시작할 수 있었다
(에어리 웹 "받을 도시 선택", 2026-09-12 접근성 검수).

- 빈 선택 항목을 listbox의 **첫** entry로 그린다. 선택이 없을 때 활성 항목이 시작하는
  자리이므로, 목록 맨 아래는 화살표 이동의 출발점이 될 수 없다.
- `moveHighlight`가 그 DOM 순서를 따른다: `Home`은 빈 선택, `End`는 마지막 실제 항목,
  빈 선택에서 `ArrowDown`은 `loop`와 무관하게 첫 항목, 첫 항목에서 `ArrowUp`은 빈 선택이다.
  `loop`는 목록의 양 끝을 잇는 역할만 한다(빈 선택에서 위 → 마지막 항목, 마지막 항목에서
  아래 → 빈 선택).
- 닫힌 상태에서 키로 열 때도 같다. `End`/`ArrowUp`은 마지막 실제 항목을 집는다.

**Migration.** 마우스 사용자에게는 "선택 안 함" 항목의 위치가 목록 끝에서 시작으로 바뀐다.
option을 위치(`querySelector('[role="option"]')`)로 집는 테스트는 빈 선택 항목을
(`.hjm-select__option--empty`) 먼저 만난다.

react-native renderer는 빈 선택 항목을 그리지 않고 roving 키보드 탐색도 없어 이번 변경에
포함되지 않는다.
