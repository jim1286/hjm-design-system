import { nextReaction, validateReactions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
export type ReactionPickerProps = Readonly<{ label: string; options: readonly ReactionOption[]; value: string | null; onValueChange: (value: string | null) => void; disabled?: boolean }>;
/** Controlled single reaction; counts and persistence belong to the product. */
export function ReactionPicker({ label, options, value, onValueChange, disabled = false }: ReactionPickerProps) {
  validateReactions(options, value);
  return <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" }}>{options.map(option => <Button key={option.id} tone="ghost" shape="pill" selected={value === option.id} disabled={disabled || option.disabled} aria-label={option.label} onClick={() => onValueChange(nextReaction(options, value, option.id))}><span aria-hidden="true">{option.emoji}{option.count === undefined ? null : ` ${option.count}`}</span></Button>)}</div>;
}
