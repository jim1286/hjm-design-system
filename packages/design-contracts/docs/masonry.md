# Masonry

2026-09-29: 사용자가 미구현 기능 완성을 요청해 높이가 다른 카드를 배치하는 Web/Native
렌더러를 추가했다. `width`, `columns`, `gap`, `getItemHeight(item, itemWidth)`를 명시한다.
컨테이너 측정과 콘텐츠 높이는 소비 화면이 소유한다. 임의 높이 콘텐츠를 추정해 겹치게
만드는 대신 확정한 높이로 가장 짧은 열에 순서대로 배치한다. DOM/Native 읽기 순서는
입력 순서 그대로이며 RTL은 위치만 반전한다. 긴 문구·큰 글자를 사용할 때 높이도 함께
재계산해야 한다. 빈 목록은 `empty`로 표현하고 중복 키·잘못된 크기는 거부한다.

진입점: `@hjmds/react/masonry`, `@hjmds/react-native/masonry`.
공통 geometry: `@hjmds/design-contracts/components/masonry`.
