---
"@hjmds/design-contracts": minor
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Component review C (inputs): Agreement and TransferList rows draw the Checkbox indicator (`selectionControlRecipe.indicatorBorderWidth`), Agreement items share the all-row inset (`agreementRecipe.itemLayout.paddingHorizontal`), TransferList move buttons stack with gap 8 and draw direction icons, Native TransferList matches the Web panel structure; DatePicker draws a calendar icon and icon clear/close buttons; Web PasswordField uses the `visibility`/`visibilityOff` icons; Sortable/TaskList rows fit on one line with icon move buttons; FieldGroup inline parts use `inline.minWidth` (128) on both renderers and split rows evenly on Native; NumberField value inset is `xxs`/`xs`; Calendar caps at `calendarRecipe.maxWidth` (360); Native Select/Combobox/NumberField use the control border, TagsInput tags get `tagsInputRecipe.tag.border`, Rating cells round and start-align the clear action, plain Statistic drops its inset.
