# Folder preview

Reviewed: 2026-10-01. Both renderers expose FolderPreview through `/folder-preview`.
It is an optional Collapsible composition for collections with a decorative cover,
not a new navigation or overlay controller. Pass localized `label`, controlled
`open`, `onOpenChange`, up to three useful `previews`, actual `children`, and optional
`disabled`. Further preview nodes are intentionally not rendered.

Previews are decorative snapshots, not interactive controls. Their wrapper is inert
on Web and hides descendants from Native accessibility/touch. Use existing Asset or
Image components in slots when artwork is needed, and repeat meaningful item names
and actions in expanded children. The label should describe the collection/count.
The existing Collapsible owns expanded state and unmounts closed content.

The bounded 260×160 artwork uses overlapping cards that fan out when opened. Web
transitions transforms and respects reduced motion. Native uses the existing
ContentTransition around the artwork, inheriting its reduced-motion/AppState rules.
Labels and real content remain fluid; the illustration is not their sizing model.

Both showcases register 컴포넌트/데이터 표시/Folder Preview with Default, Dark and
LargeText. Tests cover controlled expansion and decorative accessibility boundaries.
[Native and Web LargeText flow evidence](../../../docs/evidence/component-flows-2026-10-01/README.md)
verifies opening/closing and readable expanded content. The examples use document line
artwork in decorative slots: enlarged text there previously overlapped inside the fixed
illustration. Actual item names remain in the fluid content below. Physical-device and
manually heard screen-reader verification remain separate.
