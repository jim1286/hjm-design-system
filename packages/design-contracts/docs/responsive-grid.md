# Responsive values and Grid contract

## 한 축만 공유한다

Web의 CSS media query와 React Native의 `useWindowDimensions`를 각각 제품에서
임의로 해석하지 않는다. 두 renderer가 측정한 **창 너비**를 같은 네 class로
번역한다.

| WindowClass | 최소 너비 | Web | Native |
| --- | ---: | --- | --- |
| `compact` | 0 | CSS px | density-independent point |
| `medium` | 600 | CSS px | density-independent point |
| `expanded` | 960 | CSS px | density-independent point |
| `wide` | 1280 | CSS px | density-independent point |

`resolveWindowClass(windowWidth)`의 경계는 inclusive다. 예를 들어 599.9는
`compact`, 600은 `medium`이다. `phone`/`tablet`/`desktop` 같은 기기명은 같은
크기의 split view나 foldable 창을 잘못 분류하므로 계약에 넣지 않는다.

## ResponsiveValue의 total fallback

`ResponsiveValue<T>`는 `compact`를 반드시 요구하고, 나머지는 sparse override다.

```ts
const columns: ResponsiveValue<number> = {
  compact: 1,
  medium: 2,
  wide: 4,
};

resolveResponsiveValue(columns, "expanded"); // 2
resolveResponsiveValue(columns, "wide"); // 4
```

값이 없는 class는 가장 가까운 좁은 class로 내려가며, 넓은 class 값을 좁은
화면으로 역전파하지 않는다. `compact`가 필수라 모든 WindowClass에서 결과가
존재한다. 객체 payload도 scalar와 구분하려는 런타임 추측 없이 그대로 쓸 수 있다.
오타 난 class는 무시하지 않고 validator가 거부한다.

## Grid가 소유하는 것

`GridDescriptor`는 다음의 renderer-neutral 의미만 소유한다.

- class별 **요청 열 수** `columns`
- spacing token만 받는 `gap`; 단일 token 또는 `{ row, column }`
- 여러 열이 목표 폭보다 좁아지기 전에 열 수를 줄이는 선택적 `minColumnWidth`
- 자식 source order를 바꾸지 않는 고정 `row-major` flow

```ts
const cards: GridDescriptor = {
  columns: { compact: 1, medium: 2, expanded: 3, wide: 4 },
  gap: {
    compact: "sm",
    expanded: { row: "lg", column: "md" },
  },
  minColumnWidth: { compact: 160, wide: 220 },
};

const layout = resolveGridLayout(cards, {
  windowWidth: 1440,
  availableWidth: 920,
});
```

여기서 `windowWidth`는 WindowClass 선택에만 쓰고 `availableWidth`는 page padding,
sidebar 등을 뺀 실제 Grid 내부 폭과 열 너비 계산에만 쓴다. 둘을 하나로 합치면
wide 창의 좁은 사이드 패널이 wide 열 수를 받은 뒤 overflow하는 문제가 생긴다.

`columns`는 목표이자 최댓값이다. `minColumnWidth` 때문에 모두 들어가지 않으면
resolver가 열 수를 줄이되 요청보다 늘리지는 않는다. 단일 열은 작은 split view
자체를 overflow시키지 않도록 컨테이너 폭까지 줄어들 수 있다. `minColumnWidth`가
없으면 요청 열 수를 그대로 유지하고, gap을 제외한 열 폭이 0 이하인 구성은
조용히 깨뜨리지 않고 오류로 보고한다.

## Renderer translation

- Web: `repeat(columns, minmax(0, 1fr))`, numeric row/column gap으로 번역한다.
- Native: 계산된 `columnWidth`, row/column gap을 `flexWrap` item에 번역한다.
- 양쪽 모두 자식 배열을 재정렬하지 않는다. RTL은 logical start의 시각 방향만
  바꾸며 source/read/focus order는 그대로 둔다.

이 계약은 DataTable의 행/열 semantic이나 Masonry packing을 포함하지 않는다.
Grid child 자체의 role과 접근성 이름도 각 child component가 소유한다.

## 검증 경계

단위 테스트는 네 breakpoint 경계, sparse fallback, 잘못된 class/token/열 수,
축별 gap, 좁은 컨테이너 collapse, 불가능한 geometry를 검증한다. 실제 renderer는
별도로 compact/medium/expanded/wide viewport와 RTL, 200% text 환경에서 overflow와
source/focus order를 evidence로 남겨야 한다.
