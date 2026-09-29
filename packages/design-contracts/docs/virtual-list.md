# VirtualList

2026-09-29: 사용자의 미구현 기능 완성 요청으로 고정 높이 행의 가상화 렌더러를 추가했다.
Web은 보이는 범위와 overscan만 마운트하고, Native는 FlatList에 위임한다. `rowHeight`와
`height`는 필수이며 가변 높이·페이지 가져오기를 이 API에 섞지 않는다. 콘텐츠와 글자
배율에 맞는 행 높이는 호스트가 지정하고, 높이를 확정할 수 없으면 기존 List를 사용한다.

Web은 ArrowUp/Down/Home/End로 행을 탐색하고 실제 포커스를 옮긴다. 포커스된 항목은
스크롤로 가시 범위를 벗어나도 마운트를 유지한다. 필터 결과가 줄면 스크롤 위치를
새 범위로 제한한다. 전체 개수와 위치는 현재 전달된 배열 기준으로 표시한다.

진입점: `@hjmds/react/virtual-list`, `@hjmds/react-native/virtual-list`.
네트워크 로딩은 기존 LoadMore를 조합한다. Native 재활용·보조기술 스크롤은 FlatList가 소유한다.
