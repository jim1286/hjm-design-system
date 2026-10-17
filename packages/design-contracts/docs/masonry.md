# Masonry

2026-09-29: 사용자가 미구현 기능 완성을 요청해 높이가 다른 카드를 배치하는 Web/Native
렌더러를 추가했다. `getItemHeight(item, itemWidth)`를 명시하고 `width`·`columns`·`gap`은 선택이다.
콘텐츠 높이는 소비 화면이 소유한다. 2026-10-17 구성 리뷰에서 데스크톱 1200px에서도 고정 2열이라 카드가
약 580px로 늘어난 것을 확인해, `width`를 생략하면 Masonry가 자리 폭을 측정하고 `columns`를 생략하면
`masonryRecipe.minItemWidth`(160)로 열 수를 계산하게 했다. 항목 틀은 세로 flex 상자라 카드가 `flex: 1`로 채운다. 임의 높이 콘텐츠를 추정해 겹치게
만드는 대신 확정한 높이로 가장 짧은 열에 순서대로 배치한다. DOM/Native 읽기 순서는
입력 순서 그대로이며 RTL은 위치만 반전한다. 긴 문구·큰 글자를 사용할 때 높이도 함께
재계산해야 한다. 빈 목록은 `empty`로 표현하고 중복 키·잘못된 크기는 거부한다.

진입점: `@hjmds/react/masonry`, `@hjmds/react-native/masonry`.
공통 geometry: `@hjmds/design-contracts/components/masonry`.
