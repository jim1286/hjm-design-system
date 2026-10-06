# SharedTransitionScreen 사용 지침

적용: `@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
설계: [Optional interaction adapters · Shared screen transition](../../../../docs/interaction-adapters.md#shared-screen-transition)
(Native 전용, **experimental**, supplemental). 카탈로그 계약은 없다.

## 언제 쓰나

`createHjmTransitionStack()`으로 만든 stack에서 공유 요소 전환을 쓸 때, **각 라우트 본문**을 감싼다.
전환 뒤에도 출발 화면은 역방향 전환 기하를 위해 mount된 채 남는데, 이 감싸개가 포커스를 잃은 화면을
접근성 트리와 터치에서 빼고, 테마 배경으로 불투명하게 칠해 전환 backdrop이 내용에 비치지 않게 한다.
공유 요소 자체는 [SharedTransitionElement](shared-transition-element.md)가 맡는다.

설치 전제(peer, exports patch, 단일 navigation 인스턴스)와 "현재 쓸 수 있는 소비 앱 없음"(expo-router 전용)은
[SharedTransitionElement](shared-transition-element.md#공개-이름과-import)와 같다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 화면 뼈대(제목·상태·하단 행동) | [ScreenLayout](screen-layout.md) — 필요하면 이 감싸개 안에 둔다 |
| 공유 요소 전환이 없는 stack | 감싸지 않는다 |
| Web | 없음 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SharedTransitionScreen` | 없음 | `/screen-transition` | 라우트 본문 감싸개 |
| `SharedTransitionElement` | 없음 | `/screen-transition` | 공유 요소 경계(같이 씀) |

granular subpath로만 가져온다. `react-native-screen-transitions` 4.0.0과 `@react-navigation/native` 7.4.1
(optional peer)이 설치돼 있지 않으면 기기 Metro 번들에서 죽는다.

## 최소 사용 예

```tsx
// Native — 라우트 컴포넌트마다
import { SharedTransitionScreen, SharedTransitionElement } from "@hjmds/react-native/screen-transition";

function PlaceDetail({ place }: Props) {
  return (
    <SharedTransitionScreen testID="place-detail">
      <SharedTransitionElement id={`place-${place.id}`}>
        <PlacePhoto place={place} />
      </SharedTransitionElement>
      <PlaceBody place={place} />
    </SharedTransitionScreen>
  );
}
```

## 축과 기본값

- Props는 React Native `ViewProps` 전체다. 기본 스타일은 `flex: 1` + 테마 `bg` 배경이다.
- `useIsFocused()`로 포커스를 읽어, 포커스가 없으면 `importantForAccessibility="no-hide-descendants"`,
  `accessibilityElementsHidden`, `pointerEvents="none"`을 건다.

## 꼭 지킬 것

- React Navigation의 navigation context 안(host `NavigationContainer` 아래)에서만 렌더한다.
  `useIsFocused`가 그 context를 요구한다.
- `HjmNativeProvider` 아래에 둔다(테마 배경을 읽는다).
- `style`은 배치용으로만 쓴다. 배경색을 덮으면 전환 중 backdrop이 내용에 비친다.
- `pointerEvents`·`accessibilityElementsHidden`·`importantForAccessibility`를 직접 넘기지 않는다.
  감싸개가 포커스 상태로 다시 덮어쓴다.
