---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Fix five gaps found while utilverse adopted 1.13.0 (2026-10-06, iPhone 17 Pro / iOS 26.5, accessibility-large). Both renderers; the only API change is one optional SearchScreen prop.

- SegmentedControl `presentation="pills"` no longer stacks into a column at large text (new `segmentedControlRecipe.pills.largeTextLayout: "wrap"`). Pills wrap inside a block and stay on one scrolling line inside a rail (SearchScreen `filtersOverflow="scroll"` or a product ScrollView); radio selection and focus order are unchanged. `connected` still stacks from 1.6x. Visual change: large-text pills that used to be a full-width column now render as wrapped or one-line pills.
- Native Chip uses its recipe height as a minimum (`minHeight`) instead of a fixed `height`, so large-text labels such as the SearchScreen filter trigger and suggested queries are no longer clipped. Web already used `min-block-size`. Visual change: chips grow with large text; 1x is unchanged (36 / 44).
- Native fixed-size Sheet (`size` `medium`/`large`/`full`, side sheets) gives its body the remaining height (`flexGrow: 1`, `minHeight: 0`), as Web `.hjm-sheet__body` already did, so a `flex: 1` child such as SearchScreen fills it instead of collapsing to 0pt. With `scrollable` the ScrollView grows but its content container does not. Visual change: the footer of a fixed-size Native sheet now sits at the bottom of the sheet; `auto` sheets are unchanged.
- SearchScreen closes the keyboard on every commit. Native calls `Keyboard.dismiss()` when a suggestion, recent or suggested query is picked (one-step and two-step). Web moves focus from the picked row or chip, which unmounts, to the results region (`.hjm-search-screen__results`, `tabIndex=-1`, no focus ring) instead of letting it fall to `<body>`; leaving the field also closes a mobile browser keyboard. Enter keeps focus in the field.
- SearchScreen adds optional `hostGutter` (`ContainerGutter`, default `none`). With `filtersOverflow="scroll"` the rail bleeds over the screen padding plus this host gutter, so with `contentInset="none"` inside a Container or Sheet it reaches the host edge while its first chip stays on the gutter. Default behavior is unchanged.

Migration (utilverse, origin/main 077b190): after upgrading to this patch, remove the three workarounds. `ToolThemeFilter` drops its large-text `Select` branch once pills keep one row in a rail. `ChatToolPicker` drops `layoutStyle={{ flexBasis: height }}` once the fixed-size Sheet body fills, and passes `hostGutter="regular"` (Sheet padding `spacing.lg`). `notification-tools` drops `Keyboard.dismiss()` from `onSubmit` and passes `hostGutter="regular"` (its Container gutter). Products on 1.13.0 keep the workarounds.
