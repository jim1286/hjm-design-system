# @hjmds/react-native

Login screens use `AuthScreenLayout` from `@hjmds/react-native/auth-screen`. Set `mainCard` and supply
provider buttons with name-only labels in `main`. During authentication, pass a localized
`pendingLabel`: the actions become hidden and excluded from touch/accessibility navigation,
their layout preserves the card dimensions, and one loader appears at its centre. Remove the prop
on cancellation or failure to restore them. Keep the same `main` content mounted and avoid setting
each button's `busy` at the same time. See the [login layout contract](../design-contracts/docs/auth-screen.md).

Expo-independent React Native renderers for `@hjmds/design-contracts`. The default entries use only
React and React Native runtime APIs. The optional `toast-liquid` entry has additional native peers;
its supported host combinations and installation are documented below.

```tsx
import {
  Button,
  HjmNativeProvider,
  Stack,
  Text,
} from "@hjmds/react-native";

export function Screen() {
  return (
    <HjmNativeProvider>
      <Stack gap="md">
        <Text variant="title">프로필</Text>
        <Button onPress={() => undefined}>저장</Button>
      </Stack>
    </HjmNativeProvider>
  );
}
```

## Runtime boundaries

- React 19 or newer and React Native 0.81 or newer are peer dependencies.
- There is no Expo dependency and no navigation, icon, font-loading, or animation dependency.
- Native font scaling remains uncapped. At the root, HJM text—including raw Native labels and
  inputs owned by `TextField`, `TextArea`, `SearchField`, `Combobox`, `NumberField`, and `Slider`—
  delegates a detected system scale to the OS. An explicit Provider `textScale` (or resolved
  `value`) switches those controls to deterministic scaling and disables OS multiplication, so the
  requested scale is applied exactly once. A nested Provider inherits that absolute scale; its own
  `textScale` replaces rather than multiplies the parent value.
  Persistent `BottomNavigation` visual labels use their existing recipe limit of 1.4× in both
  OS and controlled Provider modes. The full destination name and sibling body text retain
  their ordinary accessibility contract. This fixes controlled-scale labels ignoring the
  native multiplier limit (BurnTok BT-QA-021); no consumer prop change is needed.
- Motion uses React Native's built-in `Animated` API and canonical recipe durations/easing; there
  is no third-party animation dependency. Reduced motion removes spatial exit movement and retains
  only the recipe-permitted enter opacity fallback.
- `direction` controls logical row order and text alignment without mutating the process-wide
  `I18nManager` setting.

`HjmNativeProvider` detects system color scheme, RTL, font scale, and reduced-motion preference.
Every axis can be overridden for tests or a product preference, and nested providers inherit
resolved parent values. Products with a reviewed semantic palette can pass the complete resolved
`value`; runtime validation rejects missing roles and non-composable color values, while partial
token overrides remain unsupported.

On statically rendered Expo web, an automatic system theme uses `light` for the
server HTML and first hydration snapshot, then updates to the browser preference.
React Native Web can initialize its color-scheme hook differently on server and
client; using the browser value during hydration left existing surfaces light
while newly mounted dialogs were dark. The shared snapshot ensures React updates
both together using React's [hydration snapshot contract](https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering).
Native and client-only web roots use the OS theme immediately;
explicit `theme`, resolved `value`, and inherited parent settings keep precedence.
The [browser regression](../react/test/native-provider-hydration.browser.test.tsx)
uses real React server rendering and DOM hydration with an RN Web appearance
boundary mock, alongside the [native precedence tests](test/provider-theme.test.tsx).

The package exports include:

- foundations: `Text`, `Surface`, `Stack`, `Container`, `AspectRatio`, `Icon`, `Section`, responsive `Grid`, adaptive `Layout`
- actions and fields: `Button`, `IconButton`, `BottomCTA`, `Link`, `Field`, `Form`, `TextField`,
  `TextArea`, `SearchField`, `Select`, `Combobox`, `NumberField`, `Slider`
- adaptive inputs: `DatePicker`, Expo-independent adapter-based `FilePicker`
- selection and navigation: `Checkbox`, `Radio`, `CheckboxGroup`, `RadioGroup`, `Switch`, `SegmentedControl`, `Chip`,
  `Tabs`, `Steps`, `BottomNavigation`, `TopBar`, `TopBarAction`, `Menu`
- display: `Badge`, `CounterBadge`, `Tag`, `Card`, `List`, `ListRow`, `Statistic`,
  `StatisticGroup`, `UploadItem`, `Avatar`, `Divider`, `Accordion`, `DescriptionList`, `Image`, `Timeline`
- feedback and collections: `Notice`, `EmptyState`, `Progress`, `Spinner`, `Skeleton`, `LoadMore`,
  `Result`, `Toast`, `ToastRegion`
- overlays: `Dialog`, `AlertDialog`, `Sheet`

## Composition style boundary

The normative [consumer policy](../design-contracts/docs/consumer-policy.md#31-react-native-legacy-style-compatibility-boundary)
defines the supported composition boundary. Version 1.11 removes deprecated public raw-style
props and compatibility aliases listed in the [migration guide](../design-contracts/docs/migration-native-legacy-removal.md).
Source changes do not update already installed npm packages. Upgrade each consumer's dependency
and lockfile together, and verify its supported surfaces.

Use `layoutStyle`, typed as `HjmCompositionStyle`, for screen placement. It accepts logical margins,
width, flex, and `alignSelf`, while excluding recipe-owned color, typography, padding, gap, border,
radius, height, opacity, transform, and interaction state. Use a composition wrapper where no
placement prop exists. Margin values come from spacing tokens or a reviewed product adapter.

```tsx
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { Surface } from "@hjmds/react-native/primitives";
import { type HjmCompositionStyle } from "@hjmds/react-native/composition-style";

const actionPlacement = {
  marginTop: spacing.md,
  width: "100%",
} satisfies HjmCompositionStyle;

<Surface layoutStyle={{ flexGrow: 1 }}>
  <Button layoutStyle={actionPlacement} onPress={save}>저장</Button>
</Surface>;
```

If a product needs a new color, type treatment, radius, density, or control size, add a semantic
theme/recipe axis with renderer evidence. Deprecated 1.x compatibility props are removed in 1.11;
private recipe composition and supported platform host styles are separate APIs.

`Image` consumes the same intrinsic descriptor as Web. `width` and `height`
reserve the frame before loading, omitted `decorative` defaults to `true`, and
`fit` is translated to the matching Native `resizeMode` (`fill` becomes
`stretch`). A failed informative image keeps its original accessible name and
shows a built-in fallback; changing `src` starts a fresh load.

```tsx
import { Image } from "@hjmds/react-native/data-display";
import { Image as ExpoImage } from "expo-image";

<Image
  src="https://cdn.example.com/standings.png"
  width={800}
  height={450}
  fit="contain"
  decorative={false}
  accessibilityLabel="2026 시즌 팀 순위 표"
  renderImage={({ src, fit, reportLoad, reportError, style }) => (
    <ExpoImage
      source={src}
      contentFit={fit}
      onLoad={reportLoad}
      onError={reportError}
      style={style}
    />
  )}
/>
```

Use `sourceAdapter` when the built-in React Native host needs headers, cache
metadata, or another `ImageSourcePropType`. The old `source` prop is removed in the next major;
provide canonical dimensions and use `sourceAdapter` for transport. See
[the migration guide](../design-contracts/docs/migration-native-legacy-removal.md).

`Badge.variant` is the shared `filled | outline` recipe axis on Web and Native. `ListRow` keeps
`titleMetadata` inside the row's accessible name only through caller-supplied `metadataLabel`, and
renders `trailingAction` as a separate target instead of nesting an action inside the row command.
Without `onPress`, its root is a non-interactive `View`. `List` requires a localized region `label`
and supports `plain | grouped` appearance; `Statistic` accepts `contextLabel`, an exact
`accessibilityLabel`, or a custom accessible-name composer.

`Dialog.title` and `Sheet.title` accept a string or a `ReactElement`. A string is the modal's accessible
name on its own; an element requires `accessibilityTitle` (enforced by the `OverlayTitleProps` union) because
the renderer does not flatten element children into an accessibility label. `accessibilityTitle` also
overrides a string title when the spoken name should differ from the displayed one.

## Controlled and uncontrolled state

Checkbox, CheckboxGroup, RadioGroup, Switch, SegmentedControl, Tabs, Accordion, Select, Combobox, Menu, Dialog,
AlertDialog, and Sheet support controlled and uncontrolled state. Do not switch a mounted component
between those modes. `BottomNavigation` is intentionally controlled-only: the router supplies
`descriptor.selectedKey`, and `onActivate` emits `navigate` or `reselect` intent without keeping a
second selection. `Form` keeps field values product-owned and only manages its submit session;
`LoadMore` similarly keeps collection data product-owned and gates page requests by `requestKey`.

`BottomNavigation.renderIcon` receives the recipe-owned `color`, `size`, and `strokeWidth` plus the
resolved item. Router adapters can forward `onLongActivate`, derive per-destination test IDs with
`getItemTestID`, replace only the hidden badge subtree with `renderBadge`, and compose a centered
`primaryAction` beside a `center-gap` destination list. Safe-area padding is additive, and
`keyboardBehavior: "hide"` subscribes to the cross-platform Native keyboard lifecycle.

`TopBar.title` is optional for action-only and back-only screens. The renderer keeps logical source
and reading order as leading/back, title when present, then trailing/actions in both directions;
large text stacks that same order and lets the title wrap. Prefer `TopBarAction` for toolbar
affordances: its localized `label` is a visible micro-label by default, the target remains at least
44 points, and `labelVisibility="accessibility-only"` is available for conventional back/close
icons. `intent="button"` can use `renderAction` for a product action wrapper, while
`intent="link"` passes its canonical destination and fully named pressable props to `renderLink`
for Expo Router or another router. A link may instead supply `onNavigate`; HJM never invents route
copy or destination handling. `titleLeading` stays decorative; pair it with `onTitlePress` and a
localized `titleAccessibilityLabel` when the complete title slot opens a profile, team, or account
switcher. The toolbar root is intentionally not a named accessibility group because its header and
actions remain separate reading-order targets.

```tsx
<TopBar
  onTitlePress={() => openTeamSwitcher()}
  title="HJM 러너스"
  titleAccessibilityHint="팀 선택 화면 열기"
  titleAccessibilityLabel="HJM 러너스, 팀 변경"
  titleLeading={<TeamAvatar />}
  actions={(
    <TopBarAction
      destination={{ kind: "internal", href: "/notifications" }}
      intent="link"
      label="알림"
      renderLink={({ destination, ...pressableProps }) => (
        <ProductRouterLink destination={destination} asChild>
          <Pressable {...pressableProps} />
        </ProductRouterLink>
      )}
    >
      <NotificationIcon />
    </TopBarAction>
  )}
/>
```

Attach a `LoadMoreHandle` ref when a virtualized list owns viewport detection, then call
`ref.current?.onEndReached()` from `FlatList.onEndReached`. The imperative path and the built-in
automatic/manual triggers share one cursor gate, so a ready `requestKey` cannot issue twice while
the product is committing its next collection state. `density="compact" | "regular"` changes only
the recipe-owned footer spacing. Ready/retry controls, the named busy progress indicator, error
announcement, and completion copy all bind to the shared state recipe. If `onLoadMore` rejects,
`onRequestError(error, reason)` receives the failure and the imperative bridge still resolves
without an unhandled rejection; update the controlled descriptor to `error` to render retry UI.
`onRequestOutcome` reports non-error controller outcomes for started, blocked, and de-duplicated
requests.

`NumberField` has the same `number | null` model, locale-neutral draft grammar,
blur/submit commit, clamp/snap resolver, and required localized stepper labels
as Web. Its buttons are 44-point targets and its text input exposes Native
increment/decrement accessibility actions. Native font scaling remains the
only text-scale multiplication. Currency/unit formatting, grouping separators,
locale-specific decimal separators, and non-Latin number parsing are not
claimed by this initial renderer. Non-ASCII numeric IME parsing and caret
preservation likewise remain unverified.

`Slider` reuses NumberField's min-origin clamp/snap resolver. It supports
controlled `value` or uncontrolled `defaultValue` (falling back to `min`),
horizontal LTR/RTL touch dragging, and atomic Native `adjustable`
increment/decrement actions. Products must provide localized `incrementLabel`
and `decrementLabel`; `getValueText` owns visible and announced formatting.
`onValueChange` fires throughout a drag, while `onValueChangeEnd` fires once on
release/termination and once per completed accessibility action. The responder
is dependency-free and the target remains at least 44 points. Disabling during
a drag commits the last value once, terminates the gesture, and ignores stale
move/release events. Off-grid controlled values remain visible, while user input
snaps and preserves exact min/max endpoints. Range/multi-thumb,
vertical orientation, marks, tooltips, nonlinear scales, and acceleration are
not claimed by this renderer.

Tabs exposes the shared `activationMode`, `mountPolicy`, `panelMode`, `orientation`, `direction`,
and `loop` policies. Uncontrolled Tabs and SegmentedControl reconcile a removed selection to the
first enabled item; controlled invalid or disabled selections fail before rendering.

For cross-renderer code, use the canonical collection/state vocabulary:

- `Tabs`, `RadioGroup`, and `SegmentedControl` take `items`; Native's former `options` prop is removed in 1.11.
- Native `TabItem` uses `id`, matching Web. The former `TabOption.value` and `options` path are removed.
- `Switch` takes `checked`, `defaultChecked`, and `onCheckedChange`, matching Web. Native's former
  `value`, `defaultValue`, and `onValueChange` aliases are removed in the next major.

Canonical and deprecated channels cannot be mixed in one component instance. The public types reject
ambiguous combinations, and runtime validation protects untyped JavaScript consumers.

`TextArea` follows the same accessible-name rule as `TextField`: provide either a visible `label`
or `accessibilityLabel`. `SearchField` can render product icons through `renderLeading`,
`renderClearIcon`, and `renderBusyIndicator`; its trailing precedence is busy, then clear, then the
passive `trailing` slot. `SegmentedControl` items can render their own leading visual.

Single-line `TextField` and `SearchField` frames grow with the effective input text scale and
shrink when it returns to normal. This prevents the OS large-text overflow observed in BurnTok
folder names (BT-QA-020). Keep the recipe-owned minimum height; stack adjacent product actions
when space is narrow. Do not override the frame with a fixed height to contain enlarged text.
Explicit native font-scaling options still determine the same text and frame scale.

`Checkbox` supports boolean and `"mixed"` state, read-only semantics, plain/card presentation,
compact/default sizing, and replaceable leading/indicator visuals. `CheckboxGroup` validates unique
enabled option keys and exposes controlled or uncontrolled immutable `ReadonlySet` selection.
`RadioGroup` shares the presentation, size, leading, read-only, invalid, required, and indicator
contracts, supports vertical or horizontal layout, and stacks a horizontal group when large text
would make the row unsafe. `indicator="none"` is intended for products whose leading visual or card
selection treatment is sufficient; the Native selected/checked state is still announced.

Pass the trigger's native `returnFocusRef` to an overlay. After a real Native Modal dismissal—whether requested by
an action, Android back, scrim dismissal, or a controlled parent—the renderer returns assistive
technology focus through `AccessibilityInfo.setAccessibilityFocus`.

`AlertDialog` consumes the shared `request` contract and session, so async confirm runs once, busy
state blocks every dismissal, and a rejected action announces its fallback error while remaining
open. AlertDialog and Sheet keep the Native host at `animationType="none"`, own their recipe motion,
and settle only after visual exit plus host teardown. iOS uses the real `Modal.onDismiss`; Android
finishes after the no-animation host-removal commit and queued interactions drain. Rapid reopen is
either resumed in the existing host during visual exit or deferred until teardown, so a stale close
cannot restore focus or publish `onDismissComplete` over a successor surface. `Sheet` also applies
the shared `dismissPolicy` and reports the concrete reason through `onOpenChange`.

`Select`, `Combobox`, and `Menu` accept a flat collection, canonical collection source, or sectioned
collection and reject ambiguous combinations. They support loading, error, empty, and loading-more
states, retry actions, read-only triggers, product-owned leading visuals, and reasoned open-change
callbacks. Selection or action side effects that must navigate or replace the screen belong in
`onSelectionAfterDismiss`, `onCommitAfterDismiss`, or `onActionAfterDismiss`; these callbacks run
only after the Native Modal has torn down. The renderer keeps the host at `animationType="none"` so
iOS `Modal.onDismiss` and Android's post-commit interaction boundary represent the same lifecycle.
All interactive targets have a 44-point minimum.

`Link` consumes the shared destination descriptor but delegates navigation to the product's
`onNavigate` router boundary; the renderer never guesses how internal routes or external URLs open.

`BottomCTA` accepts localized `loadingLabel` copy per descriptor and either a second descriptor or
an arbitrary product-owned `secondaryAction` node. `Notice` and `EmptyState` make announcement
priority explicit (`none | polite | assertive`); both expose product visual slots, and EmptyState can
use `align="upper"` for scrollable screens. A `Section` may omit its heading when the screen already
owns the accessible title.

## Localization ownership

The Native renderer has no built-in language. Products must inject localized
copy for `Form.fallbackErrorMessage`, `SearchField.clearLabel` /
`SearchField.busyLabel`, `Select.placeholder` / `Select.dismissLabel`,
`Combobox.emptyMessage` / `loadingMessage` / `clearLabel` / `dismissLabel`,
`Menu.dismissLabel`, collection retry/error/loading-more copy where used,
`Slider.incrementLabel` / `Slider.decrementLabel`, and
`Dialog.closeLabel` / `Sheet.closeLabel`. Optional
region names remain injectable through `Select.optionsAccessibilityLabel`,
`Combobox.resultsAccessibilityLabel`, `AccordionItem.contentAccessibilityLabel`,
`TabItem.panelAccessibilityLabel`, and `ToastRegion.accessibilityLabel`.
When those optional names are absent, the renderer relies on the Native role,
state, or the caller's existing control label instead of inventing translated
suffixes. `RadioGroup.requiredLabel` and `readOnlyLabel` are optional localized
qualifiers; a language-neutral asterisk and disabled interaction state remain
when they are omitted.

`ToastRegion` can wrap a screen and exposes `useToastRegion().publish()` / `dismiss()`. The shared
bounded FIFO store owns `maxVisible`, `maxQueued`, duplicate and overflow policies, exactly-once
action/dismiss behavior, app-background and interaction timer pauses, and interrupted teardown.
It announces normal priority politely and high priority assertively, and keeps actionable toasts
persistent unless the descriptor supplies a duration.
Placement, physical or logical safe-area insets, keyboard avoidance, and an additional bottom-bar
offset are renderer inputs. Toast transitions bind to the Native recipe and complete synchronously
under reduced motion; `renderToneIcon` lets products map the generic tone/mark contract to
their icon set.

Checkbox, CheckboxGroup, Select, Combobox, and Menu publish Native beta evidence for their literal
default render cases. Combobox also guards externally managed results with their originating query
and can retain a product-supplied selected-item snapshot. Those component tests do not certify
device IME composition, active-option scrolling, or assistive-technology behavior; products should
keep those axes in their own device matrix.

## Grid

`Grid` delegates window classes and column geometry to `@hjmds/design-contracts/grid`. Native
`useWindowDimensions()` supplies density-independent window width, so the same
compact/medium/expanded/wide thresholds are used on Web and Native. Column geometry uses an
explicit `availableWidth` when provided; otherwise `Grid` measures its rendered container with
`onLayout` (using window width only for the safe first render). `DescriptionList` follows the same
nested-container measurement rule.

For bundle-sensitive entry points, import only the renderer family you use, for example
`@hjmds/react-native/actions`, `@hjmds/react-native/forms`,
`@hjmds/react-native/number-field`, `@hjmds/react-native/slider`,
`@hjmds/react-native/date-picker`, `@hjmds/react-native/file-picker`,
`@hjmds/react-native/steps`, `@hjmds/react-native/upload-item`, or
`@hjmds/react-native/feedback`. Available
executable families are `provider`, `primitives`, `actions`, `inputs`, `number-field`, `slider`,
`date-picker`, `file-picker`, `steps`, `upload-item`, `forms`, `navigation`, `data-display`,
`feedback`, `overlays`, and `evidence`. These supported
family-level subpaths are verified not to traverse the renderer root barrel. They do not promise a
separate file or component-level tree-shaking result for every named export.

## Renderer evidence

`@hjmds/react-native/evidence` publishes schema v2 claims. Each claim links the baseline environment
matrix—default, dark, long copy, large text, RTL, reduced motion, and accessibility structure—to a
literal case in `test/default-render.test.tsx`; package tests fail if the case inventory and
manifest diverge. These are component-level `react-test-renderer` smoke proofs, not screenshot,
device, TalkBack, VoiceOver, or performance certification. Keyboard/accessibility-action and paired
platform parity remain fail-closed until a dedicated proof is mapped.

## Metro production smoke

Run `pnpm --filter @hjmds/react-native bundle:check` from the workspace root. The check builds the
renderer, derives the executable-family inventory from package exports, and creates one minified
Android production bundle from a fixture that must directly import every family. It verifies the
source-map module graph in a temporary directory and fails if a family is absent, the root barrel is
pulled in, or Expo, `react-dom`, or `@hjmds/react` contaminates the graph. The aggregate raw and gzip
budgets measure Metro JavaScript before Hermes bytecode compilation. Per-family source-graph budgets
are enforced separately by `pnpm bundle:renderer:check`; neither check predicts the final app bundle,
component-level tree shaking, or Android device-runtime behavior.
## Optional Liquid Toast

The existing Toast can opt into a capsule/droplet presentation through the separate
`@hjmds/react-native/toast-liquid` entry. See [Liquid Toast](docs/liquid-toast.md) for optional peers,
host integration, fallback behavior and the current device-validation limits.

## ThinkingOrb

Experimental Native (device verification pending) AI operation indicator: `@hjmds/react-native/thinking-orb`.
Requires a localized `label`; `state`, `size` (20/64), `paused`, and `active` control its presentation.
See [the shared contract and compatibility](../design-contracts/docs/thinking-orb.md).

## Optional presentation adapters

See [installation and behavior contracts](../design-contracts/docs/optional-adapters.md) for opt-in entries, pinned peers and verification limits. Native adapters remain experimental until device verification.

## Data layouts and QRCode

Masonry and VirtualList use the granular `masonry` and `virtual-list` entries.
Supply measured item heights for Masonry and a fixed row height for VirtualList.
The optional `qr-code` entry requires `qrcode-generator@2.0.4` and a visible alternative
action alongside the accessible code. Native also requires `react-native-svg@15.15.5`.
For the optional native menu, apply the host patches documented in [patch installation](docs/patches/README.md).

## Optional interaction adapters

Stable `sortable`, `swipe-actions`, `content-transition`, `carousel-motion` and `celebration` entries plus experimental native `screen-transition` are available through explicit subpath imports. See [installation, localized labels and behavior contracts](../../docs/interaction-adapters.md), including pinned peers and native verification limits. These adapters are not root exports.


### Menu without a visible heading

Pass `title=""` to omit the visible heading and its line box. The menu retains
`triggerLabel` as its accessible name. This fixes the blank space left by an empty
Text heading observed in BurnTok's owner menu; consumers should not compensate
with negative margins.

### Reference-inspired navigation

`@hjmds/react-native/navigation-bar` exports [NavigationBar](../design-contracts/docs/navigation-bar.md)
with an opaque semantic surface and adaptive slots, without a required blur dependency.
Existing [BottomNavigation](../design-contracts/docs/bottom-navigation.md) accepts the
`capsule` presentation with an adjacent action and large-text label fallback.


iOS TextArea의 실제 글자 배율이 바뀌면 기존 attributed 본문도 갱신한다(BT-QA-025). Native editor만 교체하고 초안·외부 ref·포커스·선택 영역을 보존하며, 같은 배율·Android·한 줄 입력은 재마운트하지 않는다. 공개 API 변경은 없다. 실제 Android 입력 동작 검증과 정식 게시/소비 버전 반영은 별도다.

Dialog/AlertDialog viewport candidate BT-QA-027 keeps copy in an internal shrinking scroll body and actions outside it, with provider safe-area padding. Host contracts and normal-size BurnTok iOS confirmation/cancel pass; long-content device geometry remains pending after the user stopped enlarged-text QA. No public API migration or published-version claim.
