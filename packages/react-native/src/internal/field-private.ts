/**
 * Renderer-private TextArea input, kept out of the public `TextAreaProps`.
 * MessageComposer starts at one control row (Web does the same by overriding
 * `--hjm-field-multiline-min-height` inside `.hjm-message-composer`). Lowering the public
 * `minVisibleLines` floor instead shrank existing 2-line product fields from 80pt to 64pt
 * (2026-10-06 review), so public callers keep the `multilineMinHeight` floor.
 */
export type FieldPrivateProps = Readonly<{ hjmCompactMultiline?: boolean }>;
