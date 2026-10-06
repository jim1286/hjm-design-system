# Celebration

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `celebrationRecipe`(`src/interaction-adapters.ts`), 승격 기록 [Stable Core](../../stable-core.md)
- 스토리북: `배포/구성/직접 조작과 모션/끌기·밀기·화면 전환`

## 언제 쓰나

목표 달성, 첫 완료처럼 드물게 일어나는 성공 순간에 한 번 터지는 색종이 효과에 쓴다.
장식이라 화면 리더에는 보이지 않으며, 성공 사실 자체는 다른 요소가 전달해야 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 저장·전송 같은 일상 성공 알림 | [Toast](toast.md) |
| 흐름의 끝을 알리는 완료 화면 | [Result](result.md) |
| 반복·지속되는 배경 효과 | [EffectSurface](effect-surface.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Celebration` | 기본(별도 보조 기능, supplemental) | `/celebration` | `/celebration` |

root에서 export되지 않고 `@hjmds/react/celebration`, `@hjmds/react-native/celebration`으로만 import 된다.
optional peer가 필요하다.

- Web: `canvas-confetti`
- Native: `react-native-fast-confetti`와 그 peer `@shopify/react-native-skia`·`react-native-reanimated`·
  `react-native-worklets`. 네 패키지 모두 앱에 설치돼 있어야 한다.

## 최소 사용 예

```tsx
// Web
import { Celebration } from "@hjmds/react/celebration";

{goal.completedEventId ? (
  <Celebration eventId={goal.completedEventId} preset="milestone" onComplete={clearEvent} />
) : null}
```

```tsx
// Native
import { Celebration } from "@hjmds/react-native/celebration";

{eventId ? <Celebration eventId={eventId} onComplete={() => setEventId(null)} /> : null}
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `preset` | `small-burst`(입자 32개·1.6초) · `milestone`(64개·2.4초) | `small-burst` | — |
| `eventId` | 비지 않은 문자열 | 필수 | 같은 인스턴스에서 같은 id는 한 번만 터진다. 다시 터뜨리려면 새 id를 준다. 빈 문자열은 `TypeError` |
| `onComplete` | `() => void` | — | 그리기가 끝났거나 그리지 않기로 했을 때 한 번 불린다. 인자가 없다 |
| 입자 색 | — | 테마 primary + 상태 강조색 네 개 | 색 prop은 없고 제품 테마로만 바뀐다 |
| `layoutStyle` | 없음 | — | Web `layoutStyle` 제외 15개 중 하나다. 전체 화면 층이라 배치 prop이 없다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web은 뷰포트 전체를 덮는 canvas(`position: fixed; inset: 0`), Native는 부모를 채우는 `StyleSheet.absoluteFill` View다. Native에서 화면 전체에 터뜨리려면 화면 루트 View의 마지막 자식으로 둔다 | `react/src/celebration.tsx`, `react-native/src/celebration.tsx` |
| 간격 | 레이아웃 공간을 차지하지 않는다. 이웃 간격에 영향이 없다 | 같은 파일 |
| 순서·정렬 | 성공을 알리는 Toast·Result·문구와 함께 렌더하고 Celebration은 그 위에 겹친다. Web canvas는 z-index를 지정하지 않으므로 z-index가 있는 층(BottomNavigation `layer.sticky` 100, 오버레이 `layer.modal` 900) 아래에 그려질 수 있다 | `react/src/celebration.tsx`, `.hjm-bottom-navigation`, `.hjm-overlay` |
| 고정·스크롤 | 누름을 막지 않는다(`pointer-events: none`). Web은 스크롤과 무관하게 화면에 고정되고, Native는 부모와 함께 움직인다 | 같은 파일 |
| 좁은 폭·큰 글자 | 영향 없음. reduced motion에서는 그리지 않는다 | `react-native/src/celebration.tsx`(`environment.reducedMotion`) |

## 꼭 지킬 것

- 성공 사실은 Toast·Result·문구로 따로 알린다. Celebration은 `aria-hidden`이라 아무것도 낭독하지 않는다.
- reduced motion, 숨은 탭(Web), 백그라운드 앱(Native)에서는 그리지 않고 바로 `onComplete`를 부른다.
  `onComplete`를 "애니메이션을 봤다"는 근거로 쓰지 않는다.
- 위에 덮이는 전체 화면 층이라 누름을 막지 않는다. 배치 prop(`style`·`layoutStyle`)은 없다(Web `layoutStyle` 제외 목록).
- Web은 `HjmProvider` 안에서만 쓴다(`useHjmTheme`가 Provider 밖에서 던진다).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그리는 곳 | `position: fixed` 전체 화면 canvas | 부모를 채우는 absolute View |
| 종료 시점 | preset 시간 뒤 | 엔진의 끝 콜백, 시작 실패 시 5초 상한 |

## 함정

- 2026-10 utilverse에서 `@hjmds/react-native/celebration`을 쓰면서 `react-native-fast-confetti`를 설치하지 않았다.
  tsc·lint·단위 테스트는 모두 통과했지만 기기 Metro가 "Unable to resolve module"로 크래시했다.
  타입 검사는 `.d.ts`만 보고 테스트는 이 파일을 불러오지 않기 때문이다. 쓰기 전에 위 peer가 모두 설치됐는지
  확인하고, 기기 번들로 한 번 열어 본 뒤 통과를 보고한다. 같은 위험이 effect-surface·qr-code·thinking-orb·
  toast-liquid subpath에도 있다.
