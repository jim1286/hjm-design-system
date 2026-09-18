# Native platform contract (keyboard · haptics)

React Native 화면이 매번 다시 풀던 두 가지를 계약으로 올렸다. 컴포넌트가 아니라 어휘와
판정이다.

## 키보드 회피

폼이 있는 모든 RN 화면이 `KeyboardAvoidingView`의 `behavior`를 각자 고르고, BottomCTA가
키보드에 가려지는 것을 각자 발견했다. **정답이 플랫폼별로 고정돼 있는데** 그 지식이
제품마다 흩어져 있었다.

- iOS는 키보드가 화면 위로 떠오르므로 `padding`, Android는 창이 줄어드는 `adjustResize`가
  기본이라 `height`. `resolveKeyboardAvoidanceBehavior(platform)`이 그 표다.
- **safe area는 한 번만 센다.** 키보드가 떠 있으면 홈 인디케이터 여백은 키보드가 가리므로
  다시 더하면 두 겹이 된다 — `resolveKeyboardInset`이 그 계산을 갖는다.
- `@hjmds/react-native/keyboard`의 `KeyboardAvoiding`이 이 판정을 적용한다.

## 햅틱

"성공하면 울린다"는 제품 결정이지만 **어떤 세기가 어떤 의미인가**는 디자인 시스템의
어휘다. 없으면 한 앱 안에서 저장은 무겁고 삭제는 가벼운 식으로 뒤섞인다.

| intent | 언제 |
| --- | --- |
| `selection` | 선택이 바뀌었다 — 세그먼트, 토글, 슬라이더 눈금 |
| `success` | 되돌릴 수 있는 행동이 끝났다 — 저장, 담기 |
| `warning` | 사용자가 고쳐야 한다 — 검증 실패 |
| `error` | 되돌릴 수 없는 일 — 삭제 확정, 결제 실패 |

**울리지 않아야 할 때가 계약의 절반이다.** 사용자가 시작하지 않은 변화(서버 푸시로 목록이
바뀌는 것)에는 울리지 않는다 — 빼먹으면 주머니 속 기기가 이유 없이 떨린다.
**Reduce Motion은 진동을 끄지 않는다** — 화면 움직임 설정과 촉각 설정은 다르고, 모션을 끈
사용자에게는 진동이 유일한 확인 신호일 수 있다.

**네이티브 모듈은 들이지 않는다.** 실제 진동은 제품이 자기 햅틱 라이브러리로 실행하고,
HJM은 "울릴지"와 "무슨 뜻인지"만 정한다.
