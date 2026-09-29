# QRCode

2026-09-29: 사용자의 미구현 기능 완성 요청으로 문자열을 실제 스캔 가능한 QR로 인코딩하는
Web/Native 렌더러를 추가했다. `value`, 현지화된 `label`, QR을 쓰지 않아도 같은 목적을
달성하는 `fallback` 콘텐츠가 필수다. `level`은 L/M/Q/H, 기본 M이다.

qrcode-generator 2.0.4(MIT)를 renderer의 선택형 진입점에서만 가져온다. contracts는 인코더를
주입받아 dependency-free를 유지한다. Native SVG 렌더링은 react-native-svg 15.15.5가 필요하다.
한글·이모지는 UTF-8로 인코딩하고 jsQR 1.4.0으로 실제 디코딩 왕복 테스트를 수행한다.

스캔 대비를 유지하려고 테마와 무관하게 검정 모듈·흰 배경·4모듈 여백을 사용한다. 최소
모듈 크기 2px를 충족하지 못하는 `size`는 거부하고 정수 모듈 크기로 맞춘다. 입력 용량
초과는 오류로 알린다. 서버가 소유한 만료·인증·목적지 권한은 QR 컴포넌트가 보증하지 않는다.

진입점: `@hjmds/react/qr-code`, `@hjmds/react-native/qr-code`.
