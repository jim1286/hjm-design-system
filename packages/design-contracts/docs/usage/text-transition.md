# TextTransition 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
분류: 별도 보조 기능(supplemental). 독립 계약 문서는 없고 전환 값은
`@hjmds/design-contracts/content-transition`(`resolveContentTransition`)이 정한다.

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `TextTransition` | `/content-transition` | `/content-transition` | 문자열 전환 |
| `ContentTransition` | `/content-transition` | `/content-transition` | 하위 트리 전환(TextTransition의 기반) |

root에서는 내보내지 않는다. granular subpath로만 가져온다.

| renderer | 필요한 peer(`peerDependenciesMeta` optional) |
| --- | --- |
| Web | `framer-motion` 13.4.4 (subpath가 직접 import 한다) |
| Native | 없음. RN `Animated`만 쓴다 |

## 최소 사용 예

```tsx
// Web
import { TextTransition } from "@hjmds/react/content-transition";

<TextTransition text={t(`upload.status.${phase}`)} preset="rise" />
```

```tsx
// Native
import { TextTransition } from "@hjmds/react-native/content-transition";

<TextTransition text={t(`upload.status.${phase}`)} preset="rise" />
```

## 축과 기본값

- `text`(필수): 바뀔 때마다 전환이 일어난다. 같은 문자열이면 아무것도 하지 않는다.
- `preset`: `fade`(기본) · `rise`(아래 12에서) · `slide`(가로 16, RTL이면 반대) · `scale`(0.96에서).
- `motion`: `system`(기본) · `none`. `system`이어도 provider의 reduced motion이면 즉시 바뀐다.
- 첫 렌더에는 모션이 없다. 길이는 `motion.normal`, 곡선은 `easing.enter`(foundations).

## 꼭 지킬 것

- 문자열은 i18n 키로 만든 최종 문구를 넘긴다. 글자 수 변화를 노린 연출용으로 쓰지 않는다.
- 스타일·배치 prop은 없다. 글자 모양은 감싸는 쪽이 정한다(아래 플랫폼 차이).
- Web에서 이 subpath를 쓰려면 앱에 `framer-motion`을 설치한다. 없으면 import 시점에 실패한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 글자 렌더 | `<div>` 안의 맨 텍스트(부모 글꼴 상속) | HJM `Text`로 감싼다 |
| 전환 방식 | `stateKey`로 키를 바꿔 새 노드를 마운트 | 같은 노드의 opacity·transform 보간 |
| 백그라운드 | 해당 없음 | 앱이 active가 아니면 전환 없이 즉시 표시 |
