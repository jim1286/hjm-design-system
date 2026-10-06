# SharedTransitionElement

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional interaction adapters · Shared screen transition](../../../../../docs/interaction-adapters.md#shared-screen-transition)(Native 전용, experimental, supplemental, 카탈로그 계약 없음), `packages/react-native/src/screen-transition.tsx`, 시연은 구성 스토리 `배포/구성/직접 조작과 모션/끌기·밀기·화면 전환` › 카드 확대와 화면 전환. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/직접 조작과 모션/끌기·밀기·화면 전환`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SharedTransitionElement` | 기본(공유 요소 경계) | — | `/screen-transition` |
| `SharedTransitionScreen` | 동반(라우트 본문 감싸개) | — | `/screen-transition` |
| `useSharedTransitionOptions` | 보조(화면 옵션 hook) | — | `/screen-transition` |
| `createHjmTransitionStack` | 보조(stack navigator 생성) | — | `/screen-transition` |

granular subpath로만 가져온다(root·barrel에 없음). 이 subpath는 아래 optional peer를 import 하며,
없으면 tsc·테스트는 통과해도 기기 Metro 번들에서 죽는다.

- 직접: `react-native-screen-transitions` 4.0.0, `@react-navigation/native` 7.4.1(HJM `peerDependencies`, optional).
- 상위 라이브러리 요구: `react-native-gesture-handler`, `react-native-reanimated` 4, `react-native-worklets`,
  `react-native-safe-area-context`.
- 소비 앱 패키지 관리자에 [exports patch](../../../../react-native/docs/patches/react-native-screen-transitions.patch)를
  등록해야 한다. HJM tarball이 patch를 대신 적용하지 않는다.

## 최소 사용 예

Web: 없음.

```tsx
// Native
// 목록 화면과 상세 화면 양쪽에 같은 id
import { SharedTransitionElement } from "@hjmds/react-native/screen-transition";

<SharedTransitionElement id={`place-${place.id}`} accessibilityLabel={place.name}>
  <PlacePhoto place={place} /> {/* 제품 콘텐츠 */}
</SharedTransitionElement>
```

화면 옵션: `const options = useSharedTransitionOptions(\`place-${place.id}\`)`를 `createHjmTransitionStack()`이 만든
`Stack.Screen`에 붙인다. 전체 예는 설계 문서의 Shared screen transition 절을 따른다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | 문자열 | 필수 | 데이터의 안정 키. 빈 문자열이면 `TypeError` |
| `children` | ReactNode | 필수 | 크기가 분명한 시각 요소 하나 |
| `accessibilityLabel` | 문자열 | — | 경계의 접근성 이름 |
| `style` | `StyleProp<ViewStyle>` | — | 경계 바깥 배치. 이 컴포넌트는 optional motion host frame이라 1.13 deprecated 대상에서 제외돼 있다 |
| `useSharedTransitionOptions` | `(id: string) => ScreenTransitionConfig` | — | 도착 화면 `Stack.Screen` `options`에 붙인다. 동작 줄이기면 전환 시간 0·제스처 꺼짐 |
| `createHjmTransitionStack` | `() => Stack` | — | `react-native-screen-transitions`의 blank stack navigator를 그대로 내보낸다 |

Props는 `id`·`children`·`accessibilityLabel`·`style` 넷뿐이고 콜백은 없다.
동작 줄이기가 켜지면 경계가 비활성화되고 화면 옵션의 전환 시간이 0, 제스처가 꺼진다.
live-view handoff·clipping escape는 꺼져 있고 공개하지 않는다(`react-native-teleport` 불필요).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 경계는 자체 크기·여백을 갖지 않는다. 크기는 `children`, 바깥 배치는 `style`이 정한다. 크기가 분명한 시각 요소 하나(사진·썸네일)만 감싼다. 전환이 경계의 측정 크기 사이를 확대·축소(`zoom`, target `bound`)하기 때문이다 | `screen-transition.tsx`(`Transition.Boundary`, `useSharedTransitionOptions`) |
| 간격 | 간격 토큰 없음. 감싸는 레이아웃이 정한다 | — |
| 순서·정렬 | 출발 화면(목록 카드의 사진)과 도착 화면(상세 상단의 큰 사진)에 하나씩, 같은 `id`로 둔다. 한 화면에 같은 `id`를 둘 이상 두지 않는다. 각 화면 본문은 [SharedTransitionScreen](shared-transition-screen.md)(`flex: 1`, 테마 배경) 안에 둔다 | `SharedTransitionScreen` |
| 고정·스크롤 | 상세 화면은 아래로 쓸어내려 닫힌다(`gestureDirection: "vertical"`). 도착 화면 상단 사진 위에 세로 드래그 제스처를 겹치지 않는다 | `useSharedTransitionOptions` |
| 좁은 폭·큰 글자 | 크기는 `children`을 따른다. 동작 줄이기에서는 전환 없이 바로 바뀐다 | `environment.reducedMotion` |

```text
목록 화면                          상세 화면
┌──────────────────┐              ┌──────────────────┐
│ ┌────┐ 장소 이름  │   zoom →     │ ┌──────────────┐ │
│ │ id │ 설명       │              │ │      id      │ │ ← 같은 id
│ └────┘            │   ← 아래로   │ └──────────────┘ │
│ ┌────┐ …          │    쓸어 닫기  │ 본문 (제품)       │
└──────────────────┘              └──────────────────┘
```

## 꼭 지킬 것

- `id`는 데이터의 안정 키로 만든다. 빈 문자열이면 `TypeError`, 두 화면의 id가 다르면 전환이 맺히지 않는다.
- 각 라우트 본문은 SharedTransitionScreen으로 감싼다. 남아 있는 이전 화면이 접근성·터치에 새지 않게 한다.
- host와 어댑터가 같은 navigation 인스턴스를 써야 한다. pnpm에서 peer가 둘로 갈리면
  `LinkingContext`/`DescriptorsStore` 오류가 난다.
- 라우트 파라미터·포커스·스크롤 복원·navigation container는 제품 소유다.

## 함정

- patch 없이 설치하면 Expo TypeScript가 upstream `.tsx`를 읽어 오류가 수백 개 난다.
  teleport 네이티브 뷰가 링크되지 않은 client에서는 patch가 없으면 `Unimplemented component: PortalHostView`가 났다.
