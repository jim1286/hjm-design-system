# AspectRatio contract

## 문제

이미지·동영상·지도 같은 비동기 media가 로드되기 전에도 공간을 예약해 layout shift를
줄여야 한다.

## 계약

`square | portrait | landscape | wide` preset 또는 양의 finite ratio를 받는다. renderer는
width/height 비율만 보장한다.

## 제품 소유

alt text, object-fit/crop, playback, loading/error, border radius는 자식 컴포넌트 또는 제품이
소유한다. `Image`의 network lifecycle과도 합치지 않는다.

## 플랫폼 번역

- Web: native CSS `aspect-ratio`
- Native: `ViewStyle.aspectRatio`

## 검증 화면

HJM Web/Native Foundations gallery의 16:9 frame과 square/custom ratio contract tests.
