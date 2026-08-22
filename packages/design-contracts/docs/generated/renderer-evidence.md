# Renderer evidence coverage

> Generated for HJM 0.7.1. Do not edit directly; run `pnpm evidence:sync`.

This projection joins the canonical surface maturity manifest with first-party renderer claims. Missing scenarios are explicit beta promotion debt; stable surfaces are blocked by CI until none remain.

- web: 38/38 active implementations; 0/38 full scenario sets
- native: 48/48 active implementations; 0/48 full scenario sets

| Component | Surface | Maturity | Renderer package | Export | Claimed scenarios | Missing required scenarios | Executable proofs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Text | web | beta | @hjm/react | ./layout | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#text |
| Icon | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#icon |
| Surface | web | beta | @hjm/react | ./layout | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#surface |
| Stack | web | beta | @hjm/react | ./layout | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#stack |
| Grid | web | beta | @hjm/react | ./layout | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, platform-parity | test/default-render.ssr.test.tsx#grid |
| Layout | web | beta | @hjm/react | ./layout | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#layout |
| Button | web | beta | @hjm/react | ./actions | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#button |
| IconButton | web | beta | @hjm/react | ./actions | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#icon-button |
| Field | web | beta | @hjm/react | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#field |
| SearchField | web | beta | @hjm/react | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#search-field |
| TextArea | web | beta | @hjm/react | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#text-area |
| Checkbox | web | beta | @hjm/react | ./selection | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#checkbox |
| Radio | web | beta | @hjm/react | ./selection | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#radio |
| CheckboxGroup | web | beta | @hjm/react | ./selection | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#checkbox-group |
| RadioGroup | web | beta | @hjm/react | ./selection | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#radio-group |
| Switch | web | beta | @hjm/react | ./selection | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#switch |
| SegmentedControl | web | beta | @hjm/react | ./selection | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#segmented-control |
| Select | web | beta | @hjm/react | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#select |
| Tabs | web | beta | @hjm/react | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#tabs |
| BottomNavigation | web | beta | @hjm/react | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#bottom-navigation |
| LoadMore | web | beta | @hjm/react | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#load-more |
| Menu | web | beta | @hjm/react | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#menu |
| Badge | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#badge |
| CounterBadge | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#counter-badge |
| Card | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#card |
| ListRow | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#list-row |
| Timeline | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#timeline |
| DescriptionList | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#description-list |
| Image | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#image |
| Tag | web | beta | @hjm/react | ./display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#tag |
| EmptyState | web | beta | @hjm/react | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#empty-state |
| Result | web | beta | @hjm/react | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#result |
| Toast | web | beta | @hjm/react | ./toast | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#toast |
| Dialog | web | beta | @hjm/react | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#dialog |
| AlertDialog | web | beta | @hjm/react | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#alert-dialog |
| Sheet | web | beta | @hjm/react | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.ssr.test.tsx#sheet |
| Tooltip | web | beta | @hjm/react | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.ssr.test.tsx#tooltip |
| DesignSystemProvider | web | beta | @hjm/react | ./provider | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.ssr.test.tsx#design-system-provider |
| Text | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#text |
| Icon | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#icon |
| Surface | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#surface |
| Divider | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#divider |
| Section | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#section |
| Stack | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#stack |
| Grid | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, platform-parity | test/default-render.test.tsx#grid |
| Layout | native | beta | @hjm/react-native | ./primitives | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#layout |
| Button | native | beta | @hjm/react-native | ./actions | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#button |
| IconButton | native | beta | @hjm/react-native | ./actions | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#icon-button |
| BottomCTA | native | beta | @hjm/react-native | ./actions | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#bottom-cta |
| Field | native | beta | @hjm/react-native | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#field |
| SearchField | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#search-field |
| TextArea | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#text-area |
| Checkbox | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#checkbox |
| CheckboxGroup | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#checkbox-group |
| RadioGroup | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#radio-group |
| Switch | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#switch |
| Chip | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#chip |
| SegmentedControl | native | beta | @hjm/react-native | ./inputs | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#segmented-control |
| Select | native | beta | @hjm/react-native | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#select |
| Combobox | native | beta | @hjm/react-native | ./forms | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#combobox |
| Tabs | native | beta | @hjm/react-native | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#tabs |
| TopBar | native | beta | @hjm/react-native | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#top-bar |
| BottomNavigation | native | beta | @hjm/react-native | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#bottom-navigation |
| LoadMore | native | beta | @hjm/react-native | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#load-more |
| Menu | native | beta | @hjm/react-native | ./navigation | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#menu |
| Badge | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#badge |
| CounterBadge | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#counter-badge |
| Card | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#card |
| List | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#list |
| ListRow | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#list-row |
| Accordion | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard | test/default-render.test.tsx#accordion |
| Statistic | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#statistic |
| Timeline | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#timeline |
| DescriptionList | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#description-list |
| Image | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#image |
| Tag | native | beta | @hjm/react-native | ./data-display | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#tag |
| EmptyState | native | beta | @hjm/react-native | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#empty-state |
| Notice | native | beta | @hjm/react-native | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#notice |
| Progress | native | beta | @hjm/react-native | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#progress |
| Skeleton | native | beta | @hjm/react-native | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#skeleton |
| Result | native | beta | @hjm/react-native | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#result |
| Toast | native | beta | @hjm/react-native | ./feedback | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#toast |
| Dialog | native | beta | @hjm/react-native | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#dialog |
| AlertDialog | native | beta | @hjm/react-native | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#alert-dialog |
| Sheet | native | beta | @hjm/react-native | ./overlays | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility, keyboard, platform-parity | test/default-render.test.tsx#sheet |
| DesignSystemProvider | native | beta | @hjm/react-native | ./provider | default | dark, long-copy, large-text, rtl, reduced-motion, accessibility | test/default-render.test.tsx#design-system-provider |
