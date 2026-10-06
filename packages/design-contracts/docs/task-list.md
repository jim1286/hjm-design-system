# Task list

Reviewed: 2026-10-07. Web and Native expose TaskList through `/task-list`.
TaskList composes existing List and Checkbox rather than creating another selection
or gesture engine. Each controlled item has unique `id`, localized `label`, boolean
`completed`, optional `description` and `disabled`. Invalid identity/completion data
throws. Pass a localized list `label` and `onCompletedChange(id, completed)`; the
product accepts the requested change and owns saving, errors and rollback.

`emptyContent` is product-localized content when there are no tasks. `disabled`
disables every checkbox. Checking a task never reorders or removes it automatically.

For reordering, supply `renderCollection({items, renderItem})` and compose the
existing optional SortableCollection. Pass its localized labels and accept its
`orderedIds` in product state. Map its SortableItem back to the TaskItem by ID before
calling `renderItem`. The host propagates any global disabled/active state to that
collection; TaskList continues to control checkbox disabled state. This slot keeps
DND peers out of the plain TaskList import graph, while the existing adapter owns
keyboard/drag/cancellation/accessibility behavior.

Both showcases register 컴포넌트/입력/Task List with Default, Dark and LargeText
and working controlled completion/reordering. Web tests exercise actual checkbox
interaction; Native tests check controlled intent and disabled props. Device drag,
focus and screen-reader verification remain pending.

## Native enlarged selection marks

The 2026-10-01 [device flow audit](../../../docs/evidence/component-flows-2026-10-01/README.md)
found that 200% text scaling enlarged Checkbox's decorative mark beyond its fixed box.
Native Checkbox now keeps the checked/mixed artwork at the recipe typography size
while its label and description continue scaling. TaskList inherits this correction
through Checkbox; it does not provide a second selection indicator.

## Independent item actions

`renderItemAction({item, disabled})` optionally supplies a product-localized control below
that item's checkbox. `disabled` combines the list and item disabled flags; pass it to
the control. The slot does not save, remove, or confirm anything itself. Keep asynchronous
storage and rollback in the product. The action is a sibling of Checkbox, never inside its
label, so it has its own press/focus target. It follows the checkbox with spacing.sm (12)
and remains part of renderItem when renderCollection supplies sorting.

The separate line preserves the full label width at large text sizes. Utilverse checklist
rows need deletion alongside completion (2026-10-07 consumer audit), which the previous
completion-only API could not express without rebuilding row layout. Both showcases now
include independent delete actions; device drag/focus/large-text action QA remains pending.
