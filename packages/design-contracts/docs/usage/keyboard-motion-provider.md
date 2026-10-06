# KeyboardMotionProvider 사용 지침

적용: `@hjmds/react-native` 1.12.1 (Native 전용, 별도 보조 기능·실험) · 검토일: 2026-10-06 ·
계약: [Optional adapters](../optional-adapters.md#installation)

## 언제 쓰나

`@hjmds/react-native/keyboard-controller` 어댑터(KeyboardDock, KeyboardFormScrollView)를 쓰는 앱의
루트에 **한 번** 설치한다. 내부는 `react-native-keyboard-controller`의 `KeyboardProvider`이며,
어댑터를 준비하려고 OS 키보드를 미리 띄우지 않도록 `preload={false}`로 고정돼 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| peer 없이 하단 행동만 키보드 위로 올림 | [KeyboardAvoiding](keyboard-avoiding.md) (Provider 불필요) |
| 하단 행동을 키보드에 붙여 움직임 | [KeyboardDock](keyboard-dock.md) (이 Provider 안에서) |
| 스크롤 폼의 포커스 필드 보이기 | [KeyboardFormScrollView](keyboard-form-scroll-view.md) (이 Provider 안에서) |
| HJM 테마·환경 설정 | [DesignSystemProvider](design-system-provider.md) (역할이 다르다) |
| Web | 해당 없음 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `KeyboardMotionProvider` | 없음 | `/keyboard-controller` | 앱 루트 provider |

granular subpath로만 import 된다(루트 entry에 없음). optional peer `react-native-keyboard-controller` 1.22.5와
`react-native-reanimated`(^4.5.1)·`react-native-worklets`(^0.10.1)를 앱에 설치해야 한다.
native 모듈이 연결된 개발 클라이언트가 필요하며 Expo Go로는 확인할 수 없다.

## 최소 사용 예

Web 구현은 없다.

```tsx
// Native — 앱 루트
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardMotionProvider } from "@hjmds/react-native/keyboard-controller";

<GestureHandlerRootView style={{ flex: 1 }}>
  <KeyboardMotionProvider>
    <AppNavigator />
  </KeyboardMotionProvider>
</GestureHandlerRootView>
```

`GestureHandlerRootView`는 쇼케이스 host 구성이며, 앱이 gesture 어댑터를 함께 쓸 때 필요하다.

## 축과 기본값

- prop은 `children` 하나뿐이다. `preload`는 `false`로 고정이며 바꿀 수 없다.

## 꼭 지킬 것

- 앱 루트에 한 번만 둔다. 입력 필드·CTA·화면마다 중첩하지 않는다.
- KeyboardDock·KeyboardFormScrollView는 이 Provider 바깥에 두지 않는다.
- 같은 앱에서 이 어댑터와 KeyboardAvoiding을 섞을 수는 있지만 같은 내용에 겹쳐 감싸지 않는다.

## 함정

- tsc·mock 테스트 통과는 peer 설치와 native 연결의 근거가 아니다. 다른 optional subpath
  (celebration·effect-surface·qr-code·thinking-orb·toast-liquid)에서 앱에 없는 peer 때문에
  기기 Metro에서만 크래시가 난 사례가 있다(2026-10). 개발 클라이언트로 실제 화면을 띄워 확인한다.
- 이 어댑터는 실험 단계다. 기기·보조기술 검증은 아직 없다([근거](../optional-adapters.md#evidence-and-promotion)).
