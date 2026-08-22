# @hjm/react

React 19 renderer for `@hjm/design-contracts`. Components render native HTML,
keep controlled and uncontrolled state explicit, and expose stable `data-state`
and `data-*` recipe axes for styling and tests.

```tsx
import { Button, Dialog, Grid, HjmProvider, TextField } from "@hjm/react";
import "@hjm/react/styles.css";

export function Example() {
  return (
    <HjmProvider theme="system" textScale={1}>
      <Grid columns={{ compact: 1, medium: 2 }} gap={{ compact: "md" }}>
        <TextField label="이름" />
        <Button>저장</Button>
      </Grid>
      <Dialog closeLabel="닫기" trigger={<Button>설정 열기</Button>} title="설정">
        native HTML controls compose inside the focus-trapped dialog.
      </Dialog>
    </HjmProvider>
  );
}
```

`HjmProvider` emits light/dark palette variables, logical direction, text
scale, and reduced-motion state at one DOM boundary. Importing the JavaScript
does not mutate global CSS; consumers opt into the stylesheet subpath.

## Public surface

- `provider`: `HjmProvider`, `useHjmTheme`
- `layout`: `Text`, `Surface`, `Stack`, responsive `Grid`
- `actions`: `Button`, `IconButton`, `Link`
- `forms`: `Field`, `TextField`, `TextArea`, `SearchField`, custom accessible
  `Select`, opt-in `NativeSelect`, editable `Combobox`, exact `NumberField`,
  approximate `Slider`, async-safe `Form`
- `selection`: `Checkbox`, `Radio`, `CheckboxGroup`, `RadioGroup`, `Switch`,
  `SegmentedControl`
- `navigation`: `Tabs`, `Breadcrumb`, `Pagination`, `LoadMore`
- `display`: `Badge`, `Tag`, `Card`, `ListRow`, `Accordion`, `Avatar`,
  `Divider`, responsive `DescriptionList`, native `Table`, `Icon`, `CounterBadge`
- `feedback`: `Notice`, `EmptyState`, `Progress`, `Spinner`, `Skeleton`
- `toast`: controlled `Toast`, queued `ToastProvider`/`useToast`
- `overlays`: `Dialog`, `AlertDialog`, `Sheet`, `Tooltip`, `Menu`

The root entry exports the complete renderer. Domain entry points keep feature
imports explicit and let bundlers avoid unrelated code:

```tsx
import { Combobox, Form, Select } from "@hjm/react/forms";
import { NumberField } from "@hjm/react/number-field";
import { Slider } from "@hjm/react/slider";
import { Accordion, Table } from "@hjm/react/display";
import { Breadcrumb, Pagination, Tabs } from "@hjm/react/navigation";
import { Dialog, Menu, Sheet } from "@hjm/react/overlays";
import { ToastProvider, useToast } from "@hjm/react/toast";
```

Stateful components accept `value`/`checked` plus a change callback for
controlled use, or `defaultValue`/`defaultChecked` for uncontrolled use. Native
buttons, anchors, inputs, fieldsets, progress, and tab ARIA relationships are
kept in the rendered HTML; `data-state` is a styling/evidence hook, not a
replacement for browser semantics.

Modal overlays are SSR-safe: their trigger renders on the server and portal
content mounts in the browser. They enter and trap focus, restore it on close,
lock body scrolling, and inherit provider theme, direction, text scale, and
reduced-motion variables across the portal boundary. `AlertDialog` applies the
shared least-destructive-focus and async-error contracts. `Menu`, `Combobox`,
`Accordion`, and `Tabs` implement their documented Arrow/Home/End/Escape
keyboard behavior; `Tooltip` only adds `aria-describedby` while visible.

Canonical `Select` implements the shared select-only combobox contract with a
button trigger, listbox popup, active-descendant focus, async collection states,
and selection reconciliation. `NativeSelect` remains available when browser or
mobile-picker semantics are the product requirement. `Form`, `Table`,
`Breadcrumb`, and `Pagination` preserve native HTML semantics. Consumers provide
localized labels and finished domain copy; the renderer does not invent
translations. Import the stylesheet once at the application boundary—JavaScript
entry points have no global side effects.

`NumberField` keeps editable draft text separate from its `number | null`
model. It accepts locale-neutral finite decimal/exponent text, commits and
snaps only on blur, Enter, a stepper, or ArrowUp/ArrowDown, and requires
product-localized increment/decrement labels. The input is the only Tab stop;
named steppers remain available to pointer and voice control. Currency/unit
formatting, grouping separators, locale-specific decimal separators, and
non-Latin number parsing are deliberately unsupported until a bidirectional
adapter plus IME/locale fixtures are part of the contract. Composition drafts
stay local, but non-ASCII numeric IME parsing and caret preservation are not
certified.

`Slider` is the approximate numeric counterpart to `NumberField` and reuses
the same min-origin clamp/snap resolver. It supports controlled `value` or
uncontrolled `defaultValue` (falling back to `min`), horizontal LTR/RTL native
range pointer input, Arrow/Home/End/Page keyboard input, and product-owned
`getValueText`. `onValueChange` fires during an interaction;
`onValueChangeEnd` fires once when pointer capture ends, the pointer is
released, or the keyboard interaction ends. The native range input itself is
the 44px interaction layer and uses internal `step="any"`; HJM's shared resolver
snaps user input while preserving off-grid controlled values and exact endpoints.
Disabling an active interaction commits its last value exactly once.
Range/multi-thumb, vertical orientation, marks,
tooltips, nonlinear scales, and drag acceleration remain outside this initial
renderer.

## Localization ownership

The renderer has no built-in language. Products must provide copy whose meaning
cannot be derived from native HTML: `SearchField.clearLabel`,
`Select.placeholder` / `Select.emptySelectionLabel`, `Combobox.emptyMessage` /
`loadingMessage` / `selectionRequiredMessage`, and `Dialog.closeLabel` /
`Sheet.closeLabel`, plus `Table.emptyState`. This makes a missing translation a
TypeScript error instead
of silently shipping Korean or English fallback text. Labels supplied by the
product are passed through unchanged; punctuation-only accessible composition
uses caller-owned strings.

`Grid` observes window and element widths in the browser and starts from a
deterministic compact layout during SSR. Tests may pass `windowWidth` and
`availableWidth` explicitly; product code normally leaves both unset.
