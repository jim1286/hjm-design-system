# Image contract

**문제.** 이 시스템에 이미지가 하나도 없었습니다. 사진 콘텐츠(선수 프로필 사진, FA 등급
차트 이미지)를 레이아웃 밀림 없이, 로드 실패에도 의미를 잃지 않게 보여 주는 첫 계약입니다.

## 대체 텍스트의 의무 — Icon과 같은 모양

`Icon`이 이미 같은 문제(장식 vs 정보)를 `decorative`/`accessibilityLabel` discriminated
union으로 풀었습니다. Image는 그 모양을 그대로 따릅니다.

```ts
const avatar = {
  src: "https://cdn.example.com/kbo/player-42.jpg",
  width: 400,
  height: 300,
} satisfies ImageDescriptor; // decorative — 옆 텍스트가 이미 선수 이름을 말한다

const chart = {
  src: "https://cdn.example.com/kbo/grade-chart.png",
  width: 800,
  height: 450,
  decorative: false,
  accessibilityLabel: "2026시즌 FA 등급별 보상 규정 표",
} satisfies ImageDescriptor; // 정보 — 이미지 자체가 유일한 정보 전달 수단
```

- 기본은 `decorative`입니다. 주변 caption이나 문장이 이미 같은 의미를 전달하면 화면에서
  중복 설명을 만들지 않습니다.
- 이미지 자체만 정보를 전달할 때는 `decorative: false`와 현지화된 `accessibilityLabel`이
  **함께** 필요합니다. 하나만 있는 조합(장식인데 label이 있거나, 정보인데 label이 없는
  경우)은 validator가 거부합니다 — Icon의 `validateIconDescriptor`와 동일한 판단입니다.
- Icon과 달리 Image에는 `tone`이 없습니다. 사진은 semantic color로 물들지 않습니다.

## 종횡비 — 레이아웃 밀림 방지

`width`/`height` intrinsic dimension이 필수입니다. `next/image`가 번들러 없이 못 여는
문제(로드 전 자리 확보)를 여기서는 필수 필드로 강제합니다. `resolveImageAspectRatio(width,
height)`가 순수 계산을 담당하고, renderer는 로드 전에도 이 비율로 자리를 예약해 콘텐츠가
갑자기 밀리지 않게 합니다. 두 값 모두 양의 유한수여야 하며 아니면 `RangeError`입니다.

## 로드 상태와 실패 시 화면

`ImageLoadStatus`는 `idle | loading | loaded | error`입니다. `idle`/`loading` 동안은
`imageRecipe.placeholder`(중립 sunken 배경)를 보여 timer나 스켈레톤 애니메이션 없이도
자리를 채웁니다. `error`에서는 `imageRecipe.fallback`이 중립 배경 위에 `error` semantic
icon을 보여 줍니다 — 실제 사진이 아니라 실패했다는 사실 자체를 전달합니다.

가장 중요한 규칙은 접근성 이름의 연속성입니다. **정보 이미지가 로드에 실패해도 그
`accessibilityLabel`은 사라지지 않습니다.** `resolveImageFallbackAccessibilityLabel`이
정보 이미지에는 원래 label을, 장식 이미지에는 `undefined`를 돌려줍니다 — "이미지를 표시할
수 없습니다" 같은 일반 문구로 원래 의미를 덮어쓰지 않습니다. 시각 형태(사진 → fallback
아이콘)만 바뀌고, 그 사진이 전달하던 의미는 로드 성공 여부와 무관하게 유지됩니다.

## Preview(확대 보기)를 넣지 않는 이유

Ant Design `Image`의 클릭 확대·zoom·그룹 프리뷰는 이 계약에 없습니다. 그것은 표시가
아니라 **overlay 행동**이고, 상태 축으로 보면 `open`/`escape`/`outside dismiss`처럼
Dialog·Sheet가 이미 소유한 문제입니다. 이 조합을 Image 자체에 넣으면 정적 표시
컴포넌트가 조용히 자기 자신의 modal 수명주기를 갖게 됩니다. 확대 보기가 실제로
필요해지면 별도 Web 전용 `ImagePreview` overlay가 기존 `Dialog`/`AnchoredOverlay` 계약을
조합해서 풀 문제이지, `Image`가 escape hatch로 열 문제가 아닙니다.

## 플랫폼 번역

`fit: cover | contain | fill`은 Web `object-fit`과 거의 그대로 대응합니다. RN
`resizeMode`는 `fill`에 해당하는 이름이 없어 `stretch`로 번역합니다 — `nativeResizeModes`가
그 한 곳의 이름 차이를 소유하므로 제품이 각자 매핑표를 만들지 않습니다.

## 현재 검증과 남은 증거

first-party Web/RN renderer가 추가되어 contract와 두 surface를 `beta`로 승격했다. Web은
intrinsic ratio 예약, 장식/정보 이미지의 alt 의미, load/error 상태, fallback 접근성 이름
유지와 `next/image` 같은 framework adapter 경계를 SSR·browser test로 검증한다. Native도
같은 `src`/`width`/`height` descriptor를 직접 resolve해 intrinsic ratio를 예약하고,
`nativeResizeModes`로 fit을 번역하며, 장식 기본값·정보 이미지의 fallback 이름 유지·built-in
fallback·`src` 변경 후 재시도를 component test로 검증한다. `sourceAdapter`와 `renderImage`
경계로 bare RN의 `ImageSourcePropType` 및 `expo-image` 같은 optimized host를 연결할 수 있다.
이전 RN `source` API는 마이그레이션 호환용 deprecated 경계일 뿐 intrinsic-size 계약의
증거로 세지 않는다.

이전 후보였던 야잘알 팀 엠블럼은 여전히 Avatar 성격이므로 Image의 제품 증거로 세지 않고,
BurnTok의 data URI 아이콘도 network failure 증거로 세지 않는다. 실제 network asset의
404/재시도와 VoiceOver·TalkBack 접근성 이름 유지 증거는 stable 승격 전까지 명시적인
debt로 남는다.
