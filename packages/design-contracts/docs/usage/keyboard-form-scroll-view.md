# KeyboardFormScrollView 사용 지침

적용: `@hjmds/react-native` 1.12.1 (Native 전용, 별도 보조 기능·실험) · 검토일: 2026-10-06 ·
계약: [Optional adapters](../optional-adapters.md#behavior-boundaries)

## 언제 쓰나

입력 필드가 여러 개인 세로 스크롤 폼(가입, 프로필 수정, 주소 입력)에서 포커스된 필드가 키보드에
가려지지 않게 스크롤해 줄 때 쓴다. 내부는 `react-native-keyboard-controller`의 `KeyboardAwareScrollView`이고,
`keyboardShouldPersistTaps="handled"`로 고정돼 키보드가 열린 채 버튼을 눌러도 탭이 전달된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 하단에 고정된 버튼·입력창을 키보드에 붙임 | [KeyboardDock](keyboard-dock.md) (이 폼과 함께 쓸 수 있다) |
| peer 없이 하단 행동만 올림 | [KeyboardAvoiding](keyboard-avoiding.md) |
| 앱 루트 설정 | [KeyboardMotionProvider](keyboard-motion-provider.md) (먼저 필요) |
| 화면 틀·상태·하단 영역까지 필요한 화면 | [ScreenLayout](screen-layout.md) (자체 ScrollView를 가진다) |
| 입력 묶음·검증 구조 | [Form](form.md) (스크롤 컨테이너가 아니다) |
| Sheet 안의 입력 | [Sheet](sheet.md)의 `keyboardAvoidance` |
| Web | 해당 없음 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `KeyboardFormScrollView` | 없음 | `/keyboard-controller` | 키보드 인지 폼 스크롤 |

granular subpath로만 import 된다. 설치 조건과 루트 Provider는 [KeyboardMotionProvider](keyboard-motion-provider.md)를 따른다.

## 최소 사용 예

Web 구현은 없다.

```tsx
// Native — KeyboardMotionProvider 안
import { KeyboardFormScrollView } from "@hjmds/react-native/keyboard-controller";
import { TextField } from "@hjmds/react-native/inputs";

<KeyboardFormScrollView contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}>
  <TextField label={t("profile.name")} value={name} onValueChange={setName} />
  <TextField label={t("profile.email")} value={email} onValueChange={setEmail} />
</KeyboardFormScrollView>
```

## 축과 기본값

- 받는 prop은 `children`, `style`, `contentContainerStyle`, `bottomOffset`, `enabled`, `testID`뿐이다.
  `bottomOffset`·`enabled`의 기본값은 upstream 라이브러리가 정한다.
- `keyboardShouldPersistTaps`는 `"handled"`로 고정이다.

## 꼭 지킬 것

- KeyboardMotionProvider 없이 쓰지 않는다.
- ScreenLayout(`scroll="screen"`) 같은 다른 ScrollView 안에 넣지 않는다. 스크롤 컨테이너는 하나만 둔다.
- 같은 내용을 KeyboardAvoiding이나 `KeyboardAvoidingView`로 또 감싸지 않는다.
- `contentContainerStyle`의 간격·여백은 HJM spacing 토큰으로 준다.

## 함정

- `refreshControl`, `onScroll` 같은 다른 ScrollView prop은 타입에서 빠져 있어 넘길 수 없다.
- 실험 단계 어댑터다. 포커스 이동·키보드 애니메이션은 개발 클라이언트로 기기에서 확인한다.
