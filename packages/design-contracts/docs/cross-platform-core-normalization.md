# Cross-platform core normalization

Text, Surface, Stack, Grid, Button, IconButton, Tag, Card의 공통 의미 축은 contracts가 소유하고 Web과
Native renderer는 각 플랫폼 host로 번역한다. 라이브러리 비교와 채택/기각 근거는
[library-reference-decisions.md](./library-reference-decisions.md)를 따른다.

## Canonical API

| Component | 공통 축 | 기본값 | 공통 anatomy |
| --- | --- | --- | --- |
| Text | `variant`, `tone`, `emphasis`, `children` | `body`, `primary`, `regular` | `root` |
| Surface | `tone`, `bordered`, `padding`, `radius` | `default`, `false`, `none`, `lg` | `root` |
| Stack | `axis`, `gap`, `align`, `justify`, `wrap` | `block`, `md`, `stretch`, `start`, `false` | `root` |
| Grid | `columns`, `gap`, `minColumnWidth`, `children` | `gap: md`, `flow: row-major` | `root`, `item` |
| Button | `tone`, `size`, `loading`, `disabled`, `leading`, `trailing`, `children` | `primary`, `medium`, `false`, `false` | `root`, `leading`, `label`, `trailing`, `spinner` |
| IconButton | `label`, `tone`, `size`, `shape`, `loading`, `disabled`, `children` | `ghost`, `medium`, `rounded`, `false`, `false` | `root`, `icon`, `spinner` |
| Tag | `tone`, `children` | `neutral` | `root`, `label` |
| Card | `tone`, `selected`, `bordered`, `padding`, `title`, `description`, `media`, `children`, `actions` | `default`, `false`, `true`, `md` | `root`, `media`, `body`, `title`, `description`, `content`, `actions` |

공통 타입과 값의 source of truth는 다음과 같다.

- `base-recipes.ts`: Button/Surface tone·size·geometry와 `surfaceDefaults`
- `component-recipes.ts`: Text/Stack axis와 defaults
- `grid.ts`: responsive columns/gap/minimum-width descriptor와 공통 layout resolver
- `icon-button-recipe.ts`: IconButton tone/size/shape, hit target, non-CSS color resolver
- `tag.ts`: Tag descriptor, recipe, non-CSS presentation resolver
- `card.ts`: Card slot anatomy와 defaults

## 같은 의미, 다른 host

플랫폼 host 차이를 가짜 공통 prop으로 숨기지 않는다.

| Web | Native | 이유 |
| --- | --- | --- |
| Text `as` | Text `align` | HTML element semantics와 Native logical alignment |
| Surface `as` | 숫자 `padding`/`radius` 허용 | HTML landmark 선택과 Native animation/layout interop |
| Grid `windowWidth` | Grid `onLayoutResolved`, `itemStyle` | DOM 측정/SSR override와 Native item wrapper 적용 |
| Button form props, DOM events | Pressable props, Native events | 각 플랫폼 activation 모델 |
| Card `headingLevel` 2–4 | title에 `accessibilityRole="header"` | Native에는 HTML heading level과 동등한 host primitive가 없음 |

`loading`과 `disabled`는 같은 상태가 아니다. 두 renderer 모두 loading 중 activation을
막고 busy 상태를 보조 기술에 노출하지만, pending control의 focusability는 유지한다.
명시적 `disabled`만 host의 disabled 상태가 된다.

IconButton은 보이는 텍스트가 없으므로 현지화된 `label`과 icon `children`을 두 renderer에서
필수로 받는다. `size`는 36/44/52 visual diameter를 선택하고 small은 Web pseudo hit area와
Native `hitSlop=4`로 44 target을 만든다. tone 색은 renderer별 표가 아니라 공통 resolver에서
결정한다.

Surface의 `accent` border도 동일하게 해석한다. `borderAlways`가 `false`이므로
`bordered=true`일 때만 primary 30% edge를 그리고, `subtle`은 contract가 요구하는
edge를 항상 그린다.

## 0.5 compatibility aliases

0.6에서 canonical API로 옮길 수 있도록 기존 Native 호출은 당분간 동작한다.

```tsx
// before
<Stack direction="row" />
<Button label="저장" />
<Tag label="신규" />
<Surface tone="brand" />
<Grid descriptor={{ columns: { compact: 1, medium: 2 } }} />
<IconButton accessibilityLabel="닫기" icon={<CloseIcon />} tone="link" />

// canonical
<Stack axis="inline" />
<Button>저장</Button>
<Tag>신규</Tag>
<Surface tone="accent" />
<Grid columns={{ compact: 1, medium: 2 }} />
<IconButton label="닫기" tone="ghost"><CloseIcon /></IconButton>
```

- Native `Stack.direction`: `row → inline`, `column → block` deprecated alias
- Native `Button.label`, `Tag.label`: `children` deprecated alias
- Native `Surface.sunken`, `Surface.brand`: 각각 `subtle`, `accent` deprecated alias
- Native `Grid.descriptor`: flat `columns`/`gap`/`minColumnWidth`를 위한 deprecated alias
- Native `IconButton.accessibilityLabel`, `icon`: `label`, `children` deprecated alias
- Native `IconButton tone="link"`: `ghost`로 번역되는 deprecated alias

호환 alias는 새 문서와 예제에서 사용하지 않는다. 제거는 major release에서만 한다.

## Collection and state vocabulary

공통 제품 코드에서 같은 역할은 같은 이름을 사용한다. Web을 기준으로 Native의 비파괴 호환
bridge를 추가했으며, 새 코드는 canonical 열만 사용한다.

| Component | Canonical Web/Native API | Deprecated Native alias |
| --- | --- | --- |
| Switch | `checked`, `defaultChecked`, `onCheckedChange` | `value`, `defaultValue`, `onValueChange` |
| RadioGroup | `items: RadioGroupItem[]` | `options: RadioOption[]` |
| SegmentedControl | `items: SegmentedControlItem[]` | `options: SegmentedControlOption[]` |
| Tabs | `items: TabItem[]`, item key `id` | `options: TabOption[]`, item key `value` |
| Select | `source`/`items`/`sections`, `selectedKey`, `defaultSelectedKey`, `onSelectionChange` | `options`, `value`, `defaultValue`, `onValueChange` |

한 인스턴스에서 canonical과 deprecated channel을 함께 전달하면 타입과 runtime 모두 실패한다.
이 규칙은 TypeScript를 우회하는 JavaScript 소비자에게도 결정적인 상태 모델을 보장한다.

## Reference application notes

상위 판단 원칙은 [library-reference-decisions.md](./library-reference-decisions.md)에만 둔다.
이번 API에 적용한 구체적 참고점은 다음과 같다.

- [MUI Grid](https://mui.com/material-ui/react-grid/)처럼 responsive columns와 spacing을
  wrapper descriptor가 아닌 Grid의 직접 public axis로 둔다.
- [MUI IconButton API](https://mui.com/material-ui/api/icon-button/)의 size/content 분리와
  [React Aria Button](https://react-aria.adobe.com/Button)의 pending focus 보존을 결합하되,
  HJM tone/shape/default는 공통 recipe가 소유한다.
- Native host에는 [React Native accessibility](https://reactnative.dev/docs/accessibility)의
  accessible name과 `accessibilityState.busy/disabled`를 번역한다.

## Audited next migrations

Accordion은 이름만 맞추면 의미가 오히려 불명확해져 이번 release에서 억지로 합치지 않았다.

- Web은 single/multiple mode에 따라 `value: string | string[]`, `allowsMultipleExpanded`,
  `items[{id,title,panel}]`을 사용한다.
- Native는 항상 집합 형태인 `expandedValues: string[]`, `multiple`,
  `items[{value,title,content}]`를 사용한다.
- 공통 descriptor의 key/content 이름과 single/multiple selection type을 먼저 결정한 뒤,
  기존 두 모델을 deprecated alias로 격리해야 한다. host event/style 차이와 달리 이 상태 모델
  차이는 다음 minor의 명시적 migration 대상이다.

## Intentional remaining differences

- Web ref는 실제 DOM element이고 Native ref/event/style은 React Native host 계약을 따른다.
- Web Button은 submit/reset/form association을 제공하고 Native Button은 제공하지 않는다.
- Web Card는 실제 heading level을 선택할 수 있지만 Native는 header role까지만 보장한다.
- Native는 layout animation과 계산 결과를 적용하기 위해 숫자 spacing/radius를 확장 입력으로
  허용한다. 공통 코드에는 token 이름을 사용한다.

이 차이는 parity 실패가 아니라 platform translation이다. tone, size, defaults, state,
slot anatomy가 달라지면 parity 실패로 간주한다.
