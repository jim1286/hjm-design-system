# KeyboardDock 사용 지침

적용: `@hjmds/react-native` 1.12.1 (Native 전용, 별도 보조 기능·실험) · 검토일: 2026-10-06 ·
계약: [Optional adapters](../optional-adapters.md#behavior-boundaries)

## 언제 쓰나

`react-native-keyboard-controller`를 설치한 앱에서 화면 하단에 고정된 행동(BottomCTA, 채팅 입력창)이
키보드와 함께 위아래로 움직이게 할 때 쓴다. 내부는 `KeyboardStickyView`이며, 여백을 바꾸는 대신
키보드 움직임을 따라 translate 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| keyboard-controller 없이 하단 행동을 키보드 위로 | [KeyboardAvoiding](keyboard-avoiding.md) |
| 입력이 여러 개인 스크롤 폼 본문 | [KeyboardFormScrollView](keyboard-form-scroll-view.md) (하단 버튼은 이 Dock과 함께) |
| 앱 루트 설정 | [KeyboardMotionProvider](keyboard-motion-provider.md) (먼저 필요) |
| Sheet 안의 입력 | [Sheet](sheet.md)의 `keyboardAvoidance` |
| Web | 해당 없음 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `KeyboardDock` | 없음 | `/keyboard-controller` | 하단 고정 행동을 키보드에 붙임 |

granular subpath로만 import 된다. 설치 조건(peer `react-native-keyboard-controller` 1.22.5, Reanimated·Worklets,
개발 클라이언트)과 루트 Provider는 [KeyboardMotionProvider](keyboard-motion-provider.md)를 따른다.

## 최소 사용 예

Web 구현은 없다.

```tsx
// Native — KeyboardMotionProvider 안
import { KeyboardDock } from "@hjmds/react-native/keyboard-controller";
import { Button } from "@hjmds/react-native/actions";

<KeyboardDock clearance={8}>
  <View style={{ paddingBottom: keyboardOpen ? 0 : insets.bottom }}>
    <Button onPress={submit} fullWidth>{t("form.done")}</Button>
  </View>
</KeyboardDock>
```

## 축과 기본값

- `enabled`: 기본 `true`. `false`면 따라 움직이지 않는다.
- `clearance`: 키보드 위 추가 간격(layout point). 기본 0. 음수나 유한하지 않은 값은 `TypeError`.
- `style`: 감싸는 sticky view 스타일.

## 꼭 지킬 것

- 하단 safe area는 호스트가 소유한다. 키보드가 열렸을 때 safe area 여백을 빼는 것도 호스트 몫이다
  (쇼케이스는 키보드 상태에 따라 `paddingBottom`을 `insets.bottom`과 0 사이에서 바꾼다).
- 같은 내용을 KeyboardAvoiding이나 다른 키보드 회피 래퍼로 또 감싸지 않는다.
- KeyboardMotionProvider 없이 쓰지 않는다.

## 함정

- sticky 좌표는 창 기준이다. Storybook 캔버스처럼 아래에 다른 막대가 있는 host에서는 위치가 어긋나므로
  쇼케이스도 앱 크기 host에서 확인한다.
- 실험 단계 어댑터다. 실제 키보드 애니메이션은 mock 테스트로 검증되지 않는다. 개발 클라이언트로 확인한다.
