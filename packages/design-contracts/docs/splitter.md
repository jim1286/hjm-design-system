# Splitter contract

**문제.** 사용자가 두 영역의 경계를 드래그(또는 키보드)로 옮겨 상대적인 크기를
정한다 — 코드 편집기의 파일 트리/에디터 폭, 목록/상세 폭처럼 데스크톱 웹 레이아웃
패턴이다. antd `Splitter` → HJM `Splitter`(`src/component-references.ts`,
`relationship: "direct"`).

**판정 기준 통과 여부.**

- **제품 의미**: 있다. 경계를 옮기는 것은 사용자가 "이 화면을 지금 이렇게 나눠
  보겠다"는 명시적 의도이며, 값이 남는다(다시 방문했을 때 유지되길 기대한다) —
  Stack/Grid처럼 개발자가 flex를 덜 쓰려는 것과 다르다.
- **접근성 계약**: 있다. WAI-ARIA `separator` role은 이미 `aria-valuenow`/
  `aria-orientation`/키보드 리사이즈라는 실제 표준 패턴을 갖는다 — 계약을 새로
  발명하는 게 아니라 이미 있는 표준 하나를 HJM 어휘로 옮기는 일이다.
- **플랫폼 번역**: 성립하지 않는다 — 그리고 그것도 판정이다. 지속적으로 드래그
  가능한 분할 패널은 사실상 넓은 뷰포트/데스크톱 패턴이라 모바일 앱에 대응하는
  관습이 없다. 그래서 이 컴포넌트는 `platform: "web"`(catalog가 이미 그렇게
  분류해 뒀다)로 남긴다 — Native 계약을 만들지 않는다.

**일반화한 계약.**

- 사실 이 문제는 **"범위 안에서 숫자 하나를 고른다"**는, `NumberField`/`Slider`가
  이미 푼 문제와 같다(`docs/slider.md`가 이미 NumberField와 이 관계를 적어
  뒀다). 그래서 `SplitterDescriptor`는 새 숫자 판정을 만들지 않고
  `src/number-field.ts`의 `validateNumericRangeConfig`/`clampToRange`/`snapToStep`/
  `stepNumericValue`를 **그대로 호출**한다. `resolveSplitterDragValue`(드래그값
  스냅)와 `getNextSplitterValue`(키보드 스텝)는 둘 다 그 함수들의 얇은 래퍼일
  뿐이다.
- `axis`(`horizontal`/`vertical`, 패널이 나란한 방향)와 separator의
  `aria-orientation`은 **반대**다 — 나란히 있는(가로) 패널의 경계는 세로 막대다.
  `resolveSplitterSeparatorOrientation`이 이 반전을 한 곳에서만 계산해, 매
  renderer가 각자 다시 헷갈리지 않게 한다.
- `label`은 필수 접근성 이름이고, `valueText`는 Slider와 같은 이유로 선택
  사항이다 — 제품이 "35%"/"320px" 같은 포맷된 문자열을 줄 수도, 안 줄 수도
  있다(안 주면 raw 숫자로 발표).
- **넣지 않은 것**: 패널을 완전히 접어 숨기는 collapse 기능(antd의 collapsible
  화살표)과 분리선 여러 개(N-pane)를 이번 계약에 넣지 않았다. Collapse는 별도
  reveal affordance와 `min` 경계를 우회하는 예외 상태가 필요해 계약 표면을 거의
  두 배로 늘리고, N-pane은 값 하나가 아니라 정렬된 분리선 목록이 필요해 완전히
  다른 자료구조가 된다. 둘 다 측정된 요구가 없다 — Slider가 두 손잡이 `range`
  모드를 넣지 않은 것과 같은 판단이다.

**HJM 기본값.** Slider와 같은 "작은 손잡이, 큰 hit target" 문법을 재사용한다 —
보이는 선은 1px, 실제 드래그/포커스 가능 영역(`hitTarget`)은
`control.minTouchTarget`(44) 이상이다.

**플랫폼 번역.** Web만: `role="separator"` + `aria-orientation` + `aria-valuenow`/
`aria-valuemin`/`aria-valuemax`/(선택) `aria-valuetext`. 키보드는 Slider와 같은
어휘를 재사용한다 — 방향키 1 step, Home/End로 경계값 이동. Slider의
PageUp/PageDown(10배 이동)은 넣지 않았다 — 분할 패널 크기 조정은 그 정도로 큰
점프가 필요하다는 요구가 측정되지 않았다.

## Web renderer (2026-09-18)

`@hjmds/react/splitter`의 `Splitter`가 이 계약을 실행한다. catalog는 Web `beta`,
Native `unsupported`다. 제품 채택·보조기기 실측은 아직 없다.

- **드래그와 키보드가 같은 값을 만든다.** 둘 다 계약의 `resolveSplitterDragValue`/
  `getNextSplitterValue`를 호출하므로 renderer에 별도 숫자 산술이 없다.
- **방향은 논리 기준이다.** RTL에서는 primary pane이 오른쪽에서 자라므로 포인터 거리를
  그 가장자리에서 재고, 같은 반전을 방향키에도 적용한다(RTL에서 ArrowLeft가 increment).
  둘 중 하나만 뒤집으면 드래그와 키보드가 서로 반대로 움직인다.
- **pane 축이 아닌 방향키는 건드리지 않는다.** 가로 splitter의 위/아래 키는 pane 안
  콘텐츠의 것이다.
- **경계에서의 step은 settle이 아니다.** 값이 그대로면 `onValueChangeEnd`를 부르지 않는다 —
  크기를 저장하는 owner가 의미 없는 쓰기를 하지 않도록.
- 구현 중 실제 결함을 하나 잡았다: `onValueChangeEnd?.(commit(next))`는 handler가 없으면
  인자 평가까지 통째로 건너뛰어 키보드 조절이 조용히 죽는다. commit을 먼저 하고 알린다.
- 로컬 검증: `test/splitter.browser.test.tsx` 5개(separator 의미·수직 방향과 44px hit
  target, 방향키 step과 Home/End 경계, 드래그 스냅과 드래그당 1회 end, RTL 드래그·키보드,
  disabled)와 `Patterns/Splitter`.

**검증 화면.** 제품 vertical slice는 아직 없다. `beta`는 renderer 수준 증거를 뜻하며
실제 화면 채택은 별도로 기록한다.
