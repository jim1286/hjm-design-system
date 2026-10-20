# TimePicker

2026-10-19: 사용자가 승인한 통합 열 선택 디자인으로 독립 컴포넌트를 제공한다.
이 결정은 과거의 ‘Select 두 개로 충분하므로 새 renderer를 만들지 않는다’ 판단을 대체한다.
선택의창에서 날짜 선택 시트 안에 다시 시·분 Sheet가 열리는 실제 요구가 생겼고,
두 열의 초안·확정·취소와 접근성 이동을 제품별로 조립하지 않도록 HJM으로 옮겼다.

- 계약과 recipe: `src/time-picker.ts`. Web/RN: `@hjmds/react/time-picker`, `@hjmds/react-native/time-picker`.
- `presentation="field"`(기본): 필드 한 개 → Web Popover / Native Sheet 한 개. 두 열 선택은 초안이며 확인 버튼으로만 `onValueChange`한다. 닫기·Escape·바깥 누름·시트 dismiss는 확정하지 않는다.
- `presentation="inline"`: 같은 두 열을 기존 폼·시트 안에 표시한다. 최종 확인은 바깥 폼이 소유한다. 각 선택에서 완전하고 사용 가능한 값은 `HH:mm`, 미완성·선택 불가 초안은 `null`로 전달한다. 부모가 null을 반영해도 사용 중인 부분 선택은 유지한다.
- 값은 `HH:mm | null`, 날짜·시간대·서머타임·현재 시각 계산은 제품 소유. 자정 `00:00`도 유효하다.
- `minuteStep` 기본 1. 60의 양의 정수 약수만 허용한다. 기존 값이 간격과 맞지 않아도 자동 반올림하지 않는다.
- `isTimeUnavailable(time)`은 제품이 제공한다. 시는 사용 가능한 분이 하나라도 있으면 선택할 수 있다. 선택한 분을 몰래 바꾸지 않으며, 그 조합이 불가하면 확인할 수 없다.
- 외부 `value` 변경은 초안에 반영한다. 비활성·읽기 전용으로 전환하면 열린 선택기를 닫고 확정하지 않는다.
- Web: 열마다 roving focus, 방향키·Home·End가 비활성 항목을 건너뛰며 선택한다. Enter/Space는 버튼 기본 동작. Popover가 초점·Escape·바깥/blur dismiss·복귀를 소유한다.
- Native: 각 값은 이름·checked/disabled 상태를 가진 radio이며 host 활성화를 사용한다. Sheet가 back·dismiss·safe area·복귀를 소유한다. 실제 VoiceOver/TalkBack 기기 검증과 host action 검사는 구분한다.

기존 Collection/Select는 단일 선택으로 닫히는 계약이다. TimePicker는 그 wrapper가 아니라 두 부분을 한 번에 확정하는 세션이다. 목록 값과 공통 Popover/Sheet/Button을 재사용하며, 날짜 엔진이나 새 native peer를 추가하지 않는다.

디자인 모티브: [Ant Design](https://ant.design/components/time-picker/)의 통합 열·확정,
[Material 3](https://m3.material.io/components/time-pickers/)의 큰 시각 표시.
색·모서리·간격은 HJM recipe와 소비 제품의 semantic palette를 따른다.
