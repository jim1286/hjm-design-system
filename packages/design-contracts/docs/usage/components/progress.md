# Progress

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Progress](../../progress.md), [Scroll progress](../../scroll-progress.md), `src/progress-recipe.ts`(`progressRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/진행 표시`, `배포/컴포넌트/상태와 알림/읽기 진행 표시`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Progress` | 기본 | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |
| `ScrollProgress` | 확장(스크롤 위치를 Progress로 표시, optional-extension, 추가 peer 없음) | `/scroll-progress` | `/scroll-progress` |
| `useScrollMetrics` | 보조(Web 스크롤 host 측정 hook) | `/scroll-progress` | — |

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
// Web
// ScrollProgress — 실제 세로 스크롤 요소를 callback ref로 넘긴다
import { useState } from "react";
import { ScrollProgress, useScrollMetrics } from "@hjmds/react/scroll-progress";

const [host, setHost] = useState<HTMLElement | null>(null);
const metrics = useScrollMetrics(host);
<>
  <ScrollProgress label={t("article.readProgress")} metrics={metrics} size="small" />
  <div ref={setHost} style={{ overflowY: "auto" }}>{article}</div>
</>
```

Native `ScrollProgress`는 제품 ScrollView의 `onScroll`(contentOffset.y)·`onContentSizeChange`(height)·`onLayout`(height)로
`metrics={{ offset, contentSize, viewportSize }}`를 만들어 넘긴다. 기존 콜백과 제스처는 그대로 둔다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | Web `ReactNode`(필수) · Native `string` | — | Native는 `label` 또는 `accessibilityLabel` 중 하나가 필수 |
| `max` | 양수 | `100` | 두 renderer 동일. 0–1 비율이면 `max={1}`을 함께 준다 |
| `value` | `0`~`max` | — | 생략하면 불확정 진행 |
| `size` | `small` · `medium` · `large` | `medium` | 두께 4 · 8 · 12, circular 지름 24 · 40 · 64 |
| `tone` | `brand` · `success` · `warning` · `danger` | `brand` | — |
| `shape` | `linear` · `circular` | `linear` | `circular`일 때만 `children`(링 안 내용)을 그린다 |
| `valueText` | 지역화 문구 | 백분율 문구 | 단위가 다른 문구가 필요하면 지역화해 넘긴다 |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 여백·폭만 |
| `metrics`(ScrollProgress) | `{ offset: number; contentSize: number; viewportSize: number }` | 필수 | 타입 `ScrollMetrics`(`@hjmds/design-contracts/scroll-progress`). `viewportSize` 0이면 0%, 내용이 화면보다 짧으면 100% |
| `useScrollMetrics`(Web) | `(host: HTMLElement \| null) => ScrollMetrics` | — | host의 스크롤·크기·자식 변화를 rAF로 모아 잰다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 두께(linear) `small` 4 · `medium` 8 · `large` 12, 모서리 `radius.full`, 폭은 부모를 채운다. circular 지름 `small` 24 · `medium` 40 · `large` 64, 획 3 · 4 · 6 | `progressRecipe.sizes`·`circular`, `.hjm-progress__native` |
| 간격 | 문구 줄(label·값)과 막대 사이 `spacing.xs` 8. Web은 label과 값 문구 사이 `spacing.md` 16. 여러 개를 쌓을 때 간격은 감싸는 [Stack](stack.md)이 준다 | `.hjm-progress`, `.hjm-progress__copy`, Native `gap: spacing.xs` |
| 순서·정렬 | label은 시작 쪽, 값 문구는 끝 쪽, 둘 다 막대 **위** 한 줄. circular도 문구 줄을 링 위에 두고 링은 시작 쪽에 붙는다(두 플랫폼) | `.hjm-progress[data-shape="circular"]`, Native `Progress` |
| 고정·스크롤 | 고정되지 않는다. 카드·목록 행 본문 아래에 둔다. 스크롤 위치 표시는 `ScrollProgress`를 스크롤 영역 위에 둔다 | — |
| 좁은 폭·큰 글자 | 문구 줄은 Native `flexDirection: "row"`로 줄바꿈 없이 양 끝 정렬된다. 긴 label은 짧은 i18n 문구로 둔다 | Native `Progress` |

```text
linear                               circular (Web)          circular (Native)
업로드 중               64%          업로드 중 64%  ◯         업로드 중   64%
   └─ gap spacing.xs 8                                       ◯
████████████░░░░░░░  ← 8 (medium)
```

## 꼭 지킬 것

- `value`와 `max`는 같은 단위로 넘긴다. `value={0.64}`만 넘기면 0.64%다([단위 표](../../progress.md)).
  `max ≤ 0`, 범위 밖 `value`는 던진다.
- 이름은 지역화한 `label`로 준다. Native는 보이는 label 없이 `accessibilityLabel`만 줄 수도 있다(`ScrollProgress`는 `label` 필수).
- 색은 `tone`, 두께는 `size`로만 바꾸고 배치는 `layoutStyle`로 한다. Native의 `style`·`labelStyle`·`valueStyle`·`trackStyle`·`indicatorStyle`은
  deprecated(개발 모드 경고, 다음 major 제거)다.
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

- 1.12.0 전 Native `max` 기본값은 1이었다. 분수 값을 넘기던 옛 코드는 `max={1}`을 명시해야 한다([이관표](../../migration-native-legacy-removal.md)).

### 가장자리 힌트의 표시 여부

2026-10-07 레퍼런스 조사에서 끝까지 스크롤한 마지막 행도 블러에 가려지는 문제를 확인했다.
새 `resolveScrollEdges`는 같은 `ScrollMetrics`에서 논리적 이전/다음 콘텐츠 존재 여부를 계산한다.
아직 미게시이며 `/scroll-progress` subpath에서 제공한다. 블러 renderer 자체를 제공한다는 뜻은 아니다.

```ts
import { resolveScrollEdges } from "@hjmds/design-contracts/scroll-progress";
const { before, after } = resolveScrollEdges(metrics);
```

- viewportSize=0(미측정), 콘텐츠가 들어맞는 경우에는 둘 다 false다.
- 소수 offset과 정수 콘텐츠 크기의 오차 때문에 1 logical pixel 이내는 경계로 취급한다.
- Native 탄성 overscroll은 범위 안으로 제한한다. 가로 RTL offset은 제품 host가 논리적 전진 값으로 정규화한다.
- 콘텐츠 크기가 바뀌면 새 metrics로 다시 계산한다. focus나 읽기 도구로 접근한 콘텐츠를 가리는지는
  이 순수 계산만으로 판단할 수 없다. 시각 효과 renderer가 해당 조작 상태에서 가림을 제거해야 한다.
