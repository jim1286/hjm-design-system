# 미디어 재생 제어

검토일: 2026-10-15 · Storybook 배포 · Web/Native · 미게시(1.20.0 이후)

Lucian 007의 재생/정지 모핑을 실제 미디어 상태와 연결할 공통 구성이 필요했다.
기존 IconButton과 Slider를 합성하며 재생 엔진·탐색 제스처·타이머를 새로 구현하지 않는다.
`@hjmds/{react,react-native}/media-transport`의 MediaTransport를 사용한다.
공유 `@hjmds/design-contracts/media-transport`는 관측값 해석과 모핑 경로만 소유한다.

## 실제 상태와 행동

`state`는 제품 플레이어의 관측된 playing/position/duration/buffering이다. 클릭으로 playing을 미리 바꾸지 않는다.
`onPlay`/`onPause`/`onSeek`는 실제 엔진을 호출하고 실패하면 reject한다. HJM은 callback의 성공만으로 재생 상태를 만들지 않는다.
`duration:null`은 길이를 모르는 라이브/미확인 상태다. duration 0과 함께 탐색 슬라이더를 생략한다.
알려진 양의 길이에서만 [0,duration]을 탐색하며 엔진이 끝을 약간 넘겨 보고한 position은 표시 범위 안으로 제한한다.
슬라이더 이동 중 값은 로컬 초안이다. 손/키를 놓으면 실제 onSeek를 한 번 실행하고 확인된 엔진 위치로 돌아온다.
Web adapter는 seeked/error에서 확정하고, Native adapter는 엔진 setter의 실제 수신/반영 계약으로 확정한다.
미디어 버퍼링 중 이미 playing이면 일시 정지는 계속 가능하다. 요청 중에는 공통 action-session이 중복 실행을 막는다.
실패하면 현재 관측 상태를 유지하고 같은 제어로 재시도한다. 메시지는 영역 중앙에 표시한다.

제품은 엔진 이벤트 수명·인증·백그라운드 재생·플레이어 해제를 소유한다. 다른 미디어로 바꿀 때 host key를 바꾸고 이전 엔진을 해제한다.
`active:false`는 숨겨진 컨트롤의 동작·모핑을 멈추고 탐색 초안을 버린다. 엔진 자체의 pause/dispose는 제품 adapter가 수행한다.

## 표현과 플랫폼

동일 vertex 수의 두 path를 실제 playing의 play/pause 모양 사이로 보간한다. 시간/진행률을 가짜로 늘리지 않는다.
Web requestAnimationFrame은 경로 attribute만 변경한다. Native Animated.Value listener는 SVG host d만 변경하며 useNativeDriver=false인 이유는 d가 경로 문자열이기 때문이다.
모핑은 공통 motion.normal 동안만 실행한다. reduced motion·비활성·숨긴 문서/백그라운드에서는 목표 경로로 정착하며 루프를 남기지 않는다.
프레임마다 React setState를 호출하지 않는다. 실제 재생 시간 갱신 빈도는 제품 엔진 이벤트 정책이다.
Native는 기존 optional peer react-native-svg가 필요하며 이 별도 진입점을 import할 때만 사용한다.
레이블·시간 formatter·길이 미정·실패 문구는 제품에서 공급한다. 슬라이더 접근성/키보드는 기존 Slider 계약을 따른다.

## 예제와 검증 경계

Web 예제는 기존 로컬 preview.mp4의 실제 HTMLVideoElement play/pause/timeupdate/seeked를 연결한다.
Native 예제는 기존 Expo Video와 sourceLoad/playingChange/timeUpdate를 연결하며 모듈이 없으면 지원되지 않음을 표시한다.
두 예제 모두 숨겨졌을 때 실제 엔진을 멈추고 엔진 hook/host 수명에 따라 정리한다. Native 실기기 재생 검증과는 별개다.
