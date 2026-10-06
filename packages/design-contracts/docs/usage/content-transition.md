# ContentTransition 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
contract `src/content-transition.ts`(`resolveContentTransition`)

## 언제 쓰나

같은 자리의 내용이 상태에 따라 바뀔 때(필터 결과 패널, 단계별 본문) 새 내용이 짧게 나타나도록 감싼다.
`stateKey`가 바뀔 때만 움직이고, 화면에는 현재 내용 하나만 남는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 바뀌는 것이 텍스트 한 줄 | [TextTransition](text-transition.md) |
| 화면 사이 이동 | [SharedTransitionScreen](shared-transition-screen.md) |
| 내용이 아직 로딩 중 | [Skeleton](skeleton.md) |
| 내용을 펼치고 접기 | [Collapsible](collapsible.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ContentTransition` | `/content-transition` | `/content-transition` | 별도 보조 기능(supplemental) |
| `TextTransition` | `/content-transition` | `/content-transition` | 텍스트 전용, [별도 지침](text-transition.md) |

root에서 export되지 않고 granular subpath로만 import 된다. Web은 optional peer `framer-motion`이 필요하다.
Native는 React Native `Animated`만 써서 추가 peer가 없다.

## 최소 사용 예

```tsx
// Web
import { ContentTransition } from "@hjmds/react/content-transition";

const heading = useRef<HTMLHeadingElement>(null);

<ContentTransition stateKey={filter} preset="rise" focusTarget={heading}>
  <h2 ref={heading} tabIndex={-1}>{t(`results.${filter}.title`)}</h2>
  <ResultList filter={filter} />
</ContentTransition>
```

```tsx
// Native
import { ContentTransition } from "@hjmds/react-native/content-transition";

<ContentTransition stateKey={step} preset="slide">
  <StepBody step={step} />
</ContentTransition>
```

## 축과 기본값

- `preset`: `fade`(기본) · `rise`(아래 12에서) · `slide`(가로 16, RTL이면 반대) · `scale`(0.96에서).
- `motion`: `system`(기본, reduced motion을 따른다) · `none`(항상 즉시 교체).
- 첫 렌더는 움직이지 않는다. 시간은 `motion.normal`, 곡선은 `easing.enter` 토큰이다.

## 꼭 지킬 것

- `stateKey`는 내용의 의미가 바뀔 때만 바꾼다. 매 렌더 새 값을 주면 계속 다시 나타난다.
- 사라지는 내용의 복사본을 남기지 않는 계약이다. 교차 페이드를 직접 만들려고 두 겹을 겹치지 않는다.
- 배치 prop(`style`·`layoutStyle`)은 없다. 배치는 바깥 wrapper가 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 포커스 복원 | `focusTarget`: 바뀌기 전 포커스가 안에 있었으면 그 요소로 옮긴다 | 없음 |
| 앱이 백그라운드로 감 | 해당 없음 | 진행 중 전환을 멈추고 바로 표시 |

## 높이가 달라지는 패널 (2026-10-06 실험)

레퍼런스 적용 요청에서 길이가 다른 본문 아래 행동이 즉시 튀는 문제를 다루기 위해
`animateHeight`를 추가했다. 기본은 false여서 기존 배치 동작을 유지한다.
`<ContentTransition stateKey={panel} animateHeight>…</ContentTransition>`로 선택한다.
Web은 ResizeObserver와 WAAPI로 주변 높이만 움직이고, Native는 onLayout과 Animated의
JS driver를 쓴다. 텍스트 전체를 scale하거나 exit subtree를 복제하지 않는다.
첫 측정·모션 감소·`motion="none"`·백그라운드에서는 즉시 맞춘다. 큰 목록·화면 전체 전환 대신
작은 패널에 사용하고 실제 기기 성능은 소비 제품에서 확인한다. Web의 ResizeObserver/WAAPI가
없으면 자연스러운 정적 높이로 남는다.
