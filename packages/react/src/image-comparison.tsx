import type { HjmCompositionStyleProp } from "./composition-style.js";
import { resolveImageComparison, type ImageComparisonDescriptor } from "@hjmds/design-contracts/reference-controls";
import { Slider } from "./slider.js";
import { Image } from "./supplemental-display.js";
export type ImageComparisonProps = ImageComparisonDescriptor & Readonly<{ onValueChange: (value: number) => void; getValueText: (value: number) => string; disabled?: boolean; layoutStyle?: HjmCompositionStyleProp }>;
/** Reuse Slider for drag/keyboard/commit semantics. The image divider is a
 * visual projection, not a second competing gesture or focus target. */
export function ImageComparison(props: ImageComparisonProps) {
  const { before, after, label, value, onValueChange, getValueText, disabled = false } = props;
  const { aspectRatio, fraction } = resolveImageComparison(props);
  // Labels follow the physical comparison sides even in RTL; each label retains
  // its own writing direction. Mirroring only the labels misidentifies the images.
  return <div className="hjm-image-comparison" style={props.layoutStyle}>
    <div style={{ display: "flex", justifyContent: "space-between", direction: "ltr", gap: "var(--hjm-space-sm)", flexWrap: "wrap" }}><span dir="auto">{before.label}</span><span dir="auto">{after.label}</span></div>
    <div style={{ position: "relative", aspectRatio, overflow: "hidden", direction: "ltr", background: "var(--hjm-color-surface-alt)" }}>
      <Image src={after.src} width={after.width} height={after.height} decorative={false} accessibilityLabel={after.label} style={{ display: "block", width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - value}% 0 0)` }}><Image src={before.src} width={before.width} height={before.height} decorative={false} accessibilityLabel={before.label} style={{ display: "block", width: "100%", height: "100%" }} /></div>
      <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: `${fraction * 100}%`, borderInlineStart: "2px solid var(--hjm-color-border)", pointerEvents: "none" }} />
    </div>
    <Slider label={label} min={0} max={100} step={1} value={value} onValueChange={onValueChange} getValueText={getValueText} disabled={disabled} />
  </div>;
}
