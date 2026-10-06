# ImageComparison

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-06
- 근거: [계약](../../reference-controls.md)
- 스토리북: `실험/컴포넌트/데이터 표시/이미지 전후 비교`

## 언제 쓰나

같은 좌표와 비율의 두 이미지를 겹쳐 변화량을 비교할 때 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 서로 다른 장면의 목록 | [Image](image.md)와 [Grid](grid.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ImageComparison` | 독립 supplemental | `@hjmds/react/image-comparison` | `@hjmds/react-native/image-comparison` |

## 최소 사용 예

```tsx
// Web
import { ImageComparison } from "@hjmds/react/image-comparison";
<ImageComparison label={label} before={before} after={after} value={percentage} onValueChange={setPercentage} getValueText={formatPercentage} />
```

```tsx
// Native
import { ImageComparison } from "@hjmds/react-native/image-comparison";
<ImageComparison label={label} before={before} after={after} value={percentage} onValueChange={setPercentage} getValueText={formatPercentage} decrementLabel={decrementLabel} incrementLabel={incrementLabel} />
```

Native는 import를 `@hjmds/react-native/image-comparison`로 바꾼다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | number | 필수 | value는 0~100. before/after는 src·width·height·label을 가지며 두 비율이 같아야 한다. |
| Web `layoutStyle` | 배치 전용 style | 없음 | 바깥 틀의 폭·margin·flex 배치 |
| `disabled` | boolean | false | 변경을 막고 현재 값을 유지 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 바깥 폭을 채우고 원본 aspect ratio로 높이를 정한다. 두 이미지는 같은 전체 크기이며 before만 잘린다. | renderer `image-comparison.tsx` |
| 간격 | 위 라벨 사이 space.sm=12px. 실제 조작 Slider는 이미지 바로 아래에 둔다. | foundations spacing |
| 순서·정렬 | 전후 라벨→이미지→비율 조절 | renderer 순서 |
| 고정·스크롤 | 바깥 화면이 스크롤을 소유한다 | 별도 스크롤 없음 |
| 좁은 폭·큰 글자 | 폭을 강제 고정하지 않고 본문/행의 줄바꿈을 허용한다 | 위 배치 |

## 꼭 지킬 것

- 이미지 경계는 별도 조작 엔진이 아니다. before 비율은 물리적 왼쪽 기준이며 RTL에서도 이미지 의미를 뒤집지 않는다. Native에는 decrementLabel/incrementLabel도 제품 언어로 전달한다.
- 브랜드는 HJM provider의 semantic palette로 연결한다. 점수 집계·이미지 변환·저장은 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 조작 | Web은 Slider의 range/키보드, Native는 Slider의 adjustable 및 증감 버튼을 그대로 사용한다. | 같은 의미를 플랫폼 host로 번역 |
