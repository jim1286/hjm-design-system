# ContentTransition

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: contract `src/content-transition.ts`(`resolveContentTransition`)
- 스토리북: `배포/컴포넌트/시각 효과/내용 전환`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ContentTransition` | 보조 — 별도 보조 기능(supplemental) | `/content-transition` | `/content-transition` |
| `TextTransition` | 동반 — 텍스트 전용, [별도 지침](text-transition.md) | `/content-transition` | `/content-transition` |

root에서 export되지 않고 granular subpath로만 import 된다. Web은 optional peer `framer-motion`이 필요하다.
Native는 React Native `Animated`만 써서 추가 peer가 없다.

## 최소 사용 예

```tsx
// Web
import { ContentTransition } from "@hjmds/react/content-transition";
import { useRef } from "react";

// 상태 → 키 상수 표. 키를 템플릿 문자열로 만들지 않는다.
const titleKey = { all: "results.all.title", unread: "results.unread.title" } as const;

function Results({ filter }: { filter: keyof typeof titleKey }) {
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <ContentTransition stateKey={filter} preset="rise" focusTarget={heading}>
      <h2 ref={heading} tabIndex={-1}>{t(titleKey[filter])}</h2>
      <ResultList filter={filter} />
    </ContentTransition>
  );
}
```

```tsx
// Native
import { ContentTransition } from "@hjmds/react-native/content-transition";

<ContentTransition stateKey={step} preset="slide">
  <StepBody step={step} />
</ContentTransition>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `preset` | `fade` · `rise` · `slide` · `scale` | `fade` | `rise`는 아래 12에서, `slide`는 가로 16(RTL이면 반대), `scale`은 0.96에서 시작 |
| `motion` | `system` · `none` | `system` | `system`은 reduced motion을 따르고 `none`은 항상 즉시 교체 |
| `stateKey` | `string` | — (필수) | 바뀔 때만 새 내용이 나타난다 |
| `animateHeight` | boolean | false | 내용의 측정 높이가 바뀔 때 주변 틀 높이를 전환한다. 모션 감소에서는 즉시 반영 |
| Web `focusTarget` | `RefObject<HTMLElement \| null>` | — | 바뀌기 전 포커스가 안에 있었으면 전환 뒤 이 요소로 옮긴다 |
| Web `layoutStyle` | 배치 전용 style | — | 바깥 고정 wrapper에 붙는다(키가 바뀌는 안쪽 패널이 아님) |

콜백 prop은 없다. `TextTransition`은 `text: string`을 `stateKey`로 쓴다.

- 첫 렌더는 움직이지 않는다. 시간은 `motion.normal`, 곡선은 `easing.enter` 토큰이다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 자체 크기·여백이 없다. Web은 배치 wrapper·높이 틀·측정 flow·keyed panel, Native는 바깥 Animated.View·측정 View·표현 Animated.View로 감싼다 | `packages/react/src/content-transition.tsx`, `packages/react-native/src/content-transition.tsx` |
| 간격 | 자체 간격이 없다. 위아래 간격은 감싸는 [Stack](stack.md) 등이 정한다. 움직임 폭(세로 12·가로 16·0.96배)만큼 래퍼 밖으로 잠깐 밀려 나오므로 바로 옆 요소와 간격을 둔다 | `src/content-transition.ts` |
| 순서·정렬 | 바뀌는 영역 하나만 감싼다(결과 패널, 단계 본문). 필터 막대·탭·제목처럼 그대로 남는 부분은 바깥에 둔다 | — |
| 고정·스크롤 | Native 래퍼에는 `flex`가 없어 남은 높이를 채우지 않는다. 화면 높이를 채워야 하는 내용이면 바깥 View가 높이를 정한다 | `packages/react-native/src/content-transition.tsx` |
| 좁은 폭·큰 글자 | — | — |

## 꼭 지킬 것

- `stateKey`는 내용의 의미가 바뀔 때만 바꾼다. 매 렌더 새 값을 주면 계속 다시 나타난다.
- 사라지는 내용의 복사본을 남기지 않는 계약이다. 교차 페이드를 직접 만들려고 두 겹을 겹치지 않는다.
- Web 배치는 `layoutStyle`(바깥 wrapper)로 한다. Native는 배치 prop(`style`·`layoutStyle`)이 없어 바깥 View가 배치한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 포커스 복원 | `focusTarget`: 바뀌기 전 포커스가 안에 있었으면 그 요소로 옮긴다 | 없음 |
| 앱이 백그라운드로 감 | 해당 없음 | 진행 중 전환을 멈추고 바로 표시 |
| 배치 prop | `layoutStyle`(바깥 wrapper) | 없음 |

### 측정 기반 overlay 전환 준비 (미게시)

`@hjmds/design-contracts/content-transition`의 `resolveOriginTransition(origin, destination, reducedMotion)`은
같은 물리 viewport 좌표계의 `TransitionRect { x, y, width, height }` 두 개를 받는다.
도착 경계의 중심 기준 translateX/Y와 scaleX/Y를 반환한다. RTL 좌표를 다시 뒤집지 않는다.
미측정·0 크기·비유한 값·계산 overflow·모션 감소에서는 null로 일반 overlay 표현을 유지한다.

이 함수는 renderer의 morph prop이나 완성된 실험이 아니다. 기존 ContentTransition의
단일 subtree 전환과 Native SharedTransitionElement의 라우터 전환을 대체하지 않는다.
trigger 측정 시점, 같은 좌표계 보장, 취소·재열기, exit presence, 초점 복귀는 renderer가
연결해야 한다. Motion Primitives의 원본에서 닫기 후 초점 손실과 작성 예제의 초안 소실을
확인했으므로 geometry만 흡수하고 기존 HJM overlay 상태 엔진을 유지한다.
