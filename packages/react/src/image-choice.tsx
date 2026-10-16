import type { CSSProperties, ReactNode } from "react";
import { imageChoiceRecipe, resolveImageChoiceToggle, validateImageChoiceItems, type ImageChoiceItemDescriptor } from "@hjmds/design-contracts/components/image-choice";

export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{ image: ReactNode }>;
type Base = Readonly<{
  /** Localized group name read before the choices. */
  label: string;
  /** Visible caption above the tiles; omit when the screen heading already names the choice. */
  showLabel?: boolean;
  items: readonly ImageChoiceItem[];
  disabled?: boolean;
  className?: string;
}>;
export type ImageChoiceGroupProps = Base & (
  | Readonly<{ selectionMode: "single"; value: string | null; onValueChange(value: string): void }>
  | Readonly<{ selectionMode: "multiple"; value: readonly string[]; onValueChange(value: string[]): void }>
);

/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; assistive tech hears radios (single) or checkboxes (multiple).
 */
export function ImageChoiceGroup(props: ImageChoiceGroupProps) {
  const { label, showLabel = false, items, disabled = false, className } = props;
  validateImageChoiceItems(items);
  const isSelected = (id: string) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
  const choose = (id: string) => {
    if (props.selectionMode === "single") props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
    else props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
  };
  const role = props.selectionMode === "single" ? "radio" : "checkbox";
  const style = { "--hjm-image-choice-size": `${imageChoiceRecipe.tileSize}px`, "--hjm-image-choice-gap": `${imageChoiceRecipe.gap}px`, "--hjm-image-choice-radius": `${imageChoiceRecipe.radius}px`, "--hjm-image-choice-ring": `${imageChoiceRecipe.ringWidth}px`, "--hjm-image-choice-offset": `${imageChoiceRecipe.ringOffset}px`, "--hjm-image-choice-check": `${imageChoiceRecipe.checkSize}px` } as CSSProperties;
  return <div className={["hjm-image-choice", className].filter(Boolean).join(" ")} style={style}>
    {showLabel ? <span className="hjm-image-choice__label">{label}</span> : null}
    <div className="hjm-image-choice__tiles" role={props.selectionMode === "single" ? "radiogroup" : "group"} aria-label={label}>
      {items.map(item => {
        const selected = isSelected(item.id);
        return <button key={item.id} type="button" role={role} aria-checked={selected} aria-label={item.label} className="hjm-image-choice__tile" data-selected={selected || undefined}
          disabled={disabled || item.disabled} onClick={() => choose(item.id)}>
          <span className="hjm-image-choice__image">{item.image}</span>
          {selected ? <span className="hjm-image-choice__check" aria-hidden="true">✓</span> : null}
        </button>;
      })}
    </div>
  </div>;
}
