# 모션

- 단계: 토큰
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: `src/foundations.ts`(`motion`·`easing`·`motionPreset`·`spring`), `packages/react/src/theme.ts`, `packages/react/src/provider.tsx`, `packages/react-native/src/provider.tsx`
- 스토리북: `배포/토큰/표면과 움직임/모션`

## 언제 쓰나

전환·나타남·사라짐의 길이와 곡선을 정할 때 쓴다. 먼저 의도(`motionPreset`)로 고르고, 길이와 곡선을 따로 고르는 것은 그 다음이다.
모든 프리셋은 OS의 "동작 줄이기"에서 어떻게 바뀌는지(`reducedMotion`)를 함께 정한다.

## 값

### 프리셋(먼저 고른다)

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `motionPreset.micro` | 120ms · `standard` · 줄이기 `instant` | `--hjm-motion-fast` | `motionPreset.micro` | 눌림·토글·색 바뀜 같은 작은 상태 변화 |
| `motionPreset.enter` | 200ms · `enter` · 줄이기 `opacity` | `--hjm-motion-normal` | `motionPreset.enter` | 시트·토스트·팝오버가 나타남 |
| `motionPreset.exit` | 120ms · `exit` · 줄이기 `instant` | `--hjm-motion-fast` | `motionPreset.exit` | 사라짐(나타남보다 짧게) |
| `motionPreset.context` | 320ms · `emphasized` · 줄이기 `opacity` | `--hjm-motion-slow` | `motionPreset.context` | 화면 맥락이 바뀌는 큰 전환 |

줄이기 값: `instant` 즉시 바뀜, `opacity` 이동 없이 투명도만, `static` 움직임 없음.

### 길이·곡선·스프링

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `motion.fast` | 120ms | `--hjm-motion-fast` | `motion.fast` | 작은 상태 변화 |
| `motion.normal` | 200ms | `--hjm-motion-normal` | `motion.normal` | 나타남 |
| `motion.slow` | 320ms | `--hjm-motion-slow` | `motion.slow` | 큰 전환 |
| `easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | — | `easing.standard` | 화면 안 이동 |
| `easing.enter` | `cubic-bezier(0, 0, 0, 1)` | — | `easing.enter` | 들어옴(감속) |
| `easing.exit` | `cubic-bezier(0.3, 0, 1, 1)` | — | `easing.exit` | 나감(가속) |
| `easing.emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | — | `easing.emphasized` | 강조 전환 |
| `spring.responsive` | stiffness 760 · damping 52 · mass 1 | — | `spring.responsive` | 손을 따라가는 빠른 스프링(Native) |
| `spring.expressive` | stiffness 520 · damping 38 · mass 1 | — | `spring.expressive` | 튀는 느낌의 스프링(Native) |

Web의 `--hjm-motion-*`는 동작 줄이기가 켜지면 `0ms`가 된다. Native 경로의 이름은 `@hjmds/design-contracts/foundations` import다.

## 쓰는 법

```tsx
// Web
import { easing, motionPreset } from "@hjmds/design-contracts/foundations";

// 제품 CSS: .product-chip { transition: background-color var(--hjm-motion-fast); }
const enter = motionPreset.enter;
const transition = `opacity ${enter.duration}ms cubic-bezier(${easing[enter.easing].join(", ")})`;
```

```tsx
// Native
import { Animated } from "react-native";
import { Easing } from "react-native";
import { easing, motionPreset } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";

const { environment } = useHjmNativeTheme();
const enter = motionPreset.enter;
Animated.timing(value, {
  toValue: 1,
  duration: environment.reducedMotion ? 0 : enter.duration,
  easing: Easing.bezier(...easing[enter.easing]),
  useNativeDriver: true,
}).start();
```

Web에서 JS로 직접 움직일 때는 `useHjmTheme().environment.reducedMotion`을 확인한다.

## 하지 말 것

- 동작 줄이기를 무시하지 않는다. `reducedMotion`이 켜지면 프리셋의 줄이기 값대로 바꾼다.
- 300ms, `ease-in-out`처럼 토큰에 없는 길이·곡선을 쓰지 않는다.
- 사라짐을 나타남보다 길게 만들지 않는다.
- 반복 애니메이션으로 주의를 끌지 않는다. 로딩 표시(Spinner·Skeleton)는 컴포넌트가 맡는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 동작 줄이기 | `prefers-reduced-motion`을 Provider가 읽어 `--hjm-motion-*`를 `0ms`로, 루트에 `data-motion="reduced"` | `AccessibilityInfo`를 Provider가 읽어 `environment.reducedMotion`. 첫 프레임은 줄이기로 가정 |
| 곡선 | `cubic-bezier(...)` | `Easing.bezier(...)` |
| 스프링 | 쓰지 않음 | `spring.*` |

프로필 선택 이동 (미게시, 1.14.0 이후):

`designProfile.interactions.selectionMotion`은 SegmentedControl과 appearance를 생략한
[Tabs](../components/tabs.md)에 연결된다. Tabs의 `slide`는 `motion.normal` 200ms·
`easing.standard`로 측정한 표시선만 이동한다. 명시 `gooey`의 기존 320ms 늘어남과 구분한다.
프로필은 선택 값·패널 수명·제품 초안을 결정하지 않는다. 동작 줄이기와 배경 상태에서는
선택 위치로 즉시 정리한다. 원본 대조에서 발견한 누락과 플랫폼 검증 범위는
[채택 판단](../../../../../docs/plans/aceternity-interaction-adoption-2026-10-07.md)에 남겼다.
