# Landing pattern — 2026-10-01

Web/Native Storybook: Patterns/Landing, Default/Dark/LargeText. Composition uses existing Heading, EffectSurface, Surface, List/ListRow, Button, Sheet, TextField and Collapsible. Decorative mesh/grain remains static; content and actions retain their semantics.

The hero, feature explanation, live local record preview, FAQ and repeated CTA form an original sample landing flow. It includes no third-party screenshots, testimonials or invented product metrics. CTA opens a real local note form, validates blank content and adds a trimmed note to the preview; reload resets it, as disclosed in the FAQ.

[Browser results](browser.json) at 390 × 844 cover all three states: CTA, blank validation, successful addition and FAQ. No horizontal overflow. Both showcase checks passed. Native follow-up used the existing iPhone 17 / iOS 27 development simulator. It exposed a keyboard-covered form, repaired by enabling the existing Sheet `keyboardAvoidance` and `scrollable` options. Blank validation, entering `123` with the keyboard open and adding it to the local preview were verified; [screenshots and AX evidence](../native-visual-integration-2026-10-01/README.md) include the visible input and submit control above the keyboard. No publication or product deployment was performed.
