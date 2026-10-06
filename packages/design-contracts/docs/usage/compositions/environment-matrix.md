# 환경 조합 검증

- 단계: 구성
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [HJM Showcase · 환경 도구](../../showcase.md#환경-도구), [DesignSystemProvider](../../design-system-provider.md), `src/showcase.ts`(`showcaseEnvironmentMatrix`, `showcaseScenarios`, `getShowcaseEnvironmentInput`), `showcase/web/src/patterns/EnvironmentMatrix.stories.tsx`, `showcase/web/.storybook/preview.tsx`, `showcase/native/.rnstorybook/preview.tsx`
- 스토리북: `배포/구성/비교와 검증/환경 조합 검증`

## 언제 쓰나

제품 화면이 테마·쓰기 방향·글자 크기·모션 설정이 달라져도 같은 의미를 유지하는지 확인할 때, 어떤 환경 조합과 검증 항목을 골라 볼지 정하는 기준표로 쓴다.

이 스토리는 UI 조립 예가 아니라 비교 기준 모음이다. 모든 조합(곱)을 보지 않고, 위험이 큰 차이를 잡는 다섯 환경과
컴포넌트가 통과해야 하는 열한 가지 검증 항목을 보여 준다. Native showcase에는 이 스토리가 없고, Native Storybook toolbar가
같은 네 축(theme·direction·textScale·reducedMotion)을 `HjmNativeProvider`에 넘긴다(`showcase/native/.rnstorybook/preview.tsx`).

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `showcaseEnvironmentMatrix` | 다섯 환경 프리셋(테마·방향·글자 배율·모션) | [Showcase](../../showcase.md) |
| `showcaseScenarios` | 검증 항목 열한 개(id·이름·설명) | [Showcase](../../showcase.md) |
| `getShowcaseEnvironmentInput` | 프리셋을 Provider 입력(`theme`·`direction`·`textScale`·`reducedMotion`)으로 변환 | [DesignSystemProvider](../components/design-system-provider.md) |
| `HjmProvider`(Web)·`HjmNativeProvider`(Native) | 제품에서 환경 축을 실제로 바꾸는 곳 | [DesignSystemProvider](../components/design-system-provider.md) |

모두 `@hjmds/design-contracts/showcase`에서 import한다. 스토리의 `hjm-page`·`hjm-showcase-grid`·`hjm-showcase-card` 클래스는 showcase 전용 스타일이다.

## 배치

```text
┌ 바깥 틀: 검증 대상 제품 화면 그대로 ─────────────────────┐
│ HjmProvider / HjmNativeProvider (환경 입력만 바꾼다)      │
│ ┌ 제품 화면(스크롤·Container·안전 영역은 화면 소유) ───┐ │
│ │ …                                                     │ │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘

스토리 페이지(참고, showcase 전용 스타일)
┌──────────────────────────────────────────────────────────┐
│ Patterns / Evidence matrix / 안내                        │
│ ┌ Environment presets (카드 격자) ─────────────────────┐ │
│ │ [default] [dark] [large-text] [rtl] [reduced-motion] │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌ Story requirements (카드 격자) ──────────────────────┐ │
│ │ [Contract] [Default] [Dark] [Long copy] [200% text]  │ │
│ │ [RTL] [Reduced motion] [Accessibility] [Keyboard]    │ │
│ │ [Native actions] [Web / Native parity]               │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
  상단 Storybook toolbar: light/dark · LTR/RTL · 100/150/200% · full/reduced
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | `HjmProvider`(Web)·`HjmNativeProvider`(Native) | 검증할 제품 화면의 맨 바깥. 화면의 스크롤·`Container`·안전 영역은 바꾸지 않는다 | 환경 입력만 바꾼다. 여백·크기는 제품 화면 값 그대로. Native는 `safeAreaInsets`도 실제 기기 값으로 넘긴다 |
| 환경 프리셋 | `showcaseEnvironmentMatrix` 카드 5개 | 스토리 첫 섹션 | showcase 전용 격자(제품 기준 아님) |
| 검증 항목 | `showcaseScenarios` 카드 11개 | 스토리 둘째 섹션 | showcase 전용 격자 |
| 환경 전환 | Storybook toolbar | 페이지 밖 상단 | — |

### 비교하는 다섯 환경

| id | 테마 | 방향 | 글자 배율 | 모션 |
| --- | --- | --- | --- | --- |
| `default` | light | LTR | 1 | full |
| `dark` | dark | LTR | 1 | full |
| `large-text` | light | LTR | 2 | full |
| `rtl` | light | RTL | 1 | full |
| `reduced-motion` | light | LTR | 1 | reduced |

근거: `src/showcase.ts`

## 흐름과 상태

1. 제품 화면을 `default`에서 먼저 확인한다.
2. 한 축씩 바꿔 `dark` → `large-text` → `rtl` → `reduced-motion` 순으로 본다. 한 번에 한 축만 바꿔야 원인이 갈린다.
3. 각 환경에서 아래 검증 항목 중 화면에 해당하는 것을 확인한다.
4. 제품에서 같은 조건을 재현할 때는 `getShowcaseEnvironmentInput(preset)`의 결과를 `HjmProvider`·`HjmNativeProvider`에 넘긴다.
5. 실패한 항목은 환경 id·검증 항목 id와 함께 기록하고, 고친 뒤 같은 환경에서 다시 본다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | `default` 환경(light·LTR·1배·full motion)의 제품 화면 | — |
| 진행 중 | — (검증 기준표라 진행 상태가 없다. 화면 자체의 로딩 상태는 각 환경에서 따로 확인한다) | — |
| 실패 | 검증 항목 하나라도 어긋나면 그 환경·항목을 기록한다. 화면의 네트워크·서버 실패 상태도 각 환경에서 한 번 띄워 본다 | — |
| dark | 의미 색이 어두운 테마에서도 읽힌다 | — |
| 200% 글자 | 필수 정보가 잘리지 않고 줄바꿈된다 | — |
| RTL | 논리 시작·끝 배치와 방향 아이콘이 뒤집힌다 | — |
| 모션 줄이기 | recipe의 reduced-motion 대체 동작을 쓴다 | — |
| 긴 문구 | 한국어·영어 긴 문구가 잘리거나 의미를 숨기지 않는다 | — |
| 접근성·키보드 | 이름·상태·관계·대비·터치 영역 확인, 문서화된 키보드 동작·Native host action 실행 | 포커스 순서 확인 |

소비자가 고를 기준: 화면에 입력·탐색이 있으면 접근성·키보드(Native는 Native actions)까지, 문구가 바뀌는 화면이면 긴 문구와 200% 글자를,
아이콘·방향 의존 배치가 있으면 RTL을, 전환·제스처가 있으면 모션 줄이기를 반드시 포함한다. Web·Native가 같은 DOM/view를 만들 필요는 없고,
같은 의미·상태 전환·접근성 결과를 내면 된다.

## 코드 골격

```tsx
// Web
import { showcaseEnvironmentMatrix, getShowcaseEnvironmentInput } from "@hjmds/design-contracts/showcase";
import { HjmProvider } from "@hjmds/react/provider";

const preset = showcaseEnvironmentMatrix.find((env) => env.id === "large-text")!;
<HjmProvider {...getShowcaseEnvironmentInput(preset)}>
  <ProductScreen />
</HjmProvider>
```

```tsx
// Native
import { showcaseEnvironmentMatrix, getShowcaseEnvironmentInput } from "@hjmds/design-contracts/showcase";
import { HjmNativeProvider } from "@hjmds/react-native/provider";

const preset = showcaseEnvironmentMatrix.find((env) => env.id === "rtl")!;
<HjmNativeProvider {...getShowcaseEnvironmentInput(preset)}
  safeAreaInsets={insets /* react-native-safe-area-context useSafeAreaInsets() */}>
  <ProductScreen />
</HjmNativeProvider>
```

이 코드는 테스트·검증 화면용이다. 실제 앱은 환경 축을 지정하지 않고 OS 신호를 따르게 둔다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이 스토리 | 있음 | 없음(Native Storybook toolbar가 같은 네 축을 Provider에 넘긴다) |
| 글자 배율 | toolbar 100·150·200% | Provider `textScale`을 명시하면 HJM이 한 번만 적용(OS 배율과 곱하지 않음) |
| 키보드 검증 | DOM 키 바인딩 | host 접근성 action(`native-actions`) |
| 안전 영역 | 브라우저 | Provider `safeAreaInsets` |

## 함정

- 현재 스토리는 HJM 컴포넌트 대신 `hjm-page`·`hjm-showcase-card` 같은 showcase 전용 클래스의 HTML(`h1`·`article`)과 영어 제목을 쓴다. 제품 검증 화면을 만들 때 이 마크업을 따라 하지 않는다(제목은 [Heading](../components/heading.md), 문구는 i18n 키).
- `getShowcaseEnvironmentInput`의 결과는 펼쳐서(`{...input}`) 넘긴다. 필드를 하나씩 꺼내 넘기면 optional 타입 때문에
  `exactOptionalPropertyTypes`에서 TS2375가 난다(Web·Native 같다).
- 검증용 Provider로 화면을 감쌀 때 바깥 틀(스크롤·Container·안전 영역)을 따로 바꾸면 실제 화면과 다른 것을 검증하게 된다.
