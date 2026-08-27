# Renderer evidence coverage

> Generated for HJM 0.8.0. Do not edit directly; run `pnpm evidence:sync`.

This projection joins the canonical surface maturity manifest with first-party renderer claims. Missing scenarios are explicit beta promotion debt; stable surfaces are blocked by CI until none remain.

- web: 60/60 active implementations; 29/60 full scenario sets
- native: 61/61 active implementations; 31/61 full scenario sets

| Component | Surface | Maturity | Renderer package | Export | Claimed scenarios | Missing required scenarios | Executable proofs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Text | web | beta | @hjm/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#text |
| Icon | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#icon |
| Surface | web | beta | @hjm/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#surface |
| Divider | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#divider |
| Section | web | beta | @hjm/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#section |
| Stack | web | beta | @hjm/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#stack |
| Grid | web | beta | @hjm/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.ssr.test.tsx#grid |
| Layout | web | beta | @hjm/react | ./layout | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#layout |
| Button | web | beta | @hjm/react | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#button |
| IconButton | web | beta | @hjm/react | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#icon-button |
| Link | web | beta | @hjm/react | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#link |
| Field | web | beta | @hjm/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#field |
| SearchField | web | beta | @hjm/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#search-field |
| TextArea | web | beta | @hjm/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#text-area |
| PasswordField | web | beta | @hjm/react | ./password-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#password-field |
| OtpField | web | beta | @hjm/react | ./otp-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#otp-field |
| Checkbox | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#checkbox |
| Radio | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#radio |
| CheckboxGroup | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#checkbox-group |
| RadioGroup | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#radio-group |
| Switch | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#switch |
| Chip | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#chip |
| SegmentedControl | web | beta | @hjm/react | ./selection | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#segmented-control |
| Slider | web | beta | @hjm/react | ./slider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#slider |
| NumberField | web | beta | @hjm/react | ./number-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#number-field |
| Select | web | beta | @hjm/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#select |
| Combobox | web | beta | @hjm/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#combobox |
| DatePicker | web | beta | @hjm/react | ./date-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#date-picker |
| FilePicker | web | beta | @hjm/react | ./file-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#file-picker |
| Form | web | beta | @hjm/react | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#form |
| UploadItem | web | beta | @hjm/react | ./upload-item | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#upload-item |
| Tabs | web | beta | @hjm/react | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#tabs |
| BottomNavigation | web | beta | @hjm/react | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#bottom-navigation |
| LoadMore | web | beta | @hjm/react | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#load-more |
| Steps | web | beta | @hjm/react | ./steps | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#steps |
| Menu | web | beta | @hjm/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#menu |
| Avatar | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#avatar |
| Badge | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#badge |
| CounterBadge | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#counter-badge |
| Card | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#card |
| List | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#list |
| ListRow | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#list-row |
| Accordion | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#accordion |
| Statistic | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#statistic |
| Timeline | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#timeline |
| DescriptionList | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#description-list |
| Image | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#image |
| Tag | web | beta | @hjm/react | ./display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#tag |
| EmptyState | web | beta | @hjm/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#empty-state |
| Notice | web | beta | @hjm/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#notice |
| Progress | web | beta | @hjm/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#progress |
| Spinner | web | beta | @hjm/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#spinner |
| Skeleton | web | beta | @hjm/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#skeleton |
| Result | web | beta | @hjm/react | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#result |
| Toast | web | beta | @hjm/react | ./toast | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#toast |
| Dialog | web | beta | @hjm/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#dialog |
| AlertDialog | web | beta | @hjm/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#alert-dialog |
| Sheet | web | beta | @hjm/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.ssr.test.tsx#sheet |
| Tooltip | web | beta | @hjm/react | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.ssr.test.tsx#tooltip |
| DesignSystemProvider | web | beta | @hjm/react | ./provider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.ssr.test.tsx#design-system-provider |
| Text | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#text |
| Icon | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#icon |
| Surface | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#surface |
| Divider | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#divider |
| Section | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#section |
| Stack | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#stack |
| Grid | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | platform-parity | test/default-render.test.tsx#grid |
| Layout | native | beta | @hjm/react-native | ./primitives | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#layout |
| Button | native | beta | @hjm/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#button |
| IconButton | native | beta | @hjm/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#icon-button |
| Link | native | beta | @hjm/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#link |
| BottomCTA | native | beta | @hjm/react-native | ./actions | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#bottom-cta |
| Field | native | beta | @hjm/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#field |
| SearchField | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#search-field |
| TextArea | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#text-area |
| PasswordField | native | beta | @hjm/react-native | ./password-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#password-field |
| OtpField | native | beta | @hjm/react-native | ./otp-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#otp-field |
| Checkbox | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#checkbox |
| Radio | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#radio |
| CheckboxGroup | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#checkbox-group |
| RadioGroup | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#radio-group |
| Switch | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#switch |
| Chip | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#chip |
| SegmentedControl | native | beta | @hjm/react-native | ./inputs | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#segmented-control |
| Slider | native | beta | @hjm/react-native | ./slider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#slider |
| NumberField | native | beta | @hjm/react-native | ./number-field | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#number-field |
| Select | native | beta | @hjm/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#select |
| Combobox | native | beta | @hjm/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#combobox |
| DatePicker | native | beta | @hjm/react-native | ./date-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#date-picker |
| FilePicker | native | beta | @hjm/react-native | ./file-picker | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#file-picker |
| Form | native | beta | @hjm/react-native | ./forms | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#form |
| UploadItem | native | beta | @hjm/react-native | ./upload-item | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#upload-item |
| Tabs | native | beta | @hjm/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#tabs |
| TopBar | native | beta | @hjm/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#top-bar |
| BottomNavigation | native | beta | @hjm/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#bottom-navigation |
| LoadMore | native | beta | @hjm/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#load-more |
| Steps | native | beta | @hjm/react-native | ./steps | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#steps |
| Menu | native | beta | @hjm/react-native | ./navigation | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#menu |
| Avatar | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#avatar |
| Badge | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#badge |
| CounterBadge | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#counter-badge |
| Card | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#card |
| List | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#list |
| ListRow | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#list-row |
| Accordion | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard | test/default-render.test.tsx#accordion |
| Statistic | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#statistic |
| Timeline | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#timeline |
| DescriptionList | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#description-list |
| Image | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#image |
| Tag | native | beta | @hjm/react-native | ./data-display | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#tag |
| EmptyState | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#empty-state |
| Notice | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#notice |
| Progress | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#progress |
| Spinner | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#spinner |
| Skeleton | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#skeleton |
| Result | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#result |
| Toast | native | beta | @hjm/react-native | ./feedback | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#toast |
| Dialog | native | beta | @hjm/react-native | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#dialog |
| AlertDialog | native | beta | @hjm/react-native | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#alert-dialog |
| Sheet | native | beta | @hjm/react-native | ./overlays | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | keyboard, platform-parity | test/default-render.test.tsx#sheet |
| DesignSystemProvider | native | beta | @hjm/react-native | ./provider | default, dark, long-copy, large-text, rtl, reduced-motion, accessibility | none | test/default-render.test.tsx#design-system-provider |
