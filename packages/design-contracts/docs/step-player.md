# StepPlayer

검토일: 2026-10-01.

`@hjmds/react/step-player`, `@hjmds/react-native/step-player`는 기존 Steps, Progress, Button을 합성한다. 별도 단계 상태 머신이나 재생 엔진을 두지 않는다. 사용자가 요청한 단계형 소개와 미디어는 서로 다른 시계를 사용하므로 호스트가 현재 위치와 재생 상태를 소유한다.

- `descriptor`, `statusLabels`, `composeAccessibleName`: 기존 Steps 계약 그대로.
- `progress`: 전체 재생 진행률 0~1. `playing`: 실제 호스트 재생 여부.
- `onPlayingChange`: 재생/일시정지 요청. 콜백 호출 자체로 내부 상태를 바꾸지 않는다.
- `onReplay`: 호스트가 현재 단계와 진행률을 초기화하고 재생 정책을 결정한다.
- `labels`: 번역된 play/pause/replay/progress 문구. `disabled`는 두 동작을 비활성화한다.
- `children`: 현재 단계의 실제 콘텐츠. 모션은 기존 ContentTransition 등으로 합성한다.

완료 시 마지막 단계와 progress=1을 전달하고 재생 여부를 false로 바꾼다. 실제 비동기 작업의 완료를 타이머로 추정하는 용도가 아니다. 재생 종료/탐색 이탈/백그라운드 정지는 호스트 책임이다. 모션 줄이기는 콘텐츠 전환을 줄이며 사용자가 요청한 재생 자체를 막지 않는다.

양쪽 Storybook `컴포넌트/피드백/Step Player`에 Default/Dark/LargeText를 제공한다. 예제만 사용자가 시작하는 6초 소개 시계를 가지며, 브라우저 숨김 또는 Native AppState 비활성에서 정지한다. 실제 서비스의 작업 진행이나 저장 완료를 주장하지 않는다.
