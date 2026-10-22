# TimePicker

2026-10-19: 사용자가 승인한 통합 열 선택 디자인으로 독립 컴포넌트를 제공한다.
이 결정은 과거의 ‘Select 두 개로 충분하므로 새 renderer를 만들지 않는다’ 판단을 대체한다.
선택의창에서 날짜 선택 시트 안에 다시 시·분 Sheet가 열리는 실제 요구가 생겼고,
두 열의 초안·확정·취소와 접근성 이동을 제품별로 조립하지 않도록 HJM으로 옮겼다.

- 계약과 recipe: `src/time-picker.ts`. Web/RN: `@hjmds/react/time-picker`, `@hjmds/react-native/time-picker`.
- `presentation="field"`(기본): 필드 한 개 → Web Popover / Native Sheet 한 개. 두 열 선택은 초안이며 확인 버튼으로만 `onValueChange`한다. 닫기·Escape·바깥 누름·시트 dismiss는 확정하지 않는다.
- `presentation="inline"`: 같은 두 열을 기존 폼·시트 안에 표시한다. 최종 확인은 바깥 폼이 소유한다. 각 선택에서 완전하고 사용 가능한 값은 `HH:mm`, 미완성·선택 불가 초안은 `null`로 전달한다. 부모가 null을 반영해도 사용 중인 부분 선택은 유지한다.
- 2026-10-23 휠 피커 도입 요청: `selectionStyle="list"`(기본)는 기존 탭 목록, `"wheel"`은 관성 스크롤과 중앙 스냅이다. 별도의 WheelPicker를 만들지 않고 같은 초안·확정 계약을 확장했다. 추가 Native peer는 없다. 이 옵션은 개발 소스의 미게시 변경이다.
- 휠의 양 끝에 두 행씩 여백을 두어 첫 값·마지막 값도 중앙에 놓인다. 가장 가까운 사용 가능 행으로 스냅하고, 같은 거리이면 앞 행을 선택한다. 초기 배치·외부 값 갱신·프로그램 정렬은 선택 이벤트가 아니다. 빈 값은 첫 행을 보여도 선택하지 않으며, 기존 off-grid·불가한 조합을 자동으로 고치지 않는다.
- 사용자 스크롤이 지나는 사용 가능 값은 초안에 반영한다. field 확인은 스크롤 중 비활성이고 멈춘 뒤에 가능하다. inline의 각 값 변경은 바깥 폼의 초안이며 최종 확정은 바깥 폼이 소유한다. 시 변경으로 선택한 분이 불가능해져도 분을 임의로 바꾸지 않는다.
- 값은 `HH:mm | null`, 날짜·시간대·서머타임·현재 시각 계산은 제품 소유. 자정 `00:00`도 유효하다.
- `minuteStep` 기본 1. 60의 양의 정수 약수만 허용한다. 기존 값이 간격과 맞지 않아도 자동 반올림하지 않는다.
- `isTimeUnavailable(time)`은 제품이 제공한다. 시는 사용 가능한 분이 하나라도 있으면 선택할 수 있다. 선택한 분을 몰래 바꾸지 않으며, 그 조합이 불가하면 확인할 수 없다.
- 외부 `value` 변경은 초안에 반영한다. 비활성·읽기 전용으로 전환하면 열린 선택기를 닫고 확정하지 않는다.
- Web: 열마다 roving focus, 방향키·Home·End가 비활성 항목을 건너뛰며 선택한다. Enter/Space는 버튼 기본 동작. Popover가 초점·Escape·바깥/blur dismiss·복귀를 소유한다.
- Native: 각 값은 이름·checked/disabled 상태를 가진 radio이며 host 활성화를 사용한다. Sheet가 back·dismiss·safe area·복귀를 소유한다. 실제 VoiceOver/TalkBack 기기 검증과 host action 검사는 구분한다.
- 휠의 Web 표현은 기존 listbox·option·roving keyboard를 유지하고 CSS scroll snap과 [scrollend](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event)로 멈춤을 판정한다. scrollend 지원 브라우저가 필요하며 오래된 브라우저 대상은 기존 list를 선택한다. Native는 [ScrollView의 snapToOffsets](https://reactnative.dev/docs/scrollview#snaptooffsets)와 drag/momentum 이벤트를 사용한다. 열마다 adjustable 역할과 increment/decrement로 불가한 행을 건너뛴다. 내부 radio들은 휠에서 보조기술에 중복 노출하지 않는다.
- 동작 줄이기는 Provider 설정을 따른다. 값 정렬을 즉시 수행하며 Native 감속률은 0으로 설정한다. 스크롤 선택과 확정·취소 의미는 유지한다.

기존 Collection/Select는 단일 선택으로 닫히는 계약이다. TimePicker는 그 wrapper가 아니라 두 부분을 한 번에 확정하는 세션이다. 목록 값과 공통 Popover/Sheet/Button을 재사용하며, 날짜 엔진이나 새 native peer를 추가하지 않는다.

디자인 모티브: [Ant Design](https://ant.design/components/time-picker/)의 통합 열·확정,
[Material 3](https://m3.material.io/components/time-pickers/)의 큰 시각 표시.
색·모서리·간격은 HJM recipe와 소비 제품의 semantic palette를 따른다.

## 2026-10-23 개발 확인 범위

공통 계약 4개, Web 브라우저 13개, Native host 10개, 검색 연결 브라우저 1개가 통과했다.
양 renderer의 소스 빌드와 Web·Native Showcase 타입 확인도 통과했다. Web 실화면에서 분 휠을 굴려
`14:30 → 14:55` 변경과 중앙 정렬을 확인했다. 전체 renderer 테스트 타입 검사에는 기존
`packages/react/test/selection-motion.browser.test.tsx`의 미사용 `page` import 오류가 남아 있으며 변경 범위 밖이다.

Native 실제 제스처·VoiceOver/TalkBack 확인은 **미완료**다. 기존 iPhone 17 Pro·iOS 26.5에 설치된
Showcase 바이너리는 RN 0.86.2이고 소스는 0.88.0이어서 호환 개발 빌드를 시도했다.
메뉴 헤더 import와 이미지 로더 프로토콜은 기존 pnpm 패치에서 바로잡았지만,
`react-native-ios-utilities@5.2.0/ios/Sources/ObjcHelpers/UIView+RNIPaperHelpers.mm:34`가 RN 0.88에서
제거된 `RCTSurfacePresenterBridgeAdapter.bridge`를 참조하여 빌드가 중단됐다.
[어댑터 이관 조건](../../../docs/interaction-adapters.md#sdk-58-native-showcase-build-blocker-2026-10-23)을 해결한 뒤
현재 소스로 개발 바이너리를 빌드·설치하고 휠 제스처·취소·확정·보조기술 액션을 재개해야 한다.
호환성 미확인을 휠의 기기 검증 완료나 패키지 게시로 해석하지 않는다.
