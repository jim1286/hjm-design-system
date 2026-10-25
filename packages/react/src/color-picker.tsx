"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import {
  colorPickerRecipe, normalizePickerColor, pickerHexFromHsv, pickerHsv, pickerHueColor, pickerHueStops, pickerOpacity, withPickerOpacity,
  type PickerHsv,
} from "@hjmds/design-contracts/components/color-picker";

export type ColorPickerLabels = Readonly<{
  hex: string; hue: string; saturation: string; brightness: string; opacity: string; invalid: string;
  /** Group name of the preset swatches; required when `presets` is not empty. */
  presets?: string;
}>;
export type ColorPickerProps = Readonly<{
  label: string; labels: ColorPickerLabels; value: string; onValueChange: (value: string) => void;
  alpha?: boolean; disabled?: boolean; presets?: readonly string[];
  /** Accessible name of a preset swatch. Defaults to its HEX code; products pass a localized colour name when they have one. */
  getPresetLabel?: (color: string) => string;
  /** Canonical layout-only placement on the root `<fieldset>`. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

const hueGradient = `linear-gradient(to right, ${pickerHueStops.map(stop => `${stop.color} ${stop.offset * 100}%`).join(", ")})`;

/**
 * Controlled sRGB HEX value edited as HSV: a saturation/brightness area, a hue bar, an optional opacity bar, HEX text
 * and preset swatches. Invalid text stays local until corrected or escaped.
 */
export function ColorPicker({ label, labels, value, onValueChange, alpha = false, disabled = false, presets = [], getPresetLabel, layoutStyle }: ColorPickerProps) {
  const color = normalizePickerColor(value, alpha);
  const palette = [...new Set(presets.map(preset => normalizePickerColor(preset, alpha)))];
  if (![label, labels.hex, labels.hue, labels.saturation, labels.brightness, labels.opacity, labels.invalid].every(text => text.trim())) throw new TypeError("ColorPicker labels must not be empty");
  if (palette.length && !labels.presets?.trim()) throw new TypeError("ColorPicker presets need labels.presets");
  const id = useId();
  const opaque = color.slice(0, 7);
  const suffix = alpha ? color.slice(7) : "";
  const [hsv, setHsv] = useState(() => pickerHsv(color));
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;
  // An external value replaces the HSV only when it names a different colour, so hue survives black and greys.
  useEffect(() => { setHsv(previous => pickerHexFromHsv(previous) === opaque ? previous : pickerHsv(opaque, previous)); }, [opaque]);
  const [draft, setDraft] = useState(color);
  const [invalid, setInvalid] = useState(false);
  // Enter consumes this edit; its following blur must not resend a deferred controlled request.
  const draftChanged = useRef(false);
  useEffect(() => { setDraft(color); setInvalid(false); draftChanged.current = false; }, [color]);
  function emit(next: string) { if (disabled) return; draftChanged.current = false; setDraft(next); setInvalid(false); if (next !== color) onValueChange(next); }
  function emitHsv(next: PickerHsv) { if (disabled) return; setHsv(next); hsvRef.current = next; emit(pickerHexFromHsv(next) + suffix); }
  function commit() {
    if (disabled) return;
    let next: string;
    try {
      // A typed 3/6-digit HEX names only the hue. Keep the current opacity instead of resetting it to 100%;
      // an 8-digit HEX still sets alpha explicitly (2026-09-30 review).
      const digits = draft.trim().replace(/^#/, "").length;
      next = alpha && (digits === 3 || digits === 6) ? normalizePickerColor(draft, false) + suffix : normalizePickerColor(draft, alpha);
    } catch { setInvalid(true); return; }
    emit(next);
  }
  // The area is one pointer surface; keyboard and assistive technology use the two channel sliders inside it.
  const pointer = useRef<number | null>(null);
  function fromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    emitHsv({ ...hsvRef.current, saturation: x * 100, brightness: (1 - y) * 100 });
  }
  const opacity = pickerOpacity(color);
  const style = {
    ...layoutStyle,
    "--hjm-color-picker-target": `${colorPickerRecipe.minTargetSize}px`,
    "--hjm-color-picker-hue": pickerHueColor(hsv.hue),
    "--hjm-color-picker-opaque": opaque,
    "--hjm-color-picker-current": color,
    "--hjm-color-picker-hue-gradient": hueGradient,
    "--hjm-color-picker-area-ratio": String(colorPickerRecipe.area.aspectRatio),
    "--hjm-color-picker-area-thumb": `${colorPickerRecipe.area.thumbDiameter}px`,
    "--hjm-color-picker-bar": `${colorPickerRecipe.bar.height}px`,
    "--hjm-color-picker-bar-thumb": `${colorPickerRecipe.bar.thumbDiameter}px`,
    "--hjm-color-picker-preview": `${colorPickerRecipe.preview.size}px`,
  } as CSSProperties;
  return <fieldset className="hjm-color-picker" style={style} data-hjm-color-picker disabled={disabled}>
    <legend>{label}</legend>
    {/* Colour space geometry is not reading order: saturation grows rightward in RTL too, as in every colour tool. */}
    <div className="hjm-color-picker__area" dir="ltr" data-disabled={disabled || undefined}
      onPointerDown={event => {
        if (disabled || pointer.current !== null || event.button !== 0) return;
        event.preventDefault();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
        fromPointer(event);
      }}
      onPointerMove={event => { if (pointer.current === event.pointerId) fromPointer(event); }}
      onPointerUp={event => { if (pointer.current === event.pointerId) pointer.current = null; }}
      onPointerCancel={event => { if (pointer.current === event.pointerId) pointer.current = null; }}>
      <span className="hjm-color-picker__area-thumb" aria-hidden="true" style={{ insetInlineStart: `${hsv.saturation}%`, insetBlockStart: `${100 - hsv.brightness}%` }} />
      <input className="hjm-visually-hidden" type="range" min={0} max={100} step={colorPickerRecipe.step} value={Math.round(hsv.saturation)}
        aria-label={labels.saturation} aria-valuetext={`${Math.round(hsv.saturation)}%`}
        onChange={event => emitHsv({ ...hsvRef.current, saturation: Number(event.target.value) })} />
      <input className="hjm-visually-hidden" type="range" min={0} max={100} step={colorPickerRecipe.step} value={Math.round(hsv.brightness)}
        aria-label={labels.brightness} aria-valuetext={`${Math.round(hsv.brightness)}%`}
        onChange={event => emitHsv({ ...hsvRef.current, brightness: Number(event.target.value) })} />
    </div>
    <input className="hjm-color-picker__bar hjm-color-picker__bar--hue" dir="ltr" type="range" min={0} max={360} step={1} value={Math.round(hsv.hue)}
      aria-label={labels.hue} aria-valuetext={`${Math.round(hsv.hue)}°`}
      onChange={event => emitHsv({ ...hsvRef.current, hue: Number(event.target.value) })} />
    {alpha && <input className="hjm-color-picker__bar hjm-color-picker__bar--alpha" dir="ltr" type="range" min={0} max={100} step={1} value={opacity}
      aria-label={labels.opacity} aria-valuetext={`${opacity}%`} onChange={event => emit(withPickerOpacity(color, Number(event.target.value)))} />}
    <div className="hjm-color-picker__row">
      <span className="hjm-color-picker__preview" aria-hidden="true" />
      <label className="hjm-color-picker__hex"><span>{labels.hex}</span><input type="text" dir="ltr" value={draft} spellCheck={false} autoComplete="off" aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={event => { draftChanged.current = true; setDraft(event.target.value); setInvalid(false); }} onBlur={() => { if (draftChanged.current) commit(); }}
        onKeyDown={event => { if (event.nativeEvent.isComposing || event.keyCode === 229) return; if (event.key === "Enter") { event.preventDefault(); commit(); } if (event.key === "Escape") { event.preventDefault(); draftChanged.current = false; setDraft(color); setInvalid(false); } }} /></label>
      {alpha && <output className="hjm-color-picker__opacity" dir="ltr">{opacity}%</output>}
    </div>
    {invalid && <p id={`${id}-error`} role="alert" className="hjm-color-picker__error">{labels.invalid}</p>}
    {palette.length > 0 && <ColorSwatchPicker label={labels.presets!} colors={palette} value={color} alpha={alpha} disabled={disabled} onValueChange={emit}
      {...(getPresetLabel ? { getColorLabel: getPresetLabel } : {})} />}
  </fieldset>;
}

export type ColorSwatchPickerProps = Readonly<{
  /** Group name. Visible by default; `labelVisibility="hidden"` keeps it for assistive technology only. */
  label: string; colors: readonly string[];
  /** Selected colour, or `null` when the current colour is not one of the swatches. */
  value: string | null; onValueChange: (value: string) => void;
  alpha?: boolean; disabled?: boolean;
  /** Accessible name of a swatch. Defaults to its HEX code. */
  getColorLabel?: (color: string) => string;
  /** `wrap` (default) flows into rows; `scroll` keeps one horizontally scrolling row for toolbars. */
  layout?: "wrap" | "scroll";
  labelVisibility?: "visible" | "hidden";
  layoutStyle?: HjmCompositionStyleProp;
}>;
/**
 * A single choice among colour swatches with native radio semantics (arrow keys move the selection). Shared by
 * ColorPicker presets and quick colour rows such as a drawing toolbar, so products do not rebuild swatch buttons.
 */
export function ColorSwatchPicker({ label, colors, value, onValueChange, alpha = false, disabled = false, getColorLabel, layout = "wrap", labelVisibility = "visible", layoutStyle }: ColorSwatchPickerProps) {
  if (!label.trim()) throw new TypeError("ColorSwatchPicker label must not be empty");
  const name = useId();
  const swatches = [...new Set(colors.map(color => normalizePickerColor(color, alpha)))];
  const selected = value === null ? null : normalizePickerColor(value, alpha);
  const { swatch } = colorPickerRecipe;
  return <fieldset className="hjm-color-swatches" data-layout={layout} disabled={disabled}
    style={{ ...layoutStyle, "--hjm-color-swatch-target": `${swatch.target}px`, "--hjm-color-swatch-size": `${swatch.diameter}px`, "--hjm-color-swatch-ring": `${swatch.ringWidth}px`, "--hjm-color-swatch-gap": `${swatch.ringGap}px` } as CSSProperties}>
    <legend className={labelVisibility === "hidden" ? "hjm-visually-hidden" : undefined}>{label}</legend>
    <div className="hjm-color-swatches__list">
      {swatches.map(color => <label key={color} className="hjm-color-swatches__item">
        <input type="radio" className="hjm-visually-hidden" name={name} value={color} checked={color === selected}
          aria-label={getColorLabel?.(color) ?? color} onChange={() => { if (!disabled && color !== selected) onValueChange(color); }} />
        <span className="hjm-color-swatches__swatch" aria-hidden="true" style={{ "--hjm-color-swatch": color } as CSSProperties} />
      </label>)}
    </div>
  </fieldset>;
}
