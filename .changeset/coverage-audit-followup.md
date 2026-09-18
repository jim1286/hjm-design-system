---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Close the coverage audit's P1 and P2 findings and fill the four Native gaps.

Add Collapsible on both renderers: a lone disclosure differs from Accordion by
relationship, not count, so it carries no group keyboard model, no dividers and
no one-open-at-a-time policy. Closed content is unmounted rather than hidden, so
the accessibility tree agrees with the collapsed state.

Add ContextMenu and Menubar on Web. ContextMenu reuses Menu's item vocabulary and
changes only the anchor: opening by keyboard (Shift+F10 or the Menu key) is part
of the contract, and it anchors to the focused element's box rather than the
viewport origin. Menubar is one keyboard unit — left/right move between open
menus, exactly one menu is open, and the bar is a single tab stop.

Add a hover axis to Popover. Hover is added to the click path, never a
replacement, because touch and keyboards have none; both edges are delayed so a
pass-through does not flash and the gap to the panel stays crossable.

Add Asset on both renderers: one frame for icon, image, Lottie and video, with
the media itself arriving as a slot so neither package depends on a player. A
meaningful asset without a name is rejected, as is a decorative one that carries
one. Reduced motion freezes the frame instead of removing the asset.

Add the dataviz token contract — series palette, chrome tokens and a redundant
encoding rule — without a chart renderer. Drawing stays with the product's chart
library; the portfolio's actual defect was inconsistent color.

Add a global density axis to the provider. Lists, menus and tables take it as
their default while an explicit component prop still wins; each component keeps
its own density vocabulary and a single mapping function translates between them.

Define the button label wrap policy in the recipe: wrap up to two lines instead
of truncating, and lift the cap under large text so a user's own text size is
never clipped. Web and Native now resolve the same answer.

Add Native renderers for TagsInput, DateRangePicker, Mentions and TransferList.
Each reuses the existing contract judgment and records where the surface really
differs: return is the only commit key on a phone, there is no hover preview for
a range, the caret is only available through onSelectionChange, and two panels
do not fit side by side.
