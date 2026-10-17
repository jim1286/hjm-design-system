import { useLayoutEffect, useRef, useState } from "react";
import { nextReaction, validateReactions, resolveReactionOptions, type ReactionMoreOptions, type ReactionOption } from "@hjmds/design-contracts/reactions";
import { Button } from "./actions.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ReactionPickerProps = Readonly<{ label: string; options: readonly ReactionOption[]; value: string | null; onValueChange: (value: string | null) => void; disabled?: boolean; layout?: "wrap" | "strip"; layoutStyle?: HjmCompositionStyleProp; more?: ReactionMoreOptions }>;
/** Controlled single reaction; counts and persistence belong to the product. */
export function ReactionPicker({ label, options, value, onValueChange, disabled = false, layout = "wrap", more, layoutStyle }: ReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const all = resolveReactionOptions(options, more);
  validateReactions(all, value);
  const showingAll = expanded && !!more;
  // The wrap layout sits on the page background, where a ghost Button's selected treatment (content color on the
  // canvas) cannot show: an emoji ignores text color. It uses the chip frame instead — hairline at rest, brand
  // border and accent fill when chosen — with toggle-button semantics (aria-pressed), matching Native. The strip
  // layout keeps ghost Buttons because the message bubble supplies its surface (2026-10-17 review).
  const chips = layout === "wrap";
  const visible = showingAll ? all : options;
  const choose = (id: string) => { if (!disabled) { refocus.current = !!root.current?.contains(document.activeElement); onValueChange(nextReaction(all, value, id)); setExpanded(false); } };
  // A catalog-only button unmounts on collapse: refocus the toggle, not <body>. Inert hosts restore their own trigger.
  useLayoutEffect(() => { const node = root.current; if (refocus.current && !showingAll && node && !node.closest("[inert]") && !node.contains(document.activeElement)) toggle.current?.focus(); refocus.current = false; });
  return <div ref={root} role="group" aria-label={label} className="hjm-reaction-picker" data-layout={layout} data-expanded={showingAll || undefined} style={layoutStyle}>
    <div className="hjm-reaction-picker__options">
      {visible.map(option => {
        const glyph = <span aria-hidden="true" className="hjm-reaction-picker__glyph">{option.emoji}{option.count === undefined ? null : ` ${option.count}`}</span>;
        const selected = value === option.id;
        return chips
          ? <button key={option.id} type="button" className="hjm-chip hjm-reaction-picker__chip" data-size="small" data-selected={selected || undefined} aria-pressed={selected} disabled={disabled || option.disabled} aria-label={option.label} onClick={() => choose(option.id)}>{glyph}</button>
          : <Button key={option.id} tone="ghost" shape="pill" selected={selected} disabled={disabled || option.disabled} aria-label={option.label} onClick={() => choose(option.id)}>{glyph}</Button>;
      })}
    </div>
    <div>{more ? chips
      ? <button ref={toggle} type="button" className="hjm-chip hjm-reaction-picker__chip" data-size="small" aria-label={more.label} aria-expanded={showingAll} disabled={disabled} onClick={() => setExpanded(current => !current)}><span aria-hidden="true" className="hjm-reaction-picker__glyph">{showingAll ? "−" : "+"}</span></button>
      : <Button ref={toggle} tone="ghost" shape="pill" aria-label={more.label} aria-expanded={showingAll} disabled={disabled} onClick={() => setExpanded(current => !current)}><span aria-hidden="true" className="hjm-reaction-picker__glyph">{showingAll ? "−" : "+"}</span></Button> : null}</div>
  </div>;
}
