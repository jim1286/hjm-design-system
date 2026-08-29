# v0.6 migration

v0.6은 renderer가 없는 계약 패키지의 역할을 이름에서 분명히 하고, Web/RN 앱이 필요한
graph만 가져가도록 package boundary를 나누는 breaking release입니다. package name은
`@hjm/design-system`에서 `@hjmds/design-contracts`로 변경됩니다. 이전 이름 alias나 호환
wrapper는 제공하지 않습니다.

같은 release에서 공식 renderer도 monorepo package로 제공됩니다. Web은 `@hjmds/react`,
React Native는 `@hjmds/react-native`를 선택하고 contracts와 같은 tag를 고정합니다.

## 1. dependency와 import를 원자적으로 변경

dependency와 source/test/Storybook/build script의 import를 같은 변경에서 전환합니다.

```diff
- "@hjm/design-system": "git+https://github.com/jim1286/hjm-design-system.git#v0.5.2"
+ "@hjmds/design-contracts": "git+https://github.com/jim1286/hjm-design-system.git#v0.6.0&path:/packages/design-contracts"
```

기존 root symbol은 유지되지만 package specifier가 바뀌므로 모든 import를 갱신해야 합니다.

```diff
- import { spacing, typography } from "@hjm/design-system";
+ import { spacing, typography } from "@hjmds/design-contracts/foundations";
```

## 2. 앱 runtime은 granular subpath 사용

- 토큰 전체: `@hjmds/design-contracts/tokens`
- foundation만: `@hjmds/design-contracts/foundations`
- palette만: `@hjmds/design-contracts/colors`
- window class와 responsive value: `@hjmds/design-contracts/responsive`
- Grid descriptor와 geometry: `@hjmds/design-contracts/grid`
- 공통 recipe: `@hjmds/design-contracts/recipes`
- Button·Surface·Field 최소 recipe: `@hjmds/design-contracts/recipes/base`
- 공통 anatomy/style contract: `@hjmds/design-contracts/contracts`
- 현재 contract 버전만: `@hjmds/design-contracts/version`
- 단일 상태·validator: `@hjmds/design-contracts/components/<name>`

예를 들어 Toast adapter는 전체 root 대신 다음처럼 가져옵니다.

```ts
import { createToastStore } from "@hjmds/design-contracts/components/toast";
import { resolveContentStateAnnouncement } from "@hjmds/design-contracts/components/content-state";
```

`/recipes/all`, `/behaviors`, `/catalog`, `/evidence`, `/showcase`는 전체 registry 또는 CI
metadata가 필요한 도구용입니다. JS를 실행하지 않는 CI는
`@hjmds/design-contracts/manifest.json`과
`@hjmds/design-contracts/renderer-evidence.json`을 읽을 수 있습니다. RN 화면 runtime에서
root나 tooling entry를 사용하면 Metro가 불필요한 계약 graph를 따라갈 수 있습니다.

## 3. renderer 설치

Web 앱:

```bash
pnpm add \
  '@hjmds/design-contracts@git+https://github.com/jim1286/hjm-design-system.git#v0.6.0&path:/packages/design-contracts' \
  '@hjmds/react@git+https://github.com/jim1286/hjm-design-system.git#v0.6.0&path:/packages/react'
```

React Native 앱은 Web package 이름을 유지한 채 path만 바꾸지 말고, Native renderer 이름과
path를 함께 지정합니다.

```bash
pnpm add \
  '@hjmds/design-contracts@git+https://github.com/jim1286/hjm-design-system.git#v0.6.0&path:/packages/design-contracts' \
  '@hjmds/react-native@git+https://github.com/jim1286/hjm-design-system.git#v0.6.0&path:/packages/react-native'
```

renderer는 contracts를 peer dependency로 요구하므로 두 항목을 모두 명시해야 합니다.

## 4. renderer의 localized copy를 명시적으로 주입

v0.6 renderer는 한국어 또는 영어 문구를 내부 default로 만들지 않습니다. 아래 prop은
사용자에게 보이거나 screen reader가 읽는 제품 copy이므로 필수가 되었고, 누락하면
TypeScript가 migration 지점을 표시합니다.

- Web: `SearchField.clearLabel`, `Select.placeholder`,
  `Select.emptySelectionLabel`, `Combobox.emptyMessage`,
  `Combobox.loadingMessage`, `Combobox.selectionRequiredMessage`,
  `Dialog.closeLabel`, `Sheet.closeLabel`, `Table.emptyState`
- React Native: `Form.fallbackErrorMessage`, `SearchField.clearLabel`,
  `SearchField.busyLabel`, `Select.placeholder`, `Select.dismissLabel`,
  `Combobox.emptyMessage`, `Combobox.loadingMessage`, `Combobox.clearLabel`,
  `Combobox.dismissLabel`, `Menu.dismissLabel`, `Dialog.closeLabel`,
  `Sheet.closeLabel`

앱의 i18n catalog에서 각 값을 공급합니다. 선택 목록·결과·패널 region 이름처럼 기존
control label에서 중립적으로 유도할 수 있는 이름은 optional prop으로 남으며, renderer는
번역 suffix를 덧붙이지 않습니다.

```tsx
<SearchField label={t("search.label")} clearLabel={t("search.clear")} />
<Dialog title={t("settings.title")} closeLabel={t("settings.close")} trigger={trigger} />
```

## 5. Web/RN core component API 정규화

Text, Surface, Stack, Button, Tag, Card는 두 renderer에서 같은 semantic axis와 기본값을
사용합니다. 신규 코드는 다음 canonical API를 사용합니다.

```diff
- <Stack direction="row" />
+ <Stack axis="inline" />

- <Button label={t("save")} />
+ <Button>{t("save")}</Button>

- <Tag label={t("new")} />
+ <Tag>{t("new")}</Tag>

- <Surface tone="brand" />
+ <Surface tone="accent" />

- <Grid descriptor={{ columns: { compact: 2 } }} />
+ <Grid columns={{ compact: 2 }} />

- <IconButton accessibilityLabel={t("close")} icon={<Close />} tone="link" />
+ <IconButton label={t("close")} tone="ghost"><Close /></IconButton>
```

위 Native 호출은 0.6에서도 deprecated alias로 동작합니다. `Stack.direction`,
`Button.label`, `Tag.label`, Surface의 `sunken`/`brand`, `Grid.descriptor`, IconButton의
`accessibilityLabel`/`icon`/`tone="link"` 제거는 major release에서만
진행합니다. 하지만 새 예제·Storybook·제품 코드는 alias를 사용하지 않아야 합니다.

Button의 `loading`은 이제 `disabled`와 다른 상태입니다. 중복 activation은 막지만
포커스를 제거하지 않고 busy 상태를 보조 기술에 발표합니다. 로딩 중 포커스가 다른 곳으로
강제로 이동한다고 가정한 테스트가 있다면 focus 유지 기대값으로 바꿉니다.

Card는 더 이상 Native의 단순 Surface alias가 아닙니다. 양쪽에서 `media`, `title`,
`description`, `children`, `actions`, `selected` anatomy를 공유하며 계약은
`@hjmds/design-contracts/components/card`와 `cardRecipe`에서 가져옵니다. 전체 정규화 표와
호환 범위는 [`cross-platform-core-normalization.md`](./cross-platform-core-normalization.md)를
참고합니다.

## 6. 실험적 NumberField·Slider renderer

Web과 Native renderer에 `NumberField`와 `./number-field` granular entry가 추가됐습니다.
값은 `number | null`이고 편집 중 문자열은 blur/submit 전까지 별도 draft로 유지합니다.
두 플랫폼 모두 증감 action의 현지화된 이름을 필수로 받습니다.

```tsx
<NumberField
  label={t("partySize.label")}
  decrementLabel={t("partySize.decrement")}
  incrementLabel={t("partySize.increment")}
  min={1}
  max={8}
  defaultValue={2}
/>
```

현재 parser는 locale-neutral ASCII decimal/exponent만 지원합니다. 통화·단위·grouping separator,
locale별 decimal separator를 자동 지원한다고 가정하지 마세요. 실제 제품 numeric-input
vertical slice가 아직 없으므로 catalog surface는 `planned`이며, 이 API는 0.6에서 먼저
검증하는 experimental renderer입니다.

`Slider`와 `./slider` entry도 두 renderer에 추가됐습니다. NumberField와 같은 min-origin
clamp/snap resolver를 사용하며, drag/keyboard 중 `onValueChange`와 interaction 종료 시
`onValueChangeEnd`를 분리합니다. Web은 native range input의 keyboard/pointer semantics를
사용하고, Native는 dependency-free responder와 `adjustable` action을 사용합니다.

```tsx
<Slider
  label={t("score.label")}
  min={0}
  max={100}
  step={5}
  defaultValue={50}
  getValueText={(value) => t("score.value", { value })}
  onValueChange={setDraftScore}
  onValueChangeEnd={saveScore}
/>
```

Native에서는 위 props에 제품이 번역한 `decrementLabel`과 `incrementLabel`도 필수입니다.
첫 slice는 horizontal single-thumb만 지원합니다. range/multi-thumb, vertical orientation,
marks, nonlinear scale은 실제 제품 요구와 fixture가 생기기 전까지 열지 않습니다. Slider도
실제 product numeric flow 증거 전에는 catalog Web/Native surface가 `planned`입니다.

## 7. 설치·번들 검증

1. lockfile을 다시 생성합니다.
2. 이전 package name 또는 중복 dependency가 남지 않았는지 검사합니다.
3. Web production build와 RN Metro/Hermes export를 모두 실행합니다.
4. 이 저장소에서는 import graph budget까지 포함하는 `pnpm check`를 실행합니다.

```bash
rg '@hjm/design-system' src test package.json
pnpm check
```

첫 검색은 결과가 없어야 합니다. `v0.5.2`와 이전 tag에는 이전 package name이 들어 있으므로,
새 package name으로 바꾼 뒤 예전 tag를 계속 가리키는 조합은 설치할 수 없습니다.
