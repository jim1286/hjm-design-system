# KeyboardDock

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional adapters](../../optional-adapters.md#behavior-boundaries). 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/직접 조작과 모션/이미지·시트·키보드 조작`

## 언제 쓰나

`react-native-keyboard-controller`를 설치한 앱에서 화면 하단에 고정된 행동(BottomCTA, 채팅 입력창)이
키보드와 함께 위아래로 움직이게 할 때 쓴다(Native 전용, 별도 보조 기능. API 성숙도는 실험적 어댑터). 내부는 `KeyboardStickyView`이며,
여백을 바꾸는 대신 키보드 움직임을 따라 translate 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| keyboard-controller 없이 하단 행동을 키보드 위로 | [KeyboardAvoiding](keyboard-avoiding.md) |
| 입력이 여러 개인 스크롤 폼 본문 | [KeyboardFormScrollView](keyboard-form-scroll-view.md) (하단 버튼은 이 Dock과 함께) |
| 앱 루트 설정 | [KeyboardMotionProvider](keyboard-motion-provider.md) (먼저 필요) |
| Sheet 안의 입력 | [Sheet](sheet.md)의 `keyboardAvoidance` |
| Web | 해당 없음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `KeyboardDock` | 기본 — 하단 고정 행동을 키보드에 붙임 | — | `/keyboard-controller` |

granular subpath로만 import 된다. 설치 조건(peer `react-native-keyboard-controller` 1.22.5, Reanimated·Worklets,
개발 클라이언트)과 루트 Provider는 [KeyboardMotionProvider](keyboard-motion-provider.md)를 따른다.

## 최소 사용 예

Web: 없음. Web 구현은 없다.

```tsx
// Native — KeyboardMotionProvider 안, KeyboardFormScrollView의 다음 형제
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardState } from "react-native-keyboard-controller";
import { KeyboardDock } from "@hjmds/react-native/keyboard-controller";
import { Button } from "@hjmds/react-native/actions";
import { Container } from "@hjmds/react-native/primitives";

const insets = useSafeAreaInsets();
const keyboardOpen = useKeyboardState((state) => state.isVisible);

<KeyboardDock clearance={8}>
  <View style={{ paddingBottom: keyboardOpen ? 0 : insets.bottom }}>
    <Container gutter="compact">
      <Button onPress={submit} fullWidth>{t("form.done")}</Button>
    </Container>
  </View>
</KeyboardDock>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `enabled` | `true` · `false` | `true` | `false`면 따라 움직이지 않는다 |
| `clearance` | 0 이상 숫자(layout point) | `0` | 키보드 위 추가 간격. 음수나 유한하지 않은 값은 `TypeError` |
| `children` | ReactNode(필수) | — | 하단 행동. 안쪽 여백·안전 영역은 호스트가 준다 |
| `style` | `StyleProp<ViewStyle>` | — | 감싸는 sticky view의 host 스타일. 플랫폼 host라 1.13 deprecated 대상이 아니다([이관 문서](../../migration-native-legacy-removal.md#113-deprecated-시각-style-제거는-다음-major)). 배치 값만 넣는다 |

- 이벤트·콜백 prop은 없다. 키보드 열림 여부가 필요하면 peer의 `useKeyboardState((state) => state.isVisible)`로 읽는다.
- 내부에서 `KeyboardStickyView`에 `offset={{ closed: 0, opened: -clearance }}`를 넘긴다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | — | — |
| 간격 | 안쪽 여백은 호스트가 준다. 좌우는 화면 본문과 같은 [Container](container.md) `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20 — [화면 여백과 너비](../tokens/layout.md)), 아래는 키보드 닫힘이면 `insets.bottom`, 열림이면 0이다. 키보드와의 추가 간격은 `clearance`(기본 0)로만 준다 | `react-native/src/keyboard-controller.tsx`, `tokens/layout.md` |
| 순서·정렬 | 화면 맨 아래, 스크롤 영역([KeyboardFormScrollView](keyboard-form-scroll-view.md)) **다음 형제**로 둔다 | `showcase/native/src/OptionalAdapters.stories.tsx` |
| 고정·스크롤 | 키보드가 열리면 그만큼 위로 translate 된다 | `react-native/src/keyboard-controller.tsx` |
| 좁은 폭·큰 글자 | — | — |

```text
┌──────────────────────────┐
│ 상단 고정 영역(insets.top) │
├──────────────────────────┤
│ KeyboardFormScrollView    │ ← 스크롤 영역, 안에 Container(gutter)
│  필드 / 필드 / ...        │
├──────────────────────────┤
│ [        완료        ]    │ ← KeyboardDock 안 Container(gutter) — 주 행동
├── insets.bottom(닫힘) / 0(열림) ──┤
└──────────────────────────┘
```

## 꼭 지킬 것

- 하단 safe area는 호스트가 소유한다. 키보드가 열렸을 때 safe area 여백을 빼는 것도 호스트 몫이다
  (키보드 상태에 따라 `paddingBottom`을 `insets.bottom`과 0 사이에서 바꾼다).
- 좌우 여백은 숫자로 쓰지 않고 [Container](container.md) `gutter`로 준다.
- 같은 내용을 KeyboardAvoiding이나 다른 키보드 회피 래퍼로 또 감싸지 않는다.
- KeyboardMotionProvider 없이 쓰지 않는다.

## 함정

- 현재 쇼케이스(`showcase/native/src/OptionalAdapters.stories.tsx`)는 Dock 안 좌우 여백을 `paddingHorizontal: spacing.md`로
  직접 주고, 키보드 상태를 `Keyboard.addListener`로 따로 추적하며, 버튼 문구가 i18n 키가 아니다. 규칙은 위 예처럼 Container `gutter`와 i18n 키다.

- sticky 좌표는 창 기준이다. Storybook 캔버스처럼 아래에 다른 막대가 있는 host에서는 위치가 어긋나므로
  쇼케이스도 앱 크기 host에서 확인한다.
- API 성숙도가 실험적 어댑터다(2026-10-06 Storybook 배포와 별개, [근거](../../optional-adapters.md#evidence-and-promotion)). 실제 키보드 애니메이션은 mock 테스트로 검증되지 않는다. 개발 클라이언트로 확인한다.
