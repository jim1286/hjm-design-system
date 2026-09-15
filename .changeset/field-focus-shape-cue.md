---
"@hjmds/react": patch
---

Field·TextArea의 포커스 표시가 색조에만 기대던 문제를 고친다.

포커스 링을 1px에서 계약된 2px(`focusIndicatorContract.width`)로 넓힌다. 표시 자체의 대비는
원래 기준을 넘었지만(칸 배경 대비 낮 6.86:1 · 밤 7.98:1), **상태가 바뀐 것을 알아채는 단서**가
색조뿐이었다 — 비포커스↔포커스 테두리 명도 대비는 낮 1.06:1, 밤 1.44:1이라 회색조에서는 두
상태가 사실상 같은 그림이다. 밤에는 `rgb(203,213,225)` → `rgb(56,189,248)`로 바뀌며 칸 배경
대비가 11.51에서 7.98로 오히려 떨어진다(에어리 웹 편지 편집기, 2026-09-13 접근성 검수).

같은 화면의 다른 컨트롤은 없던 2px outline이 생기는 방식이라 단서가 형태였다. 가장 오래
머무는 입력 칸만 예외였다. WCAG 1.4.1(색에만 의존하지 않기) 관점의 문제다.

`.hjm-field__control`을 쓰는 모든 표면(TextField·TextArea·SearchField·PasswordField·
NumberField·Select trigger·Combobox)이 같은 규칙을 공유하므로 링은 함께 넓어진다. 링은
box-shadow라 레이아웃을 밀지 않는다.

react-native renderer는 필드 포커스 테두리를 그리지 않아(OS가 처리) 이번 변경 대상이 아니다.
