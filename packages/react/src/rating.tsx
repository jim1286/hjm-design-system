import { useId, type CSSProperties } from "react";
import { resolveRating, type RatingDescriptor } from "@hjmds/design-contracts/reference-controls";
import { Button } from "./actions.js";

export type RatingProps = RatingDescriptor & Readonly<{
  /** Product-localized score and unrated text, also used as the radio name. */
  getValueLabel: (value: number | null) => string;
  disabled?: boolean;
  clearLabel?: string;
  name?: string;
}> & (Readonly<{ readOnly: true; onValueChange?: never }> | Readonly<{ readOnly?: false; onValueChange: (value: number | null) => void }>);
function Star({ fraction }: { fraction: number }) {
  return <span aria-hidden="true" style={{ pointerEvents: "none", position: "relative", display: "inline-block", fontSize: "1.75em", lineHeight: 1, color: "var(--hjm-color-content-brand, currentColor)" }}>
    <span>☆</span><span style={{ position: "absolute", inset: 0, width: `${fraction * 100}%`, overflow: "hidden" }}>★</span>
  </span>;
}
/** Controlled score input, with a distinct non-interactive average representation. */
export function Rating(props: RatingProps) {
  const { label, value, readOnly = false, disabled = false, getValueLabel, clearLabel, name } = props;
  const { max, fractions } = resolveRating(props);
  const id = useId();
  const valueLabel = getValueLabel(value);
  if (!valueLabel.trim() || (clearLabel !== undefined && !clearLabel.trim())) throw new TypeError("Rating text must not be empty");
  const row: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--hjm-space-xs)" };
  if (readOnly) return <div role="img" aria-label={`${label}: ${valueLabel}`} style={row}>{fractions.map((fraction, index) => <Star key={index} fraction={fraction} />)}<span aria-hidden="true">{valueLabel}</span></div>;
  return <fieldset className="hjm-rating-control" disabled={disabled} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
    <legend>{label}</legend>
    <div style={row}>{Array.from({ length: max }, (_, index) => {
      const score = index + 1;
      const optionLabel = getValueLabel(score);
      if (!optionLabel.trim()) throw new TypeError("Rating option text must not be empty");
      return <label key={score} className="hjm-rating__option">
        <input type="radio" name={name ?? id} value={score} checked={value === score} aria-label={optionLabel} onChange={() => { if (!disabled) props.onValueChange?.(score); }} />
        <Star fraction={fractions[index]!} />
      </label>;
    })}</div>
    <div role="status">{valueLabel}</div>
    {clearLabel ? <Button tone="ghost" disabled={disabled || value === null} onClick={() => props.onValueChange?.(null)}>{clearLabel}</Button> : null}
  </fieldset>;
}
