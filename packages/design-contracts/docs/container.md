# Container contract

## 문제

Shell 내부가 아닌 화면에서도 읽기 폭, 일반 콘텐츠 폭, logical gutter를 반복해서 맞춰야 한다.
임의 `maxWidth`를 제품마다 복사하면 Web과 tablet Native가 서로 다른 리듬을 만든다.

## 계약

- size: `reading | content | full`
- gutter: `none | compact | regular | spacious`
- 항상 inline axis에서 가운데 정렬하며 RTL에서도 물리 방향을 노출하지 않는다.

Web은 `max-inline-size`, `margin-inline`, `padding-inline`으로 번역하고 Native는 centered
`View`, `maxWidth`, `paddingHorizontal`로 번역한다.

## 배제한 축

임의 px width, breakout, nested grid strategy는 공개하지 않는다. 반복되는 실제 제품 요구가
생기면 token 또는 별도 layout pattern으로 검토한다.

## 검증 화면

HJM Web/Native Foundations gallery에서 reading/content width와 large text wrapping을 검증한다.
