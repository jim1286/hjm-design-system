# @hjm/react-native

Expo-independent React Native renderers for `@hjm/design-contracts`. The package uses only
React and React Native runtime APIs, so it can be consumed by bare React Native and Expo apps.

```tsx
import {
  Button,
  HjmNativeProvider,
  Stack,
  Text,
} from "@hjm/react-native";

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
- Native font scaling remains enabled. Layout decisions consume the Provider's detected
  `textScale`; components do not multiply native font sizes a second time.
- Motion is intentionally static in this vertical slice, so reduced-motion users never receive
  required movement. Modal transitions become `none` when reduced motion is active.
- `direction` controls logical row order and text alignment without mutating the process-wide
  `I18nManager` setting.

`HjmNativeProvider` detects system color scheme, RTL, font scale, and reduced-motion preference.
Every axis can be overridden for tests or a product preference, and nested providers inherit
resolved parent values.

The package exports include:

- foundations: `Text`, `Surface`, `Stack`, `Icon`, `Section`, responsive `Grid`
- actions and fields: `Button`, `IconButton`, `BottomCTA`, `Link`, `Field`, `Form`, `TextField`,
  `TextArea`, `SearchField`, `Select`, `NumberField`, `Slider`
- selection and navigation: `Checkbox`, `RadioGroup`, `Switch`, `SegmentedControl`, `Chip`,
  `Tabs`, `BottomNavigation`, `TopBar`, `Menu`
- display: `Badge`, `CounterBadge`, `Tag`, `Card`, `List`, `ListRow`, `Statistic`,
  `StatisticGroup`, `Avatar`, `Divider`, `Accordion`, `DescriptionList`, `Image`
- feedback and collections: `Notice`, `EmptyState`, `Progress`, `Spinner`, `Skeleton`, `LoadMore`,
  `Toast`, `ToastRegion`
- overlays: `Dialog`, `AlertDialog`, `Sheet`

## Controlled and uncontrolled state

Checkbox, RadioGroup, Switch, SegmentedControl, Tabs, Accordion, Select, Menu, Dialog,
AlertDialog, and Sheet support controlled and uncontrolled state. Do not switch a mounted component
between those modes. `BottomNavigation` is intentionally controlled-only: the router supplies
`descriptor.selectedKey`, and `onActivate` emits `navigate` or `reselect` intent without keeping a
second selection. `Form` keeps field values product-owned and only manages its submit session;
`LoadMore` similarly keeps collection data product-owned and gates page requests by `requestKey`.

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

Pass the trigger's native `returnFocusRef` to an overlay. After a real Native Modal dismissal—whether requested by
an action, Android back, scrim dismissal, or a controlled parent—the renderer returns assistive
technology focus through `AccessibilityInfo.setAccessibilityFocus`.

`AlertDialog` consumes the shared `request` contract and session, so async confirm runs once, busy
state blocks every dismissal, and a rejected action announces its fallback error while remaining
open. Its `onResult` settles after `Modal.onDismiss`, enabling safe successor surfaces. `Sheet`
applies the shared `dismissPolicy`, reports the concrete reason through `onOpenChange`, and calls
`onDismissComplete` only after Native dismissal.

`Select` and `Menu` own their trigger, so they automatically enter their accessible Modal content
and return focus to that trigger after selection, Android back, or scrim dismissal. All interactive
targets have a 44-point minimum. Modal transitions are disabled when the Provider resolves reduced
motion.

`Link` consumes the shared destination descriptor but delegates navigation to the product's
`onNavigate` router boundary; the renderer never guesses how internal routes or external URLs open.

## Localization ownership

The Native renderer has no built-in language. Products must inject localized
copy for `Form.fallbackErrorMessage`, `SearchField.clearLabel` /
`SearchField.busyLabel`, `Select.placeholder` / `Select.dismissLabel`,
`Combobox.emptyMessage` / `loadingMessage` / `clearLabel` / `dismissLabel`,
`Menu.dismissLabel`, `Slider.incrementLabel` / `Slider.decrementLabel`, and
`Dialog.closeLabel` / `Sheet.closeLabel`. Optional
region names remain injectable through `Select.optionsAccessibilityLabel`,
`Combobox.resultsAccessibilityLabel`, `AccordionItem.contentAccessibilityLabel`,
`TabOption.panelAccessibilityLabel`, and `ToastRegion.accessibilityLabel`.
When those optional names are absent, the renderer relies on the Native role,
state, or the caller's existing control label instead of inventing translated
suffixes. `RadioGroup.requiredLabel` and `readOnlyLabel` are optional localized
qualifiers; a language-neutral asterisk and disabled interaction state remain
when they are omitted.

`ToastRegion` can wrap a screen and exposes `useToastRegion().show()` / `dismiss()`. The shared
bounded FIFO store owns `maxVisible`, `maxQueued`, duplicate and overflow policies, exactly-once
action/dismiss behavior, app-background and interaction timer pauses, and interrupted teardown.
It announces normal priority politely and high priority assertively, and keeps actionable toasts
persistent unless the descriptor supplies a duration.

`Combobox` is exported for integration work, but is not claimed by renderer evidence yet. Its
Native surface remains planned until IME composition, asynchronous result-query relation,
transient selected-item retention, and active-option scrolling have executable proof.

## Grid

`Grid` delegates window classes and column geometry to `@hjm/design-contracts/grid`. Native
`useWindowDimensions()` supplies density-independent width, so the same compact/medium/expanded/
wide thresholds are used on Web and Native.

For bundle-sensitive entry points, import only the renderer family you use, for example
`@hjm/react-native/actions`, `@hjm/react-native/forms`,
`@hjm/react-native/number-field`, `@hjm/react-native/slider`, or
`@hjm/react-native/feedback`. Available
families are `provider`, `primitives`, `actions`, `inputs`, `forms`, `navigation`, `data-display`,
`feedback`, `overlays`, and `evidence`. These subpaths avoid traversing the root barrel in Metro configurations
that do not perform export-level tree shaking.

## Renderer evidence

`@hjm/react-native/evidence` publishes schema v2 claims. Each claim links its `default` scenario to
a literal case in `test/default-render.test.tsx`; package tests fail if the case inventory and
manifest diverge. These are component-level `react-test-renderer` smoke proofs. They are not device,
TalkBack, VoiceOver, RTL screenshot, large-text screenshot, or performance certification, so those
scenario axes are deliberately not claimed.

## Metro production smoke

Run `pnpm --filter @hjm/react-native bundle:check` from the workspace root. The check builds the
renderer, creates a minified Android production bundle from a fixture that directly imports every
public executable family plus evidence, in a
temporary directory, and verifies its source-map module graph. It fails if the requested renderer
families are absent, the root barrel is pulled in, or Expo, `react-dom`, or `@hjm/react` contaminates
the graph. Raw and gzip budgets are measured on Metro JavaScript before Hermes bytecode compilation;
this is a bundlability and dependency-boundary smoke test, not an Android device-runtime claim.
