---
"@hjmds/design-contracts": patch
---

Remove TimePicker, Cascader, Rating, TreeSelect and ConfirmPopover from the planned
component inventory because their working patterns already compose existing primitives.
Reference mappings now point to those primitives. Keep pattern examples and the public
tree-select helper; catalog consumers must use the underlying component IDs instead of
the removed planned IDs. Regenerate catalog artifacts and clarify historical adapter
verification records without publishing or migrating consumer applications.
