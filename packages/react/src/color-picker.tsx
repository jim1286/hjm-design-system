import { useEffect, useId, useState, type CSSProperties } from "react";
import { colorPickerRecipe, normalizePickerColor, pickerOpacity, withPickerOpacity } from "@hjmds/design-contracts/components/color-picker";
export type ColorPickerLabels = Readonly<{ color: string; hex: string; opacity: string; invalid: string }>;
export type ColorPickerProps = Readonly<{
  label: string; labels: ColorPickerLabels; value: string; onValueChange: (value: string) => void;
  alpha?: boolean; disabled?: boolean; presets?: readonly string[];
}>;
/** Controlled value; invalid text stays local until corrected or escaped. Native color UI supplies RGB only. */
export function ColorPicker({ label, labels, value, onValueChange, alpha = false, disabled = false, presets = [] }: ColorPickerProps) {
  const color = normalizePickerColor(value, alpha);
  // HEX is an ordered code, so isolate its LTR text even when the surrounding labels use RTL.
  const palette = [...new Set(presets.map(preset => normalizePickerColor(preset, alpha)))];
  if (![label, ...Object.values(labels)].every(text => text.trim())) throw new TypeError("ColorPicker labels must not be empty");
  const id = useId();
  const [draft, setDraft] = useState(color);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setDraft(color); setInvalid(false); }, [color]);
  function emit(next: string) { setDraft(next); setInvalid(false); if (next !== color) onValueChange(next); }
  function commit() {
    let next: string;
    try {
      // A typed 3/6-digit HEX names only the hue. Keep the current opacity instead of resetting it to 100%,
      // matching the native color input; an 8-digit HEX still sets alpha explicitly (2026-09-30 review).
      const digits = draft.trim().replace(/^#/, "").length;
      next = alpha && (digits === 3 || digits === 6) ? normalizePickerColor(draft, false) + color.slice(7) : normalizePickerColor(draft, alpha);
    } catch { setInvalid(true); return; }
    emit(next);
  }
  return <fieldset className="hjm-color-picker" style={{ "--hjm-color-picker-target": `${colorPickerRecipe.minTargetSize}px` } as CSSProperties} data-hjm-color-picker disabled={disabled}>
    <legend>{label}</legend>
    <div className="hjm-color-picker__row">
      <label className="hjm-color-picker__native"><span>{labels.color}</span><input type="color" value={color.slice(0, 7)} onChange={event => emit(event.target.value + (alpha ? color.slice(7) : ""))} /></label>
      <label className="hjm-color-picker__hex"><span>{labels.hex}</span><input type="text" dir="ltr" value={draft} spellCheck={false} autoComplete="off" aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={event => { setDraft(event.target.value); setInvalid(false); }} onBlur={commit}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); commit(); } if (event.key === "Escape") { event.preventDefault(); setDraft(color); setInvalid(false); } }} /></label>
    </div>
    {invalid && <p id={`${id}-error`} role="alert" className="hjm-color-picker__error">{labels.invalid}</p>}
    {alpha && <label className="hjm-color-picker__opacity"><span>{labels.opacity} <output>{pickerOpacity(color)}%</output></span><input type="range" min={0} max={100} step={1} value={pickerOpacity(color)} aria-label={labels.opacity} aria-valuetext={`${pickerOpacity(color)}%`} onChange={event => emit(withPickerOpacity(color, Number(event.target.value)))} /></label>}
    <div className="hjm-color-picker__preview" aria-hidden="true" style={{ backgroundColor: color }} />
    {palette.length > 0 && <div className="hjm-color-picker__presets">{palette.map(preset => <button type="button" key={preset} aria-pressed={preset === color} onClick={() => emit(preset)}><span aria-hidden="true" className="hjm-color-picker__swatch" style={{ backgroundColor: preset }} /><bdi dir="ltr">{preset}</bdi></button>)}</div>}
  </fieldset>;
}
