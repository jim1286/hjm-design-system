# ThinkingOrb

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [ThinkingOrb](../../thinking-orb.md), `src/thinking-orb-recipe.ts`(`thinkingOrbRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/생각 중 표시`

## 언제 쓰나

AI 에이전트가 실제로 검색·생성·듣기 같은 작업을 하는 동안 그 단계를 보여 줄 때만 쓴다.
상태(`state`)는 앱이 실제 작업 단계에서 넘긴다. orb가 진행률을 흉내 내지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 로딩·대기 | [Spinner](spinner.md) |
| 진행률을 아는 작업 | [Progress](progress.md) |
| 콘텐츠 자리 표시 | [Skeleton](skeleton.md) |
| 완료·오류 결과 | [Result](result.md), [Toast](toast.md) — orb를 결과 UI로 교체한다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ThinkingOrb` | 기본(root에서는 내보내지 않는다) | `/thinking-orb` | `/thinking-orb` |

granular subpath로만 가져온다. Native subpath는 optional native peer를 직접 import 한다.

| renderer | 필요한 peer(`peerDependenciesMeta` optional) |
| --- | --- |
| Web | 없음(Canvas 2D) |
| Native | `@shopify/react-native-skia` ^2.6.2, `react-native-reanimated` ^4.5.1와 그 전제 `react-native-worklets` ^0.10.1. 모두 native 모듈이라 설치 후 dev client를 다시 빌드한다 |

계약 문서가 검증 대상으로 적은 조합은 Expo 57 / RN 0.86.2다. 기본 패키지의 `react-native >=0.81`
범위가 이 subpath의 지원을 보장하지 않는다.

## 최소 사용 예

```tsx
// Web
import { ThinkingOrb } from "@hjmds/react/thinking-orb";

<ThinkingOrb state="searching" label={t("agent.searching")} />
```

```tsx
// Native
import { ThinkingOrb } from "@hjmds/react-native/thinking-orb";

<ThinkingOrb state="searching" size={20} label={t("agent.searching")} active={isFocused} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `state` | `working` · `searching` · `solving` · `listening` · `connecting` · `weaving` · `composing` · `breathing` · `shaping` | `working` | `listening`은 음성 크기 시각화가 아니다 |
| `appearance` | `state`(상태별 기하) · `fluid` · `matrix` | `state` | — |
| `size` | `64` · `20` | `64` | 다른 값은 `RangeError` |
| `label`(필수) | 번역된 현재 작업 설명 | — | 비거나 공백이면 `TypeError` |
| `speed` | 0 초과 4 이하 | `1` | — |
| `paused` | `boolean` | `false` | — |
| `active` | `boolean` | `true` | — |
| `layoutStyle`(Web) | `HjmCompositionStyleProp` | — | 바깥 요소 배치. `style`과 겹치면 `layoutStyle`이 이긴다 |
| `style` | Web `CSSProperties`, Native `StyleProp<ViewStyle>` | — | Native는 `layoutStyle`이 없어 `style`이 배치 통로다(optional motion host frame이라 deprecated 대상에서 빠졌다). 배치 key만 넣는다 |

색은 provider의 `text` 색을 깊이별 opacity로 쓴다. 색 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 정사각형 고정 크기 `size` 20 또는 64. 안쪽·바깥 여백이 없다. 누를 수 없는 표시라 터치 영역 요구가 없다 | `thinkingOrbRecipe`(`sizes: [20, 64]`) |
| 간격 | 문구와 나란히 둘 때 간격은 감싸는 [Stack](stack.md)의 `gap`(예: `spacing.xs` 8)으로 준다 | — |
| 순서·정렬 | 20은 작업 문구 한 줄과 나란히, 64는 영역 가운데 단독으로 둔다. Web 바깥 요소는 `inline-flex`라 글줄 안에도 놓인다. 버튼 안 로딩 표시로 쓰지 않는다(버튼은 `loading`). 작업이 끝나면 같은 자리를 결과 UI로 바꾸고 orb와 결과를 함께 두지 않는다 | `react/src/thinking-orb.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 큰 글자 설정에도 크기가 변하지 않는다 | `react/src/thinking-orb.tsx`, `react-native/src/thinking-orb.tsx` |

## 꼭 지킬 것

- Native에서는 탭·내비게이션·가상 목록에서 화면이 가려지면 `active={false}`를 넘긴다.
  mounted 상태로 숨은 화면은 AppState로 알 수 없어 계속 그린다.
- orb가 live region(Web `role="status"`, Native progressbar + `accessibilityLiveRegion`)이다.
  같은 문구를 옆에 또 보여 줄 때 그 문구에 live region을 중복으로 두지 않는다.
- 크기는 `size`로만 바꾼다. CSS·transform으로 확대하지 않는다.
- 배치는 Web `layoutStyle`, Native `style`로 하고 배치 key(margin·`alignSelf` 등)만 넣는다. Web `className`·`style`로 크기·색을 바꾸지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그리기 | Canvas 2D, 보이지 않으면(IntersectionObserver·문서 숨김) 정지 | Skia Picture, 백그라운드·`active=false`면 정지 |
| 모션 줄이기 | provider `reducedMotion` | provider 값 또는 OS 설정. OS 값을 읽기 전에는 정지 프레임으로 시작 |
| 접근성 | `role="status"` + 숨긴 텍스트 | `accessibilityRole="progressbar"`, `busy: true` |
| 추가 prop | `className`, `layoutStyle` | `testID`(`layoutStyle` 없음) |

## 함정

- 2026-10 소비 앱에서 이 subpath를 쓰면서 Skia·Reanimated 같은 optional native peer를
  설치하지 않아 tsc·테스트는 통과했는데 기기 Metro에서 크래시가 났다. 타입 검사는 peer 설치를
  증명하지 않는다. Native 채택 전에 위 peer를 앱 `package.json`에 넣고 설치 앱에서 실제로 그려지는지 확인한다.
