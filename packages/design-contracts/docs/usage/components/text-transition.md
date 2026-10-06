# TextTransition

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/content-transition.ts`(`resolveContentTransition`). 독립 계약 문서 없음(supplemental)
- 스토리북: `배포/컴포넌트/시각 효과/내용 전환`, `배포/구성/직접 조작과 모션/끌기·밀기·화면 전환`

## 언제 쓰나

같은 자리의 짧은 문자열이 바뀔 때(상태 문구, 버튼 옆 안내, 단계 이름) 바뀐 순간을 짧은
등장 모션으로 알린다. 글자 단위로 쪼개지 않고 문자열 전체를 한 번에 바꿔, 줄바꿈·선택·
스크린리더 낭독이 한 값으로 유지된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 문자열이 아니라 패널·영역 전체가 바뀜 | `ContentTransition`(같은 subpath, 아래 표) — [ContentTransition](content-transition.md) |
| 숫자 값이 바뀌는 통계 | [Statistic](statistic.md) |
| 읽어 줘야 하는 결과 알림 | [Toast](toast.md), [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TextTransition` | 기본(문자열 전환) | `/content-transition` | `/content-transition` |
| `ContentTransition` | 동반(하위 트리 전환, TextTransition의 기반) | `/content-transition` | `/content-transition` |

root에서는 내보내지 않는다. granular subpath로만 가져온다.

| renderer | 필요한 peer(`peerDependenciesMeta` optional) |
| --- | --- |
| Web | `framer-motion` 13.4.4 (subpath가 직접 import 한다) |
| Native | 없음. RN `Animated`만 쓴다 |

## 최소 사용 예

```tsx
// Web
import { TextTransition } from "@hjmds/react/content-transition";

// 상태 → i18n 키 상수 표. 키를 템플릿 문자열로 만들지 않는다.
const uploadStatusKey = {
  uploading: "upload.status.uploading",
  processing: "upload.status.processing",
  done: "upload.status.done",
} as const;

<TextTransition text={t(uploadStatusKey[phase])} preset="rise" />
```

```tsx
// Native
import { TextTransition } from "@hjmds/react-native/content-transition";

const uploadStatusKey = {
  uploading: "upload.status.uploading",
  processing: "upload.status.processing",
  done: "upload.status.done",
} as const;

<TextTransition text={t(uploadStatusKey[phase])} preset="rise" />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `text`(필수) | 문자열 | — | 바뀔 때마다 전환한다. 같은 문자열이면 아무것도 하지 않는다 |
| `preset` | `fade` · `rise`(아래 12에서) · `slide`(가로 16, RTL이면 반대) · `scale`(0.96에서) | `fade` | — |
| `motion` | `system` · `none` | `system` | `system`이어도 provider의 reduced motion이면 즉시 바뀐다 |
| `layoutStyle`(Web) | `HjmCompositionStyleProp` | — | 바깥 `<div>` 배치. Native에는 없다 |
| `ContentTransition` `stateKey`·`children` | `string`·`ReactNode` | — (필수) | `stateKey`가 바뀔 때 하위 트리를 전환한다 |
| `ContentTransition` `focusTarget`(Web) | `RefObject<HTMLElement \| null>` | — | 전환 전 포커스가 바뀌는 하위 트리 안에 있었으면 전환 뒤 이 요소로 포커스를 옮긴다 |

첫 렌더에는 모션이 없다. 길이는 `motion.normal`, 곡선은 `easing.enter`(foundations).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 바깥 여백·크기 prop이 없다. 높이는 새 문자열에 맞춰 즉시 바뀐다(높이 보간 없음). 자리를 고정하려면 부모에 최소 높이를 준다 | `react/src/content-transition.tsx`, `react-native/src/content-transition.tsx` |
| 간격 | 위치와 이웃 간격은 감싸는 [Stack](stack.md) 등의 `gap`으로 준다 | — |
| 순서·정렬 | 블록 요소다(Web `<div>` 두 겹, Native `Animated.View`). 문장 중간에 인라인으로 끼우지 않고 한 줄(또는 한 덩어리)로 둔다 | `react/src/content-transition.tsx`, `react-native/src/content-transition.tsx` |
| 고정·스크롤 | 이동량은 `rise` 세로 12, `slide` 가로 16이다. 부모가 `overflow: hidden`이면 시작 위치가 잘려 보일 수 있다 | `design-contracts/src/content-transition.ts` |
| 좁은 폭·큰 글자 | 좁은 폭에서 문구 길이 차이로 줄 수가 바뀌면 아래 요소가 튄다(크기 행 참고) | `react/src/content-transition.tsx` |

## 꼭 지킬 것

- 문자열은 i18n 키로 만든 최종 문구를 넘긴다. 글자 수 변화를 노린 연출용으로 쓰지 않는다.
- 글자 모양 prop은 없다. 글자 모양은 감싸는 쪽이 정한다(아래 플랫폼 차이). Web은 `layoutStyle`로 배치만 하고, Native는 배치 prop이 없어 감싸는 쪽이 배치한다.
- Web에서 이 subpath를 쓰려면 앱에 `framer-motion`을 설치한다. 없으면 import 시점에 실패한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 글자 렌더 | `<div>` 안의 맨 텍스트(부모 글꼴 상속) | HJM `Text`로 감싼다 |
| 전환 방식 | `stateKey`로 키를 바꿔 새 노드를 마운트 | 같은 노드의 opacity·transform 보간 |
| 백그라운드 | 해당 없음 | 앱이 active가 아니면 전환 없이 즉시 표시 |
| `layoutStyle` | 있음 | 없음 |
