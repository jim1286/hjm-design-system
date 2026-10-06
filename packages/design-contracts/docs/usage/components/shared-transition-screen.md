# SharedTransitionScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional interaction adapters · Shared screen transition](../../../../../docs/interaction-adapters.md#shared-screen-transition), `src/screen-transition.tsx`. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/직접 조작과 모션/끌기·밀기·화면 전환`

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
| 공유 요소 전환이 없는 stack | 감싸지 않는다 |
| Web | 없음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SharedTransitionScreen` | 기본(라우트 본문 감싸개) | — | `/screen-transition` |
| `SharedTransitionElement` | 동반(공유 요소 경계, 같이 씀) | — | `/screen-transition` |

granular subpath로만 가져온다. `react-native-screen-transitions` 4.0.0과 `@react-navigation/native` 7.4.1
(optional peer)이 설치돼 있지 않으면 기기 Metro 번들에서 죽는다.

## 최소 사용 예

Web: 없음.

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | ReactNode | — | 라우트 본문 |
| `style` | `StyleProp<ViewStyle>` | `flex: 1` + 테마 `bg` 배경 | 배치용. optional motion host frame이라 1.13 deprecated 대상에서 제외돼 있다 |
| 나머지 | React Native `ViewProps`(`testID` 등) | — | `pointerEvents`·`accessibilityElementsHidden`·`importantForAccessibility`는 덮어쓰인다 |
| (포커스 상태) | `useIsFocused(): boolean` | — | 포커스가 없으면 `importantForAccessibility="no-hide-descendants"`, `accessibilityElementsHidden`, `pointerEvents="none"`을 건다 |

콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 라우트 영역 전체(`flex: 1`)를 채우고 테마 `bg`로 불투명하게 칠한다 | `src/screen-transition.tsx` |
| 간격 | 자체 여백 없음. 화면 여백·안전 영역은 안쪽 화면 골격이 맡는다 | `src/screen-transition.tsx` |
| 순서·정렬 | 라우트 컴포넌트의 가장 바깥 요소. 그 안에 [SharedTransitionElement](shared-transition-element.md)와 나머지 본문을 둔다 | — |
| 고정·스크롤 | 스크롤하지 않는다. 스크롤 영역(ScrollView·FlatList)은 안쪽에 둔다 | `src/screen-transition.tsx` |
| 좁은 폭·큰 글자 | 바뀌는 것 없음(부모 크기를 따른다) | — |

## 꼭 지킬 것

- React Navigation의 navigation context 안(host `NavigationContainer` 아래)에서만 렌더한다.
  `useIsFocused`가 그 context를 요구한다.
- `HjmNativeProvider` 아래에 둔다(테마 배경을 읽는다).
- `style`은 배치용으로만 쓴다. 배경색을 덮으면 전환 중 backdrop이 내용에 비친다.
- `pointerEvents`·`accessibilityElementsHidden`·`importantForAccessibility`를 직접 넘기지 않는다.
  감싸개가 포커스 상태로 다시 덮어쓴다.
