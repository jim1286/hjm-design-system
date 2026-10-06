# Celebration 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `celebrationRecipe`(`src/interaction-adapters.ts`), 승격 기록 [Stable Core](../stable-core.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Celebration` | `/celebration` | `/celebration` | 별도 보조 기능(supplemental) |

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

- `preset`: `small-burst`(기본, 입자 32개·1.6초) · `milestone`(64개·2.4초).
- `eventId`: 같은 인스턴스에서 같은 id는 한 번만 터진다. 다시 터뜨리려면 새 id를 준다. 빈 문자열은 `TypeError`.
- 입자 색은 테마의 primary와 상태 강조색 네 개다. 색 prop은 없고 제품 테마로만 바뀐다.

## 꼭 지킬 것

- 성공 사실은 Toast·Result·문구로 따로 알린다. Celebration은 `aria-hidden`이라 아무것도 낭독하지 않는다.
- reduced motion, 숨은 탭(Web), 백그라운드 앱(Native)에서는 그리지 않고 바로 `onComplete`를 부른다.
  `onComplete`를 "애니메이션을 봤다"는 근거로 쓰지 않는다.
- 위에 덮이는 전체 화면 층이라 누름을 막지 않는다. 배치 prop(`style`·`layoutStyle`)은 없다.

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
