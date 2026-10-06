# KeyboardMotionProvider

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional adapters](../../optional-adapters.md#installation). 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/직접 조작과 모션/이미지·시트·키보드 조작`

## 언제 쓰나

`@hjmds/react-native/keyboard-controller` 어댑터(KeyboardDock, KeyboardFormScrollView)를 쓰는 앱의
루트에 **한 번** 설치한다(Native 전용, 별도 보조 기능. API 성숙도는 실험적 어댑터). 내부는 `react-native-keyboard-controller`의
`KeyboardProvider`이며, 어댑터를 준비하려고 OS 키보드를 미리 띄우지 않도록 `preload={false}`로 고정돼 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| peer 없이 하단 행동만 키보드 위로 올림 | [KeyboardAvoiding](keyboard-avoiding.md) (Provider 불필요) |
| 하단 행동을 키보드에 붙여 움직임 | [KeyboardDock](keyboard-dock.md) (이 Provider 안에서) |
| 스크롤 폼의 포커스 필드 보이기 | [KeyboardFormScrollView](keyboard-form-scroll-view.md) (이 Provider 안에서) |
| HJM 테마·환경 설정 | [DesignSystemProvider](design-system-provider.md) (역할이 다르다) |
| Web | 해당 없음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `KeyboardMotionProvider` | 기본 — 앱 루트 provider | — | `/keyboard-controller` |

granular subpath로만 import 된다(루트 entry에 없음). optional peer `react-native-keyboard-controller` 1.22.5와
`react-native-reanimated`(^4.5.1)·`react-native-worklets`(^0.10.1)를 앱에 설치해야 한다.
native 모듈이 연결된 개발 클라이언트가 필요하며 Expo Go로는 확인할 수 없다.

## 최소 사용 예

Web: 없음. Web 구현은 없다.

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | ReactNode | — | prop은 `children` 하나뿐이다 |
| `preload` | `false` | `false`(고정) | 바꿀 수 없다 |

- 이벤트·콜백 prop은 없다. 키보드 상태가 필요하면 peer의 `useKeyboardState`·`useKeyboardHandler`를 이 Provider 아래에서 쓴다.
- 렌더하는 상자가 없어 `layoutStyle`·`style`을 받지 않는다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면에 그려지는 것이 없다 | `react-native/src/keyboard-controller.tsx` |
| 간격 | — | — |
| 순서·정렬 | 앱 루트(`GestureHandlerRootView` 안, 내비게이터 바깥)에 한 번 둔다. KeyboardDock·KeyboardFormScrollView는 이 Provider 아래 어느 화면에나 놓을 수 있다 | `showcase/native/src/OptionalAdapters.stories.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | — | — |

## 꼭 지킬 것

- 앱 루트에 한 번만 둔다. 입력 필드·CTA·화면마다 중첩하지 않는다.
- KeyboardDock·KeyboardFormScrollView는 이 Provider 바깥에 두지 않는다.
- 같은 앱에서 이 어댑터와 KeyboardAvoiding을 섞을 수는 있지만 같은 내용에 겹쳐 감싸지 않는다.

## 함정

- tsc·mock 테스트 통과는 peer 설치와 native 연결의 근거가 아니다. 다른 optional subpath
  (celebration·effect-surface·qr-code·thinking-orb·toast-liquid)에서 앱에 없는 peer 때문에
  기기 Metro에서만 크래시가 난 사례가 있다(2026-10). 개발 클라이언트로 실제 화면을 띄워 확인한다.
- 이 어댑터의 API 성숙도는 실험이다(2026-10-06 Storybook 배포와 별개). 기기·보조기술 검증은 아직 없다([근거](../../optional-adapters.md#evidence-and-promotion)).
