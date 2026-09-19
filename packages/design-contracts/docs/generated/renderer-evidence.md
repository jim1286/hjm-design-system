# Renderer evidence coverage

> Generated for HJM 1.3.2. Do not edit directly; run `pnpm evidence:sync`.

This projection joins the canonical surface maturity manifest with first-party renderer claims. Missing scenarios are explicit beta promotion debt; stable surfaces are blocked by CI until none remain.

- web: 96/96 active implementations; 33/96 full scenario sets
- native: 79/79 active implementations; 32/79 full scenario sets

| Component | Surface | Maturity | Renderer package | Export | Claimed scenarios | Missing required scenarios | Executable proofs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Text | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#text |
| TextFormat | web | beta | @hjmds/react | ./text-formats | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#text-format |
| Heading | web | beta | @hjmds/react | ./heading | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#heading |
| Icon | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#icon |
| Surface | web | stable | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#surface |
| Divider | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#divider |
| Section | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#section |
| Stack | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#stack |
| Container | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#container |
| AspectRatio | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#aspect-ratio |
| Grid | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.ssr.test.tsx#grid |
| Layout | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#layout |
| Top | web | beta | @hjmds/react | ./top | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#top |
| Splitter | web | beta | @hjmds/react | ./splitter | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#splitter |
| Button | web | stable | @hjmds/react | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#button |
| IconButton | web | beta | @hjmds/react | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#icon-button |
| Link | web | beta | @hjmds/react | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#link |
| BottomCTA | web | beta | @hjmds/react | ./bottom-cta | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.ssr.test.tsx#bottom-cta |
| FloatingActionButton | web | beta | @hjmds/react | ./floating-action-button | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#floating-action-button |
| AuthScreenLayout | web | beta | @hjmds/react | ./auth-screen | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#auth-screen |
| AuthProviderButton | web | beta | @hjmds/react | ./provider-button | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#auth-provider-button |
| Field | web | stable | @hjmds/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | none | test/default-render.ssr.test.tsx#field, test/stable-core.browser.test.tsx#field |
| SearchField | web | beta | @hjmds/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#search-field |
| TextArea | web | stable | @hjmds/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#text-area |
| PasswordField | web | beta | @hjmds/react | ./password-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#password-field |
| OtpField | web | beta | @hjmds/react | ./otp-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#otp-field |
| Checkbox | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#checkbox |
| Radio | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#radio |
| CheckboxGroup | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#checkbox-group |
| RadioGroup | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#radio-group |
| Switch | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#switch |
| Chip | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#chip |
| SegmentedControl | web | beta | @hjmds/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#segmented-control |
| ToggleGroup | web | beta | @hjmds/react | ./toggle-group | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#toggle-group |
| TagsInput | web | beta | @hjmds/react | ./tags-input | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#tags-input |
| Slider | web | beta | @hjmds/react | ./slider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#slider |
| NumberField | web | beta | @hjmds/react | ./number-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#number-field |
| Select | web | beta | @hjmds/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#select |
| Combobox | web | beta | @hjmds/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#combobox |
| DatePicker | web | beta | @hjmds/react | ./date-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#date-picker |
| DateRangePicker | web | beta | @hjmds/react | ./date-range | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#date-range-picker |
| FilePicker | web | beta | @hjmds/react | ./file-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#file-picker |
| Form | web | beta | @hjmds/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#form |
| Agreement | web | beta | @hjmds/react | ./agreement | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#agreement |
| Mentions | web | beta | @hjmds/react | ./mentions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#mentions |
| TransferList | web | beta | @hjmds/react | ./transfer-list | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#transfer-list |
| UploadItem | web | beta | @hjmds/react | ./upload-item | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#upload-item |
| Tabs | web | beta | @hjmds/react | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#tabs |
| TopBar | web | beta | @hjmds/react | ./top-bar | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.ssr.test.tsx#top-bar |
| Sidebar | web | beta | @hjmds/react | ./sidebar | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#sidebar |
| BottomNavigation | web | beta | @hjmds/react | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#bottom-navigation |
| Breadcrumb | web | beta | @hjmds/react | ./breadcrumb | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#breadcrumb |
| Pagination | web | beta | @hjmds/react | ./pagination | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#pagination |
| LoadMore | web | beta | @hjmds/react | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#load-more |
| Steps | web | beta | @hjmds/react | ./steps | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#steps |
| Menubar | web | beta | @hjmds/react | ./menubar | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#menubar |
| ContextMenu | web | beta | @hjmds/react | ./context-menu | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#context-menu |
| Menu | web | beta | @hjmds/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#menu |
| Anchor | web | beta | @hjmds/react | ./anchor | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#anchor |
| Avatar | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#avatar |
| Asset | web | beta | @hjmds/react | ./asset | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#asset |
| Badge | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#badge |
| CounterBadge | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#counter-badge |
| Card | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#card |
| List | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#list |
| ListRow | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#list-row |
| Collapsible | web | beta | @hjmds/react | ./collapsible | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#collapsible |
| Accordion | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#accordion |
| Statistic | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#statistic |
| Timeline | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#timeline |
| DataTable | web | beta | @hjmds/react | ./data-table | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#data-table |
| Tree | web | beta | @hjmds/react | ./tree | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#tree |
| Calendar | web | beta | @hjmds/react | ./calendar | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#calendar |
| Carousel | web | beta | @hjmds/react | ./carousel | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#carousel |
| DescriptionList | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#description-list |
| Image | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#image |
| Tag | web | beta | @hjmds/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#tag |
| Tour | web | beta | @hjmds/react | ./tour | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#tour |
| EmptyState | web | beta | @hjmds/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#empty-state |
| Notice | web | beta | @hjmds/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#notice |
| Progress | web | beta | @hjmds/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#progress |
| Spinner | web | beta | @hjmds/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#spinner |
| Skeleton | web | beta | @hjmds/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#skeleton |
| Result | web | beta | @hjmds/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#result |
| BottomInfo | web | beta | @hjmds/react | ./bottom-info | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#bottom-info |
| Toast | web | beta | @hjmds/react | ./toast | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#toast, test/toast-layout.browser.test.tsx#toast |
| Dialog | web | beta | @hjmds/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#dialog |
| AlertDialog | web | beta | @hjmds/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#alert-dialog |
| Sheet | web | beta | @hjmds/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#sheet |
| SidePanel | web | beta | @hjmds/react | ./side-panel | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#side-panel |
| Popover | web | beta | @hjmds/react | ./popover | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#popover |
| Tooltip | web | beta | @hjmds/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#tooltip |
| CommandPalette | web | beta | @hjmds/react | ./command-palette | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#command-palette |
| DesignSystemProvider | web | beta | @hjmds/react | ./provider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#design-system-provider |
| SkipNav | web | beta | @hjmds/react | ./skip-nav | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#skip-nav |
| VisuallyHidden | web | beta | @hjmds/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#visually-hidden |
| Text | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#text |
| Heading | native | beta | @hjmds/react-native | ./heading | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#heading |
| Icon | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#icon |
| Surface | native | stable | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#surface |
| Divider | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#divider |
| Section | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#section |
| Stack | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#stack |
| Container | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#container |
| AspectRatio | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#aspect-ratio |
| Grid | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.test.tsx#grid |
| Layout | native | beta | @hjmds/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#layout |
| Top | native | beta | @hjmds/react-native | ./top | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#top |
| Button | native | stable | @hjmds/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#button |
| IconButton | native | beta | @hjmds/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#icon-button |
| Link | native | beta | @hjmds/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#link |
| BottomCTA | native | beta | @hjmds/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.test.tsx#bottom-cta |
| FloatingActionButton | native | beta | @hjmds/react-native | ./floating-action-button | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#floating-action-button |
| AuthScreenLayout | native | beta | @hjmds/react-native | ./auth-screen | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#auth-screen |
| AuthProviderButton | native | beta | @hjmds/react-native | ./provider-button | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#auth-provider-button |
| Field | native | stable | @hjmds/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | none | test/default-render.test.tsx#field, test/stable-core.test.tsx#field |
| SearchField | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#search-field |
| TextArea | native | stable | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#text-area |
| PasswordField | native | beta | @hjmds/react-native | ./password-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#password-field |
| OtpField | native | beta | @hjmds/react-native | ./otp-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#otp-field |
| Checkbox | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#checkbox |
| Radio | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#radio |
| CheckboxGroup | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#checkbox-group |
| RadioGroup | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#radio-group |
| Switch | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#switch |
| Chip | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#chip |
| SegmentedControl | native | beta | @hjmds/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#segmented-control |
| ToggleGroup | native | beta | @hjmds/react-native | ./toggle-group | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#toggle-group |
| TagsInput | native | beta | @hjmds/react-native | ./tags-input | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#tags-input |
| Slider | native | beta | @hjmds/react-native | ./slider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#slider |
| NumberField | native | beta | @hjmds/react-native | ./number-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#number-field |
| Select | native | beta | @hjmds/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#select |
| Combobox | native | beta | @hjmds/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#combobox |
| DatePicker | native | beta | @hjmds/react-native | ./date-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#date-picker |
| DateRangePicker | native | beta | @hjmds/react-native | ./date-range | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#date-range-picker |
| FilePicker | native | beta | @hjmds/react-native | ./file-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#file-picker |
| Form | native | beta | @hjmds/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#form |
| Agreement | native | beta | @hjmds/react-native | ./agreement | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#agreement |
| Mentions | native | beta | @hjmds/react-native | ./mentions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#mentions |
| TransferList | native | beta | @hjmds/react-native | ./transfer-list | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#transfer-list |
| UploadItem | native | beta | @hjmds/react-native | ./upload-item | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#upload-item |
| Tabs | native | beta | @hjmds/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#tabs |
| TopBar | native | beta | @hjmds/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.test.tsx#top-bar |
| BottomNavigation | native | beta | @hjmds/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#bottom-navigation |
| LoadMore | native | beta | @hjmds/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#load-more |
| Steps | native | beta | @hjmds/react-native | ./steps | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#steps |
| Menu | native | beta | @hjmds/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#menu |
| Avatar | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#avatar |
| Asset | native | beta | @hjmds/react-native | ./asset | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#asset |
| Badge | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#badge |
| CounterBadge | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#counter-badge |
| Card | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#card |
| List | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#list |
| ListRow | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#list-row |
| Collapsible | native | beta | @hjmds/react-native | ./collapsible | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#collapsible |
| Accordion | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#accordion |
| Statistic | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#statistic |
| Timeline | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#timeline |
| Calendar | native | beta | @hjmds/react-native | ./calendar | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#calendar |
| Carousel | native | beta | @hjmds/react-native | ./carousel | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#carousel |
| DescriptionList | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#description-list |
| Image | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#image |
| Tag | native | beta | @hjmds/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#tag |
| EmptyState | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#empty-state |
| Notice | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#notice |
| Progress | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#progress |
| Spinner | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#spinner |
| Skeleton | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#skeleton |
| Result | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#result |
| BottomInfo | native | beta | @hjmds/react-native | ./bottom-info | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#bottom-info |
| Toast | native | beta | @hjmds/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#toast |
| Dialog | native | beta | @hjmds/react-native | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#dialog |
| AlertDialog | native | beta | @hjmds/react-native | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#alert-dialog |
| Sheet | native | beta | @hjmds/react-native | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#sheet |
| DesignSystemProvider | native | beta | @hjmds/react-native | ./provider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#design-system-provider |
