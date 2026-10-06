import { useState } from "react";
import { nextReaction, validateReactions, resolveReactionOptions, type ReactionMoreOptions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
export type ReactionPickerProps = Readonly<{ label: string; options: readonly ReactionOption[]; value: string | null; onValueChange: (value: string | null) => void; disabled?: boolean; layout?: "wrap" | "strip"; more?: ReactionMoreOptions }>;
/** Controlled single reaction; counts and persistence belong to the product. */
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more }: ReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const all = resolveReactionOptions(options, more);
  validateReactions(all, value);
  const showingAll = expanded && !!more;
  const visible = showingAll ? all : options;
  const choose = (id: string) => { if (!disabled) { onValueChange(nextReaction(all, value, id)); setExpanded(false); } };
  return <div data-expanded={showingAll || undefined} style={{display:"flex",flexDirection:showingAll ? "column" : "row",minWidth:0}}>
    <div role="group" aria-label={label} style={{ display:"flex", minWidth:0, flex:1, flexWrap:showingAll || layout === "wrap" ? "wrap" : "nowrap", overflowX:showingAll ? undefined : "auto", overflowY:showingAll ? "auto" : undefined, maxHeight:showingAll ? "15rem" : undefined, width:showingAll ? "min(20rem, 100%)" : undefined, gap:"var(--hjm-space-xs)" }}>
      {visible.map(option => <Button key={option.id} tone="ghost" shape="pill" selected={value === option.id} disabled={disabled || option.disabled} aria-label={option.label} onClick={() => choose(option.id)}><span aria-hidden="true" style={{fontSize:"1.5em"}}>{option.emoji}{option.count === undefined ? null : ` ${option.count}`}</span></Button>)}

    </div>
    <div style={{flexShrink:0}}>{more ? <Button tone="ghost" shape="pill" aria-label={more.label} aria-expanded={showingAll} disabled={disabled} onClick={() => setExpanded(current => !current)}><span aria-hidden="true" style={{fontSize:"1.5em"}}>{showingAll ? "−" : "+"}</span></Button> : null}</div>
  </div>;
}
