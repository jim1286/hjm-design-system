# 편집 도구 구성 계약

검토일: 2026-10-15 · Lucian 116·141 · Storybook 배포 · npm 1.21.0

`@hjmds/design-contracts/authoring-tools`, `@hjmds/react/authoring-tools`,
`@hjmds/react-native/authoring-tools` 선택 subpath로 제공한다.

## BezierEditor (Web·Native)

- `value`는 `[x1,y1,x2,y2]` controlled 초안이다. 두 제어점의 네 좌표를 모두 Slider로 편집한다.
- `x1,x2`는 CSS와 같은 `[0,1]`, y는 기본 `[-2,2]` 안에서 overshoot를 허용한다. `yRange`로 실제 제품 범위를 지정한다.
- `validateBezier`는 유한 좌표와 x 범위를, renderer는 yRange와 양의 유한 duration을 검사한다. `cubicBezierPoint`는 매개변수 t의 실제 기하 좌표이며 시간 기반 easing 출력과 혼동하지 않는다.
- 곡선에는 제어선과 두 제어점이 표시된다. 미리 보기 버튼은 현재 네 좌표로 실제 움직임을 한 번 재생한다. Web은 CSS cubic-bezier/WAAPI, Native는 Easing.bezier/Animated를 사용한다. 프레임마다 React state를 갱신하지 않는다.
- 좌표·duration·활성/disabled·reduced motion 변경, unmount, 백그라운드 진입에 재생을 멈춘다. reduced motion에서는 이동을 재생하지 않는다.
- 미리 보기 트랙은 이동을 내부에서 clip한다. y overshoot의 실제 easing을 유지하면서 좁은 편집 패널 밖으로 도형이 넘치지 않게 한다.
- 편집은 `onValueChange`만 호출한다. 제품 모션 토큰·저장소를 자동으로 수정하지 않는다. 제품이 별도 검토·저장 동작을 소유한다.

## ShortcutRecorder (Web 전용)

- 명시적 기록 버튼으로 포커스 영역에서 실제 KeyboardEvent의 물리적 `code`와 Ctrl/Alt/Shift/Meta를 기록한다. 전역 listener를 자동 등록하지 않는다.
- IME 조합·반복·AltGraph·수정키 단독은 무시하고, 일반 입력/탐색키 단독은 거부한다. Escape는 기록을 취소하며 Tab은 포커스 이동을 유지한다. 영역을 벗어나면 기록이 종료된다.
- `platform`은 제품이 지정한다. 일반 브라우저/OS 예약 조합과 제품 `reserved`, 현재 `conflicts`를 검사한다. 등록 직전 최신 props로 다시 검사한다. OS가 브라우저에 보내지 않는 키는 기록할 수 없으며 예약 목록은 모든 OS/브라우저 조합의 완전한 목록이 아니다.
- `normalizeShortcut`의 예: `Ctrl+Shift+KeyK`. 화면 표기는 제품이 현재 키보드 레이아웃에 맞춰 `formatShortcut`으로 제공한다.
- 기록된 초안과 실제 등록값 `value`는 분리한다. 명시적 등록 버튼의 `onRegister`가 실제 앱 단축키 서비스를 호출한다. Promise 완료 전 초안을 지우지 않고 중복 요청을 막는다. 실패하면 초안·기존 등록값을 보존하고 중앙 오류를 표시한다.
- 등록 서비스의 실행 범위(계정·작업공간·문서)가 바뀌면 제품이 해당 식별자로 recorder host에 React `key`를 지정한다. unmount는 구성의 늦은 상태 갱신을 무시하지만 이미 호출한 외부 등록을 취소하지 않는다. 제품 서비스는 AbortSignal 또는 세대/범위 확인으로 늦은 등록 완료를 거부하고 이전 listener를 해제해야 한다.
- Native는 이 API를 내보내지 않는다. `authoringToolsCapabilities.shortcutRecorder === false`로 명시한다. 네이티브 하드웨어 키보드 등록은 플랫폼별 제품 adapter의 책임이다.

## 근거와 확인 범위

원본 116의 고정 둘째 제어점과 141의 표시 중심 기록을 실제 controlled 편집·등록 계약으로 확장했다. 기존 Slider/Button/Stack/Text와 비동기 action helper를 재사용한다.
계약·Web browser·Native host targeted 검사는 실제 좌표 변경, 예약/충돌, 실패 보존·중복 요청, 실제 preview 호출을 확인한다. Native 기기 애니메이션과 실제 제품 단축키 서비스·토큰 저장·npm 게시는 별도다.
