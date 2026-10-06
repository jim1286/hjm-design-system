# SharedTransitionElement 사용 지침

적용: `@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
설계: [Optional interaction adapters · Shared screen transition](../../../../docs/interaction-adapters.md#shared-screen-transition)
(Native 전용, **experimental**, supplemental). 카탈로그 계약은 없다.

## 언제 쓰나

목록의 카드(사진·썸네일)를 눌러 상세 화면으로 갈 때, 같은 요소가 두 화면 사이에서 확대·축소되어
이어지는 공유 요소 전환에 쓴다. 출발 화면과 도착 화면에 **같은 `id`** 로 하나씩 둔다.
[SharedTransitionScreen](shared-transition-screen.md), `useSharedTransitionOptions`, `createHjmTransitionStack`과
한 묶음으로만 동작한다.

2026-09-30 기준 포트폴리오 Expo 앱은 모두 expo-router 57을 React Navigation 없이 쓰므로 이 경로를
쓸 수 있는 소비 앱이 아직 없다. 도입 전에 아래 전제를 모두 충족하는지 먼저 확인한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 같은 화면 안에서 내용만 바뀜 | [ContentTransition](content-transition.md) |
| Web 화면 전환 | 없음. 제품 router를 쓴다 |
| 한 화면 위에 보조 내용을 띄움 | [Sheet](sheet.md) |
| expo-router만 쓰는 앱 | 제품 router 기본 전환 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `SharedTransitionElement` | 없음 | `/screen-transition` | 공유 요소 경계 |
| `SharedTransitionScreen` | 없음 | `/screen-transition` | 라우트 본문 감싸개(같이 씀) |
| `useSharedTransitionOptions` | 없음 | `/screen-transition` | 화면 옵션 hook |
| `createHjmTransitionStack` | 없음 | `/screen-transition` | stack navigator 생성 |

granular subpath로만 가져온다(root·barrel에 없음). 이 subpath는 아래 optional peer를 import 하며,
없으면 tsc·테스트는 통과해도 기기 Metro 번들에서 죽는다.

- 직접: `react-native-screen-transitions` 4.0.0, `@react-navigation/native` 7.4.1(HJM `peerDependencies`, optional).
- 상위 라이브러리 요구: `react-native-gesture-handler`, `react-native-reanimated` 4, `react-native-worklets`,
  `react-native-safe-area-context`.
- 소비 앱 패키지 관리자에 [exports patch](../../../react-native/docs/patches/react-native-screen-transitions.patch)를
  등록해야 한다. HJM tarball이 patch를 대신 적용하지 않는다.

## 최소 사용 예

```tsx
// Native — 목록 화면과 상세 화면 양쪽에 같은 id
import { SharedTransitionElement } from "@hjmds/react-native/screen-transition";

<SharedTransitionElement id={`place-${place.id}`} accessibilityLabel={place.name}>
  <PlacePhoto place={place} /> {/* 제품 콘텐츠 */}
</SharedTransitionElement>
```

화면 옵션: `const options = useSharedTransitionOptions(\`place-${place.id}\`)`를 `createHjmTransitionStack()`이 만든
`Stack.Screen`에 붙인다. 전체 예는 설계 문서의 Shared screen transition 절을 따른다.

## 축과 기본값

- Props는 `id`(필수), `children`(필수), `style`, `accessibilityLabel`뿐이다.
- 동작 줄이기가 켜지면 경계가 비활성화되고 화면 옵션의 전환 시간이 0, 제스처가 꺼진다.
- live-view handoff·clipping escape는 꺼져 있고 공개하지 않는다(`react-native-teleport` 불필요).

## 꼭 지킬 것

- `id`는 데이터의 안정 키로 만든다. 빈 문자열이면 `TypeError`, 두 화면의 id가 다르면 전환이 맺히지 않는다.
- 각 라우트 본문은 SharedTransitionScreen으로 감싼다. 남아 있는 이전 화면이 접근성·터치에 새지 않게 한다.
- host와 어댑터가 같은 navigation 인스턴스를 써야 한다. pnpm에서 peer가 둘로 갈리면
  `LinkingContext`/`DescriptorsStore` 오류가 난다.
- 라우트 파라미터·포커스·스크롤 복원·navigation container는 제품 소유다.

## 함정

- patch 없이 설치하면 Expo TypeScript가 upstream `.tsx`를 읽어 오류가 수백 개 난다.
  teleport 네이티브 뷰가 링크되지 않은 client에서는 patch가 없으면 `Unimplemented component: PortalHostView`가 났다.
