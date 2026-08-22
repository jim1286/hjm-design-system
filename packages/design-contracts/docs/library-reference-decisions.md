# Library reference decisions

HJM은 다른 UI 라이브러리의 외형이나 public prop 이름을 복제하지 않습니다. 이 문서는
여러 시스템에서 반복해서 검증된 **문제 분해 방식**을 어떤 HJM 계약으로 번역했는지 기록합니다.
구현을 추가할 때는 이 표를 그대로 베끼지 않고 `의미 → 공통 계약 → 플랫폼 번역 → 실행 증거`
순서로 판단합니다.

## 참고한 시스템과 흡수한 원칙

| 시스템 | 공식 자료 | HJM에 흡수하는 원칙 | 흡수하지 않는 것 |
| --- | --- | --- | --- |
| React Aria | [Button](https://react-aria.adobe.com/Button), [NumberField](https://react-aria.adobe.com/NumberField), [Slider](https://react-aria.adobe.com/Slider) | 입력 modality와 무관한 action 의미, controlled/uncontrolled 축, locale-aware number semantics, keyboard·focus·ARIA acceptance | React Aria 런타임 의존성, DOM 전용 composition을 Native에 강제 |
| Radix Primitives | [Introduction](https://www.radix-ui.com/primitives/docs/overview/introduction), [Composition](https://www.radix-ui.com/primitives/docs/guides/composition), [Styling](https://www.radix-ui.com/primitives/docs/guides/styling) | 상태별 data axis, focus/dismiss 책임, compound anatomy, 소비자 element에 prop/ref를 안전하게 전달하는 합성 규칙 | `asChild`를 모든 컴포넌트의 기본 API로 공개, Radix의 DOM 구조 복제 |
| Chakra UI | [Card](https://chakra-ui.com/docs/components/card), [Slot recipes](https://chakra-ui.com/docs/theming/slot-recipes), [Recipes](https://chakra-ui.com/docs/theming/customization/recipes) | 여러 부분을 가진 컴포넌트의 명시적 slot anatomy, typed size/variant/default recipe | Chakra token 이름, 시각 variant, 스타일 엔진 의존성 |
| Tamagui | [Button](https://tamagui.dev/ui/button), [Card](https://tamagui.dev/ui/card), [Variants](https://tamagui.dev/docs/core/variants), [Themes](https://tamagui.dev/docs/core/theme) | Web/RN이 같은 semantic intent와 typed variant를 공유하고 각 플랫폼 primitive로 번역, parent size/tone을 slot에 전파 | Tamagui compiler·theme runtime, 무제한 style prop surface |
| MUI | [Stack](https://mui.com/material-ui/react-stack/), [Button](https://mui.com/material-ui/react-button/) | Stack은 한 축의 간격과 정렬만 책임지고 Grid와 역할을 분리, action hierarchy를 제한된 variant로 표현 | Material 외형, `sx`와 같은 임의 스타일 탈출구를 공용 계약으로 노출 |
| React Native | [Accessibility](https://reactnative.dev/docs/accessibility), [TextInput](https://reactnative.dev/docs/next/textinput) | adjustable control의 increment/decrement action, accessibility value/state, platform keyboard와 font scaling을 Native acceptance에 포함 | OS별 지원 차이를 Web ARIA와 동일하다고 추정, keyboard type만으로 입력 검증을 대체 |
| Ant Design | [Components](https://ant.design/components/overview/), [DatePicker](https://ant.design/components/date-picker/) | 넓은 제품 범위를 누락 탐지용 reference inventory로 사용, 입력·data display·navigation의 enterprise gap 확인 | Ant component API·CSS·runtime dependency, coverage 수치를 구현 완료로 해석 |

## Cross-platform parity 원칙

`shared`는 같은 픽셀을 그린다는 뜻이 아니라 같은 의미와 위계를 보장한다는 뜻입니다.
다음은 Web과 Native에서 동일해야 합니다.

- component의 semantic name과 책임
- tone, size, availability, validation 같은 public axis와 기본값
- multi-part component의 slot 이름과 콘텐츠 순서
- controlled/uncontrolled 상태 전이와 callback 의미
- 접근성 결과: 이름, 역할, 상태, action, 오류·설명 연결
- recipe가 가리키는 semantic color, spacing, radius, typography token

다음은 플랫폼 adapter에 남길 수 있습니다.

- DOM의 `as`, native element attribute, form submission
- Native의 `style`, `hitSlop`, safe-area, platform accessibility action
- hover와 focus-visible처럼 해당 플랫폼에만 존재하는 interaction state
- 같은 intent를 Web popover와 Native modal sheet로 표현하는 adaptive component

플랫폼 전용 escape hatch가 공통 semantic API를 바꾸면 안 됩니다. 예를 들어 Web Button의
`className`이나 Native Button의 `hitSlop` 때문에 tone/size/content API가 달라지는 것은 허용하지
않습니다.

## 정규화한 기본 문법

### 콘텐츠

- 가시 콘텐츠는 가능한 한 두 renderer 모두 `children`으로 받습니다.
- 보이는 label과 접근성 이름이 같으면 renderer가 이름을 재작성하지 않습니다.
- 별도 접근성 이름이 필요한 icon-only action만 현지화된 label을 필수로 받습니다.
- 복합 action은 `start`와 `end`처럼 논리 방향의 slot을 사용하고 `left`/`right`를 공통 API에
  넣지 않습니다.

### variant와 state

- variant는 제품 의미를 말합니다. raw color나 CSS/native style 값을 variant로 받지 않습니다.
- 같은 variant는 같은 emphasis hierarchy를 가집니다. 플랫폼마다 이름만 같은 별도 색 조합을
  만들지 않습니다.
- disabled, busy, invalid, selected는 색뿐 아니라 역할·상태·indicator로 드러냅니다.
- busy/pending action은 중복 activation을 막되 포커스를 제거하지 않습니다. 상태 변화는
  `aria-busy`/Native accessibility state와 progress indicator로 발표합니다.
- recipe default를 renderer에서 다시 하드코딩하지 않습니다. 공통 resolver나 recipe 값을 직접
  소비합니다.

### anatomy

Card처럼 여러 부분이 있는 컴포넌트는 `root`, `header`, `title`, `description`, `body`, `media`,
`footer`/`actions`처럼 책임이 있는 slot을 계약에 둡니다. Web만 title prop을 소유하고 Native는
children-only Surface alias가 되는 구조는 `shared`가 아닙니다.

## 확장 우선순위

### 1. NumberField

NumberField를 Slider보다 먼저 구현합니다. NumberField는 일반 폼에 직접 쓰이고, 같은
`min/max/step` 판단이 다음 Slider의 기반이 됩니다. 최소 acceptance는 다음과 같습니다.

- `number | null` value와 입력 중인 text를 구분
- finite `min < max`, positive step, clamp와 decimal-safe snap
- controlled/uncontrolled value가 같은 callback 의미를 가짐
- Web ArrowUp/ArrowDown과 stepper가 같은 resolver를 소비
- Native increment/decrement accessibility action과 버튼이 같은 resolver를 소비
- disabled/readOnly/invalid/description/error가 Field와 같은 연결 규칙을 사용
- stepper의 이름은 renderer가 번역하지 않고 소비자가 현지화된 copy를 제공
- 입력 중 IME/composition과 유효하지 않은 부분 문자열을 즉시 숫자 `0`으로 바꾸지 않음

React Aria는 locale formatting/parsing, 여러 numbering system, IME, mobile keyboard, step/clamp,
floating-point 보정까지 NumberField의 핵심 문제로 다룹니다. HJM 첫 slice는 기존
renderer-neutral numeric resolver를 사용하되, 지원하지 않는 locale parsing 기능을 제공한다고
주장하지 않습니다. locale-aware parser가 들어오기 전에는 명시된 decimal input grammar만
허용하고 문서에 범위를 적습니다.

### 2. Slider

Slider는 NumberField의 range resolver를 재사용하되 다음 문제를 별도로 닫은 뒤 승격합니다.

- drag 중 change와 interaction 종료 commit callback 분리
- keyboard 방향, Home/End/PageUp/PageDown과 RTL
- Native gesture measurement와 최소 touch target
- formatted value announcement와 visible value cue
- single thumb를 먼저 검증하고 range slider를 추측으로 열지 않음

### 3. breadth expansion

공통 numeric input 뒤에는 이미 한쪽 renderer가 있는 작은 gap을 먼저 닫습니다. Web의
Text/Divider/Section/Notice/Progress/Skeleton, Native의 Checkbox/CheckboxGroup/Select/LoadMore/Menu,
그리고 양쪽의 Avatar/Spinner가 후보입니다. 다만 public export가 있다는 이유만으로 beta가
되지는 않습니다. 공통 API 정규화, canonical default proof, Storybook registration을 모두
통과해야 surface maturity를 올립니다.

## 승격 규칙

외부 라이브러리가 기능을 제공한다는 사실은 HJM evidence가 아닙니다. 각 surface는 다음 순서를
거칩니다.

1. renderer-neutral recipe와 behavior/resolver
2. Web 또는 Native public renderer와 granular export
3. 실제 render를 수행하는 canonical default proof
4. Storybook registration과 catalog/generated manifest 동기화
5. keyboard, RTL, large text, accessibility, device 같은 추가 scenario별 실행 proof

이 순서가 끝나지 않은 구현은 public experimental renderer일 수는 있어도 catalog surface는
`planned`로 유지합니다. 참고 라이브러리의 문서나 테스트 결과를 HJM scenario 증거로 대신하지
않습니다.
