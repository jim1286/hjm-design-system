# GridReveal

검토일: 2026-10-01.

`@hjmds/react/grid-reveal`, `@hjmds/react-native/grid-reveal`는 기존 Image 주위에 합성하는 장식 마스크다. `ready`를 Image의 `onLoadStatusChange`가 loaded일 때만 true로 두고, 이미지 소스 변경/재시도 전에는 false로 초기화한다. 오류일 때는 false로 돌린다. Image의 크기 예약·접근성 이름·로딩·실패·재시도 동작은 그대로 유지한다.

`children`이 실제 콘텐츠를 소유한다. `active=false`는 숨겨진 화면의 효과를 중단한다. 격자 4×4와 최대 180ms 지연, 기존 normal 지속 시간을 공유한다. 마스크만 투명해지며 이미지 픽셀·터치 대상·접근성 트리를 복제하지 않는다. 모션 줄이기에서는 마스크를 생략하고 이미지를 바로 보여준다. 웹 문서 숨김 또는 Native AppState 비활성에서도 마스크를 지운다.

Web은 WAAPI, Native는 Core Animated를 사용한다. Native 화면이 mounted인 채 가려지면 제품이 active=false를 전달해야 한다. 부모를 이미지 크기에 맞게 배치하며, 둥근 이미지 모서리가 필요하면 동일한 클리핑 프레임으로 둘을 감싼다.

양쪽 Storybook 컴포넌트/시각 효과/Grid Reveal에서 Default/Dark/LargeText, 다시 보기와 이미지 실패/재시도를 제공한다. 예제 풍경은 코드로 만든 자체 이미지다. [Native 후속 검증](../../../docs/evidence/component-flows-2026-10-01/README.md)에서 기존 iPhone 17 / iOS 27 시뮬레이터의 큰 글씨 오류·재시도 화면을 실제 조작하고 확인했다. Image 계약에 따라 오류 전후 같은 이미지 설명을 유지하며, 시각적 오류 문구는 중복 접근성 이름으로 읽지 않는다. 물리 기기의 GPU 비용과 프레임별 효과 타이밍 검증은 별도다.
