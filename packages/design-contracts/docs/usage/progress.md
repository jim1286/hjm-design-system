# Progress 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Progress](../progress.md), [Scroll progress](../scroll-progress.md), recipe `progressRecipe`(`src/progress-recipe.ts`)

## 언제 쓰나

작업이 얼마나 진행됐는지 보여 줄 때 쓴다. 업로드·내보내기 진행, 목표 대비 달성률,
온보딩 단계 비율이 여기에 속한다. 진행량을 모르면 `value`를 생략해 불확정 진행으로 표시한다.
읽기 진행률(스크롤 위치)은 같은 계약을 합성한 `ScrollProgress`를 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 진행량 없이 “기다리는 중”만 표시 | [Spinner](spinner.md) |
| 버튼 안의 처리 중 상태 | [Button](button.md)의 `loading` |
| 파일 하나의 업로드 상태·재시도 | [UploadItem](upload-item.md) |
| 단계 이름이 있는 흐름 | [Steps](steps.md) |
| 사용자가 값을 조절 | [Slider](slider.md) |
| 수치 강조 | [Statistic](statistic.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Progress` | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` | 기본 |
| `ScrollProgress` | `/scroll-progress` | `/scroll-progress` | 스크롤 위치를 Progress로 표시(optional-extension, 추가 peer 없음) |
| `useScrollMetrics` | `/scroll-progress` | 없음 | Web 스크롤 host 측정 hook |

## 최소 사용 예

```tsx
// Web
import { Progress } from "@hjmds/react/feedback";

<Progress label={t("upload.progress")} value={64} />
```

```tsx
// Native
import { Progress } from "@hjmds/react-native/feedback";

<Progress label={t("upload.progress")} value={64} />
```

```tsx
// Web ScrollProgress — 실제 세로 스크롤 요소를 callback ref로 넘긴다
import { ScrollProgress, useScrollMetrics } from "@hjmds/react/scroll-progress";

const [host, setHost] = useState<HTMLElement | null>(null);
const metrics = useScrollMetrics(host);
<ScrollProgress label={t("article.readProgress")} metrics={metrics} size="small" />
<div ref={setHost} style={{ overflowY: "auto" }}>{article}</div>
```

Native `ScrollProgress`는 제품 ScrollView의 `onScroll`(contentOffset.y)·`onContentSizeChange`(height)·`onLayout`(height)로
`metrics={{ offset, contentSize, viewportSize }}`를 만들어 넘긴다. 기존 콜백과 제스처는 그대로 둔다.

## 축과 기본값

- `max`: 100(기본, 두 renderer 동일). 0–1 비율이면 `max={1}`을 함께 준다.
- `size`: `small` · `medium`(기본) · `large`. `tone`: `brand`(기본) · `success` · `warning` · `danger`.
- `shape`: `linear`(기본) · `circular`. `circular`일 때만 `children`(링 안 내용)을 그린다.
- `valueText`를 생략하면 백분율 문구를 쓴다. 단위가 다른 문구가 필요하면 지역화해 넘긴다.

## 꼭 지킬 것

- `value`와 `max`는 같은 단위로 넘긴다. `value={0.64}`만 넘기면 0.64%다([단위 표](../progress.md)).
  `max ≤ 0`, 범위 밖 `value`는 던진다.
- 이름은 지역화한 `label`로 준다. Native는 보이는 label 없이 `accessibilityLabel`만 줄 수도 있다(`ScrollProgress`는 `label` 필수).
- 색은 `tone`으로만 바꾼다. Native의 `style`·`labelStyle`·`valueStyle`·`trackStyle`·`indicatorStyle`로 색·두께를 덮지 않는다.
- `ScrollProgress`는 window에 자동으로 붙지 않는다. Web은 스크롤 host를, Native는 측정값을 반드시 넘긴다.
- 작업 완료율에는 `ScrollProgress`가 아니라 `Progress`를 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `label` 타입 | `ReactNode`, 필수 | `string`, 또는 `accessibilityLabel`만 |
| 요소 | `<progress>` (ref 전달) | `accessibilityRole="progressbar"` View |
| 보조 문구 | 없음 | `accessibilityHint` |
| 스크롤 측정 | `useScrollMetrics(host)` | 제품이 ScrollView 이벤트로 계산 |

## 함정

- 1.12.0 전 Native `max` 기본값은 1이었다. 분수 값을 넘기던 옛 코드는 `max={1}`을 명시해야 한다([이관표](../migration-native-legacy-removal.md)).
