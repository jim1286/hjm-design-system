# KeyboardAvoiding 사용 지침

적용: `@hjmds/react-native` 1.12.1 (Native 전용, 별도 보조 기능) · 검토일: 2026-10-06 ·
계약: [Native platform](../native-platform.md#키보드-회피), 판정 `resolveKeyboardInset`(`src/native-platform.ts`)

## 언제 쓰나

추가 native peer 없이 하단 행동(BottomCTA, 채팅 입력창)이 소프트웨어 키보드에 가려지지 않게 할 때 쓴다.
키보드가 뜨면 측정한 높이만큼 아래 여백을 늘리고, 내려가면 safe area 여백만 남긴다.
`react-native-keyboard-controller`를 설치하지 않은 앱의 기본 선택이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| keyboard-controller를 설치한 앱에서 하단 행동을 키보드에 붙여 움직임 | [KeyboardDock](keyboard-dock.md) |
| 입력이 여러 개인 스크롤 폼에서 포커스된 필드를 보이게 | [KeyboardFormScrollView](keyboard-form-scroll-view.md) |
| keyboard-controller 어댑터를 쓰기 위한 앱 루트 설정 | [KeyboardMotionProvider](keyboard-motion-provider.md) |
| Sheet 안의 입력 | [Sheet](sheet.md)의 `keyboardAvoidance` (시트가 여백을 소유) |
| Web | 해당 없음. Web에는 이 문제와 계약이 없다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `KeyboardAvoiding` | 없음 | `@hjmds/react-native`, `/keyboard` | 기본 |
| `resolveKeyboardAvoidanceBehavior` | 없음 | 같은 entry | 플랫폼별 `KeyboardAvoidingView` behavior 판정 함수 |

추가 peer가 필요 없다.

## 최소 사용 예

Web 구현은 없다.

```tsx
// Native
import { KeyboardAvoiding } from "@hjmds/react-native/keyboard";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";

<KeyboardAvoiding safeAreaBottom={insets.bottom}>
  <BottomCTA primaryAction={{ label: t("signup.next"), onPress: next }} />
</KeyboardAvoiding>
```

## 축과 기본값

- `offset`: 키보드 위에 남길 여백. 기본 `spacing.sm`(12).
- `safeAreaBottom`: 하단 safe area 값. 기본 0. 키보드가 닫혀 있으면 이 값만큼, 열려 있으면 키보드 높이 + `offset`
  만큼 아래 여백을 준다. safe area는 한 번만 센다.
- `style`: 감싸는 `View`의 스타일. renderer가 주는 `paddingBottom` 뒤에 합쳐진다.

## 꼭 지킬 것

- 같은 내용을 다른 키보드 회피 래퍼(`KeyboardAvoidingView`, KeyboardDock, 호스트 어댑터)와 겹쳐 감싸지 않는다.
  ChatScreen도 이 래퍼나 호스트 어댑터 중 하나만 쓴다.
- safe area 여백을 안쪽 컴포넌트(BottomCTA `safeAreaBottom` 등)와 이 래퍼에 동시에 주지 않는다. 한 곳에서만 센다.
- `style`로 `paddingBottom`을 덮으면 키보드 여백이 사라진다. 배치 외 값을 넣지 않는다.

## 함정

- `KeyboardAvoidingView`가 아니다. 플랫폼과 무관하게 키보드 이벤트로 잰 높이를 `paddingBottom`으로 준다
  (iOS는 `keyboardWillChangeFrame`, Android는 `keyboardDidShow`). `resolveKeyboardAvoidanceBehavior`는
  제품이 RN `KeyboardAvoidingView`를 직접 쓸 때를 위한 판정이며 이 컴포넌트는 그 값을 쓰지 않는다.
- 이 래퍼는 아래 여백만 늘린다. 스크롤 안의 포커스된 필드를 보이는 곳으로 옮겨 주지 않는다.
