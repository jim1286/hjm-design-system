# Progress contract

## circular shape (2026-09-18)

같은 값을 원으로 그리는 변형을 `shape: "linear" | "circular"`로 추가했다.

**왜 새 컴포넌트가 아닌가.** 의미가 완전히 같다 — min/max/now, 값 없는 진행,
발표 문구, tone이 전부 공유된다. 따로 만들면 "어느 쪽이 접근성 계약을 갖는가"가 둘로
갈리고, 한쪽만 고쳐지는 날이 온다. Diairy가 `ProgressRing`을 직접 만든 자리이고, 그때
필요했던 값이 지름과 획 두께 둘이라 `circular.sizes`·`circular.strokeWidth`만 더했다.

**Web**은 conic-gradient + mask로 그리고 `<progress>` 요소는 그대로 둔다 — 값과 발표는
변하지 않고 칠하는 방식만 다르다. 링은 `aria-hidden`이다.

**Native**는 conic gradient가 없어 회전한 반링으로 그린다. 그림을 위해 의존성을 들이지
않는다 — 값은 wrapper가 발표하므로 이 도형은 장식이다.
