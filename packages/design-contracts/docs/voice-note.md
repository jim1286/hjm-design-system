# VoiceNote

검토일: 2026-10-01.

Web `@hjmds/react/voice-note`, Native `@hjmds/react-native/voice-note`.
공통 `@hjmds/design-contracts/voice-note`의 descriptor는 제목, 실제 재생 상태, 초 단위 위치·길이를 받는다.

기존 Asset의 장식 이미지 슬롯, Slider의 키보드/접근성 조정, Button의 비활성/로딩 상태를 합성한다. 독립 오디오 엔진을 추가하지 않는다. 녹음 권한, 파일 다운로드, 오디오 세션, 재생 종료와 백그라운드 처리는 제품 플레이어의 책임이다.

- 상태는 paused/playing/loading/error. duration=null은 메타데이터 미확인, 0은 확인된 빈 녹음이다. 두 경우 탐색·재생을 막는다.
- position은 실제 플레이어 위치이며 duration을 넘어가면 끝으로 제한한다. 음수·무한수는 거절한다.
- onPlayingChange는 재생/정지 요청, onSeek는 Slider 변경 요청이다. 제품은 요청을 실제 엔진에 적용하고 새 descriptor를 전달한다. 내부 타이머로 재생을 꾸미지 않는다.
- 오류 시 labels.error와 선택형 onRetry를 제공한다. 로딩·오류·disabled에서 재생과 탐색을 막는다.
- labels와 formatTime은 제품 번역을 받는다. Native의 이전/다음 접근성 동작 문구도 labels에 포함된다.
- artwork는 제목 옆 장식용 슬롯이다. 실제 파일 정보나 필수 텍스트를 이 슬롯에만 두지 않는다.

양쪽 Storybook 컴포넌트/데이터 표시/Voice Note에 Default/Dark/LargeText와 로딩·오류 전환 버튼이 있다. 스토리는 상태 조작 예제라고 명시하며 실제 소리를 재생하지 않는다. 패키지 검사는 플레이어 연결 계약을 검증하며 실제 오디오·권한·OS 백그라운드 지원의 증거가 아니다.

[Native 후속 검증](../../../docs/evidence/component-flows-2026-10-01/README.md)에서 iPhone 17 / iOS 27 시뮬레이터의 큰 글씨 재생·정지 상태 전환, 로딩 중 비활성, 오류 후 재시도를 실제 조작했다. 캡처는 UI 상태 연결을 증명하며 실제 음성 재생 검증은 아니다.
