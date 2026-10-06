# KeyboardFormScrollView

- 단계: 컴포넌트
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional adapters](../../optional-adapters.md#behavior-boundaries). 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/구성/직접 조작과 모션/이미지·시트·키보드 조작`

## 언제 쓰나

입력 필드가 여러 개인 세로 스크롤 폼(가입, 프로필 수정, 주소 입력)에서 포커스된 필드가 키보드에
가려지지 않게 스크롤해 줄 때 쓴다(Native 전용, 별도 보조 기능. API 성숙도는 실험적 어댑터). 내부는 `react-native-keyboard-controller`의
`KeyboardAwareScrollView`이고, `keyboardShouldPersistTaps="handled"`로 고정돼 키보드가 열린 채 버튼을 눌러도 탭이 전달된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 하단에 고정된 버튼·입력창을 키보드에 붙임 | [KeyboardDock](keyboard-dock.md) (이 폼과 함께 쓸 수 있다) |
| peer 없이 하단 행동만 올림 | [KeyboardAvoiding](keyboard-avoiding.md) |
| 앱 루트 설정 | [KeyboardMotionProvider](keyboard-motion-provider.md) (먼저 필요) |
| 입력 묶음·검증 구조 | [Form](form.md) (스크롤 컨테이너가 아니다) |
| Sheet 안의 입력 | [Sheet](sheet.md)의 `keyboardAvoidance` |
| Web | 해당 없음 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `KeyboardFormScrollView` | 기본 — 키보드 인지 폼 스크롤 | — | `/keyboard-controller` |

granular subpath로만 import 된다. 설치 조건과 루트 Provider는 [KeyboardMotionProvider](keyboard-motion-provider.md)를 따른다.

## 최소 사용 예

Web: 없음. Web 구현은 없다.

```tsx
// Native — KeyboardMotionProvider 안
import { KeyboardFormScrollView } from "@hjmds/react-native/keyboard-controller";
import { Container, Stack } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { spacing } from "@hjmds/design-contracts/foundations";

<KeyboardFormScrollView contentContainerStyle={{ paddingVertical: spacing.md }} bottomOffset={spacing.md}>
  <Container gutter="compact">
    <Stack gap="md">
      <TextField label={t("profile.name")} value={name} onValueChange={setName} />
      <TextField label={t("profile.email")} value={email} onValueChange={setEmail} />
    </Stack>
  </Container>
</KeyboardFormScrollView>
```

스크롤 컨테이너는 세로 여백만 갖고, 좌우 여백은 안쪽 [Container](container.md) `gutter`(폭 600 미만 `compact` 16, 이상
`regular` 20), 필드 사이는 [Stack](stack.md) `gap`이 준다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `bottomOffset` | 숫자(layout point) | `0`(peer 기본값) | 포커스된 입력의 caret과 키보드 사이 거리 |
| `enabled` | `true` · `false` | `true`(peer 기본값) | `false`면 키보드에 맞춰 스크롤하지 않는다 |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | — | 세로 여백만 준다. 좌우 여백·필드 간격은 Container·Stack |
| `style` | `StyleProp<ViewStyle>` | — | 스크롤 view 자체의 배치(`flex: 1` 등) |
| `keyboardShouldPersistTaps` | `"handled"` | `"handled"`(고정) | 바꿀 수 없다 |

- 받는 prop은 `children`, `style`, `contentContainerStyle`, `bottomOffset`, `enabled`, `testID`뿐이다. 이벤트·콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 화면 본문 전체를 차지하는 스크롤 영역으로 둔다 | `showcase/native/src/OptionalAdapters.stories.tsx` |
| 간격 | 세로 여백은 `contentContainerStyle`의 `paddingVertical`(`spacing.md` 16), 좌우 여백은 안쪽 [Container](container.md) `gutter`(폭 600 미만 16, 이상 20), 필드 사이는 [Stack](stack.md) `gap="md"` 16(`layout.contentGap`). 필드와 키보드 사이 여백은 `bottomOffset`으로 준다 | `tokens/layout.md`, `react-native/src/keyboard-controller.tsx` |
| 순서·정렬 | 위에는 고정 헤더, 아래에는 [KeyboardDock](keyboard-dock.md)으로 붙인 하단 행동을 형제로 둔다 | `showcase/native/src/OptionalAdapters.stories.tsx` |
| 고정·스크롤 | 포커스된 필드가 키보드 위로 보일 때까지 스크롤된다 | `react-native/src/keyboard-controller.tsx` |
| 좁은 폭·큰 글자 | 큰 글자에서 필드가 길어져도 스크롤로 받는다. 높이를 고정하지 않는다 | — |

## 꼭 지킬 것

- KeyboardMotionProvider 없이 쓰지 않는다.
- 다른 ScrollView 안에 넣지 않는다. 스크롤 컨테이너는 하나만 둔다.
- 같은 내용을 KeyboardAvoiding이나 `KeyboardAvoidingView`로 또 감싸지 않는다.
- `contentContainerStyle`에는 세로 여백만 HJM spacing 토큰으로 준다. 좌우 여백을 숫자로 넣지 않는다.

## 함정

- 현재 쇼케이스(`showcase/native/src/OptionalAdapters.stories.tsx`)는 `contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}`로
  좌우 여백까지 스크롤 컨테이너에 직접 준다. 규칙은 세로 여백만 스크롤에, 좌우는 Container `gutter`다.

- `refreshControl`, `onScroll` 같은 다른 ScrollView prop은 타입에서 빠져 있어 넘길 수 없다.
- API 성숙도가 실험적 어댑터다(2026-10-06 Storybook 배포와 별개, [근거](../../optional-adapters.md#evidence-and-promotion)). 포커스 이동·키보드 애니메이션은 개발 클라이언트로 기기에서 확인한다.
