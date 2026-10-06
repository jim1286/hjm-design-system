# KeyboardAvoiding

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Native platform](../../native-platform.md#키보드-회피), 판정 `resolveKeyboardInset`(`src/native-platform.ts`)
- 스토리북: 없음

## 언제 쓰나

추가 native peer 없이 하단 행동(BottomCTA, 채팅 입력창)이 소프트웨어 키보드에 가려지지 않게 할 때 쓴다.
키보드가 뜨면 측정한 높이만큼 아래 여백을 늘리고, 내려가면 safe area 여백만 남긴다.
`react-native-keyboard-controller`를 설치하지 않은 앱의 기본 선택이다(Native 전용, 별도 보조 기능).

이 컴포넌트는 keyboard event의 높이를 사용하며 wrapper의 window 위치와 실제 겹침은
측정하지 않는다. 2026-10-07 Utilverse의 측정 기반 host 대조에서 이 차이를 확인했다.
이미 adjustResize나 제품 host가 겹침을 처리하면 중첩하지 말고, safe area·하단 독·회전에서
같은 여백이 두 번 적용되지 않는지 확인한 뒤 교체한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| keyboard-controller를 설치한 앱에서 하단 행동을 키보드에 붙여 움직임 | [KeyboardDock](keyboard-dock.md) |
| 입력이 여러 개인 스크롤 폼에서 포커스된 필드를 보이게 | [KeyboardFormScrollView](keyboard-form-scroll-view.md) |
| keyboard-controller 어댑터를 쓰기 위한 앱 루트 설정 | [KeyboardMotionProvider](keyboard-motion-provider.md) |
| Sheet 안의 입력 | [Sheet](sheet.md)의 `keyboardAvoidance` (시트가 여백을 소유) |
| Web | 해당 없음. Web에는 이 문제와 계약이 없다 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `KeyboardAvoiding` | 기본 | — | `@hjmds/react-native`, `/keyboard` |
| `resolveKeyboardAvoidanceBehavior` | 보조 — 플랫폼별 `KeyboardAvoidingView` behavior 판정 함수 | — | 같은 entry |

추가 peer가 필요 없다.

## 최소 사용 예

Web: 없음. Web 구현은 없다.

```tsx
// Native
import { KeyboardAvoiding } from "@hjmds/react-native/keyboard";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";

<KeyboardAvoiding safeAreaBottom={insets.bottom}>
  <BottomCTA primaryAction={{ label: t("signup.next"), onPress: next }} />
</KeyboardAvoiding>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `offset` | 숫자 | `spacing.sm`(12) | 키보드 위에 남길 여백 |
| `safeAreaBottom` | 숫자 | `0` | 하단 safe area 값. 키보드가 닫혀 있으면 이 값만큼, 열려 있으면 키보드 높이 + `offset` 만큼 아래 여백을 준다. safe area는 한 번만 센다 |
| `style` | `StyleProp<ViewStyle>` | — | 감싸는 `View`의 스타일. renderer가 주는 `paddingBottom` 뒤에 합쳐진다. 플랫폼 host라 1.13 deprecated 대상이 아니고 `layoutStyle`은 없다 |
| `resolveKeyboardAvoidanceBehavior` | `(platform: "ios" \| "android") => KeyboardAvoidanceBehavior` | — | RN `KeyboardAvoidingView`를 직접 쓸 때의 `behavior` 판정. 이 컴포넌트는 쓰지 않는다 |

- 콜백·상태 prop은 없다. 키보드 높이는 컴포넌트 안에서 키보드 이벤트로 잰다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아래 여백: 키보드 닫힘 = `safeAreaBottom`, 열림 = 키보드 높이 + `offset`(기본 `spacing.sm` 12) | `design-contracts/src/native-platform.ts`(`resolveKeyboardInset`, `keyboardAvoidanceDefaults`) |
| 간격 | safe area는 키보드 높이 안에 포함돼 한 번만 센다 | `design-contracts/src/native-platform.ts`(`resolveKeyboardInset`) |
| 순서·정렬 | 화면 맨 아래, 스크롤 영역 **바깥**에서 하단 행동(BottomCTA, 입력창)만 감싼다. 본문 스크롤은 위에 따로 둔다 | `react-native/src/keyboard.tsx` |
| 고정·스크롤 | 높이 변화는 키보드 이벤트에 맞춰 `LayoutAnimation`(easeInEaseOut)으로 움직인다 | `react-native/src/keyboard.tsx` |
| 좁은 폭·큰 글자 | — | — |

```text
키보드 닫힘                         키보드 열림
┌──────────────────────┐            ┌──────────────────────┐
│ 본문(스크롤)          │            │ 본문(스크롤, 줄어듦)  │
│                      │            ├──────────────────────┤
├──────────────────────┤            │ [     다음(primary)   ]│ ← KeyboardAvoiding 안
│ [     다음(primary)   ]│ ← 고정    ├────── offset 12 ──────┤
├── safeAreaBottom ────┤            │ ░░░░░ 키보드 ░░░░░░░ │
└──────────────────────┘            └──────────────────────┘
```

## 꼭 지킬 것

- 같은 내용을 다른 키보드 회피 래퍼(`KeyboardAvoidingView`, KeyboardDock, 호스트 어댑터)와 겹쳐 감싸지 않는다.
- safe area 여백을 안쪽 컴포넌트(BottomCTA `safeAreaBottom` 등)와 이 래퍼에 동시에 주지 않는다. 한 곳에서만 센다.
- `style`로 `paddingBottom`을 덮으면 키보드 여백이 사라진다. 배치 외 값을 넣지 않는다.

## 함정

- `KeyboardAvoidingView`가 아니다. 플랫폼과 무관하게 키보드 이벤트로 잰 높이를 `paddingBottom`으로 준다
  (iOS는 `keyboardWillChangeFrame`, Android는 `keyboardDidShow`). `resolveKeyboardAvoidanceBehavior`는
  제품이 RN `KeyboardAvoidingView`를 직접 쓸 때를 위한 판정이며 이 컴포넌트는 그 값을 쓰지 않는다.
- 이 래퍼는 아래 여백만 늘린다. 스크롤 안의 포커스된 필드를 보이는 곳으로 옮겨 주지 않는다.
