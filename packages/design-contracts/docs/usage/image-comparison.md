# ImageComparison 사용 지침

검토일: 2026-10-06 · 실험 · [계약](../reference-controls.md)

## 언제 쓰나

같은 좌표와 가로세로 비율의 전후 이미지를 한 프레임에서 비교할 때 쓴다.

## 쓰지 않을 때

일반 사진 열람은 Image/ImageViewer, 서로 다른 사진 목록은 Carousel을 쓴다. 지도나 인터랙티브 요소를 넣는 마스크가 아니다.

## 공개 이름과 import

`ImageComparison`: `@hjmds/react/image-comparison`, `@hjmds/react-native/image-comparison`.

```tsx
<ImageComparison label={t('comparison.beforeRatio')} before={before} after={after}
  value={ratio} onValueChange={setRatio} getValueText={value => `${value}%`} />
```

before/after는 `{src,width,height,label}`. 제품 번역과 실제 intrinsic dimensions를 전달한다.
Native는 `decrementLabel`과 `incrementLabel`도 전달한다. 조절은 아래 Slider에서 하고 가운데 선은 장식이다.
0은 after 전체, 100은 before 전체다. 전체 보기 버튼이 필요하면 제품에서 이 값으로 변경한다.
