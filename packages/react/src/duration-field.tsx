import { changeDurationUnit, resolveDuration, type DurationFieldLabels, type DurationRange } from "@hjmds/design-contracts/duration-field";
import { NumberField } from "./number-field.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type DurationFieldProps = DurationRange & Readonly<{ value: number; onValueChange: (seconds: number) => void; labels: DurationFieldLabels; disabled?: boolean; className?: string; /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */ layoutStyle?: HjmCompositionStyleProp; }>;
/** A NumberField composition; value and limits always use whole seconds. */
export function DurationField({ value, onValueChange, labels, min = 0, max, disabled = false, className, layoutStyle }: DurationFieldProps) {
  const parts = resolveDuration(value, { min, max });
  return <fieldset className={className} disabled={disabled} style={{ border: 0, margin: 0, padding: 0, minWidth: 0, ...layoutStyle }}>
    <legend style={{ marginBlockEnd: "var(--hjm-space-sm)" }}>{labels.label}</legend>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10ch), 1fr))", gap: "var(--hjm-space-md)" }}>
      {(["hours", "minutes", "seconds"] as const).map(unit => <NumberField key={unit} label={labels[unit]} min={0} max={unit === "hours" ? Math.max(1, Math.floor(max / 3600)) : 59}
        value={parts[unit]} disabled={disabled || (unit === "hours" && max < 3600)} step={1}
        incrementLabel={labels.increment(unit)} decrementLabel={labels.decrement(unit)}
        onValueChange={next => onValueChange(changeDurationUnit(value, unit, next, { min, max }))} />)}
    </div>
  </fieldset>;
}
