---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Close the Web/Native drifts found while writing the usage guides (2026-10-06 follow-ups). The recipe stays the single source; renderers that disagreed now read it.

**Visual changes (no API change; review screens that measured the old values)**

- `Sheet size="full"` (both): fills the height inside the top safe area. `sheetRecipe.content.maxHeightRatio` (0.9) now caps only `size="auto"`; it used to stop `full` at 90%.
- Web `Sheet`: content padding 12 top/bottom · 20 sides, 16 between header/body/footer and between body children, and 12 above the footer (`sheetRecipe`), as Native. It used the Dialog's 20 everywhere, so the same sheet was taller on Web.
- Web `ScreenLayout`: header items 12 apart (`screenPatternRecipe.itemGap`) and the state block `stateGap` 16. Both used the content inset, so they collapsed to 0 with `contentInset="none"`.
- Web `SearchField`: `medium` padding 12 · gap 8 and a 36px clear circle with a 4px hit slop (still a 44 target); `large` padding 16 · gap 12 · clear 44 (`searchFieldRecipe.sizes`).
- Web `Select`/`Combobox`/`Menu`: 8px from the viewport edge (`collisionPadding`), not 16. `Tooltip`: 4px from its trigger, 12px from the edge, at most 280px wide (`tooltipRecipe`). Menu items use radius md (12).
- Web `SegmentedControl`: 4px track padding/gap, radius lg with a 1px border, 2px selected ring, semibold/bold labels, and the `small` size (36 + 4px slop) that had no CSS.
- Web `Chip` (`small` 12/4, `medium` 16/8 padding/gap with a 4px slop on `small`), `Badge size="small"` padding 4, `Statistic` (line gap 8/4, compact surface padding 12, group gap 8), `TransferList` (rows 12, move buttons 12 apart), `UploadItem` (min 68, padding 8/16), `DataTable` regular cells 12/16, `EmptyState` regular 40 vertical, indented `List` separators start at 52.
- Web `Section` header and `StatisticGroup` stack below `breakpoint.medium` (600) instead of 640.
- Web circular `Progress`: the label row sits above the ring, as the linear bar and Native.
- `Result` (both): actions render secondary → primary like every other action row. Primary still comes first in `actions`.
- Web `ClipboardButton`: default `tone` is now `secondary`; it added a second primary next to a screen's main action. Pass `tone="primary"` to keep the old look.
- `AuthProviderButton` (both): labels return to `typography.body`. The provider guideline owns label and colour; the Naver green contrast is recorded as a provider colour exception (`docs/provider-button.md`).
- Web `Tooltip`: 8px padding on every side (`tooltipRecipe.surface.padding`); it drew 8 × 12.
- Web `Section`: title uses the `title` variant (18/26 bold) and description `caption` (11/16), as Native. Both inherited body (14).
- Web `Menu`/`ContextMenu`/`Select`/`Combobox` popups and the `Mentions` list: 8px inner padding (`floatingSurfaceContract.padding`), not 4. Native `Mentions` list padding 8 and radius md from `comboboxRecipe.popover`.
- Web `Mentions` list: 8px from the field and 8px from the viewport edge (`comboboxRecipe.popover`), not 16.
- `DatePicker` (both) trigger heights follow `datePickerRecipe.sizes`: medium 44, large 52 (Web large was 56; Native was 48/56).
- Web `MessageComposer`: 12px (`screenPatternRecipe.itemGap`) between rows and between the editor and the send button, as Native. It was 8.
- Web `Statistic` text follows `statisticRecipe`: label `label` semibold (compact `caption`), value `heading` heavy (compact `title`), prefix/suffix `body` semibold in the body colour, hint and trend `caption` (trend bold). The value no longer scales twice with large text.
- Native `TagsInput` suggestion rows and `Collapsible` triggers keep a 44 minimum height. Native `RadioGroup`/`CheckboxGroup` descriptions sit above the options (slot order), as Web. Native `Slider` header has a 16 label–value gap.
- Disabled fields (both) fade the label and the control only; the hint and the error keep full contrast (`fieldRecipe.disabledScope`). The whole frame used to fade, support text included. The amount is the component recipe's `states.disabledOpacity` where it has one, else `fieldRecipe.disabledOpacity` (0.6). So Web `Select`, `NumberField`, `OtpField`, `SearchField` and `PasswordField` (both platforms for the last) fade to 0.5 instead of 0.6; Native `NumberField`/`Select` labels now fade with the control; Native `Combobox` and `DatePicker` (both platforms) did not dim at all and now fade at 0.6; `TagsInput` fades its label too, at 0.6 on both (the Native frame was 0.5). Native custom `Field` fades its label; its consumer control is a direct child and dims itself from `accessibilityState.disabled` (Web still fades it through the frame). Screens that faded their own hint or error under a disabled field can drop that.

**Behaviour**

- `Agreement` (both) calls `onStateChange` once on mount with the initial state, so `defaultCheckedIds`/`checkedIds` that already satisfy the required items enable a submit button. Consumers that counted calls see one more at mount.
- `Avatar` initials (both) come from `resolveAvatarInitials` (`@hjmds/design-contracts/avatar-fallback`): first and last word in code points. Web used the first two words ("Kim Min Jun" → "KM", now "KJ"); Native could split surrogate pairs.
- Native `SearchField` keeps accepting input while `busy`, as Web does under `loading`; only `disabled` ignores typing. `SearchScreen` `searching` therefore no longer drops keystrokes typed while suggestions refresh, so it can stay on during live suggestion requests. The clear button is still replaced by the progress indicator while busy.
- Native `ImageViewer` announces the load failure (assertive live region, iOS announcement), not only the loading copy.
- Web `Toast` forwards the remaining HTML attributes (id, data-*, handlers) it already accepted in its type; role and labelling stay owned by the toast.
- Web `Masonry` empty state is a named `group` (a bare div cannot carry `aria-label`).

**Additions**

- Native `DurationField` and `QRCode` accept `layoutStyle`.
- Contracts: `resolveAvatarInitials`, `sliderRecipe.header`, `uploadItemRecipe.row.paddingVertical`, `fieldRecipe.disabledScope`.
