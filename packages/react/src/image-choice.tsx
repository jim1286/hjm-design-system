"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Text } from "./layout.js";
import { useOptionalHjmTheme } from "./provider.js";
import { typography } from "@hjmds/design-contracts/foundations";
import {
  imageChoiceRecipe, resolveImageChoiceCaptionLines, resolveImageChoiceColumns, resolveImageChoiceOuterSize, resolveImageChoiceTileHeight, resolveImageChoiceToggle,
  validateImageChoiceItemLabelLines, validateImageChoiceItems, type ImageChoiceItemDescriptor, type ImageChoiceItemLabelLines,
} from "@hjmds/design-contracts/components/image-choice";
import { resolveVirtualWindow, virtualListRecipe } from "@hjmds/design-contracts/components/virtual-list";

export type ImageChoiceItem = ImageChoiceItemDescriptor & Readonly<{ image: ReactNode }>;
export type ImageChoiceVirtualization = Readonly<{
  /** Height of the scrolling viewport in px. The group scrolls itself, so do not also put it in a scrolling parent. */
  height: number;
  /** Rows kept mounted above and below the visible window. */
  overscan?: number;
}>;
type Base = Readonly<{
  /** Localized group name read before the choices. */
  label: string;
  /** Visible caption above the tiles; omit when the screen heading already names the choice. */
  showLabel?: boolean;
  /**
   * Shows each item's `label` under its tile (one ellipsized line), e.g. a person's name in a recipient picker.
   * The tile keeps the same accessible name, so turning this on does not change what assistive tech reads.
   */
  showItemLabels?: boolean;
  /** Lines the visible item label wraps to before the ellipsis (default 1). Every tile reserves the same height. */
  itemLabelLines?: ImageChoiceItemLabelLines;
  items: readonly ImageChoiceItem[];
  disabled?: boolean;
  className?: string;
  /**
   * Long lists (hundreds of people): only the rows near the viewport are mounted. Tiles keep their size; the column
   * count follows the measured width.
   */
  virtualized?: ImageChoiceVirtualization;
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
  const { label, showLabel = false, showItemLabels = false, itemLabelLines = imageChoiceRecipe.itemLabelLines, items, disabled = false, className, virtualized } = props;
  validateImageChoiceItems(items);
  validateImageChoiceItemLabelLines(itemLabelLines);
  const theme = useOptionalHjmTheme();
  const baseId = useId();
  const isSelected = (id: string) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
  const choose = (id: string) => {
    if (props.selectionMode === "single") props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
    else props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
  };
  const role = props.selectionMode === "single" ? "radio" : "checkbox";
  const groupRole = props.selectionMode === "single" ? "radiogroup" : "group";
  const captionLines = resolveImageChoiceCaptionLines({ showItemLabels, itemLabelLines, hasDescription: items.some(item => item.description !== undefined) });
  const style = { "--hjm-image-choice-size": `${imageChoiceRecipe.tileSize}px`, "--hjm-image-choice-gap": `${imageChoiceRecipe.gap}px`, "--hjm-image-choice-radius": `${imageChoiceRecipe.radius}px`, "--hjm-image-choice-ring": `${imageChoiceRecipe.ringWidth}px`, "--hjm-image-choice-offset": `${imageChoiceRecipe.ringOffset}px`, "--hjm-image-choice-check": `${imageChoiceRecipe.checkSize}px`, "--hjm-image-choice-item-label-gap": `${imageChoiceRecipe.itemLabelGap}px`, "--hjm-image-choice-caption-lines": captionLines, "--hjm-image-choice-viewport-inset": `${imageChoiceRecipe.virtualViewportInset}px` } as CSSProperties;
  const renderTile = (item: ImageChoiceItem, index: number) => {
    const selected = isSelected(item.id);
    const descriptionId = item.description === undefined ? undefined : `${baseId}-description-${index}`;
    return <button key={item.id} type="button" role={role} aria-checked={selected} aria-label={item.label} aria-describedby={descriptionId} className="hjm-image-choice__tile" data-selected={selected || undefined}
      disabled={disabled || item.disabled} onClick={() => choose(item.id)}>
      {/* The ring lives on an inner frame so an item label can sit below it inside the same button (one tap target). */}
      <span className="hjm-image-choice__ring">
        <span className="hjm-image-choice__image">{item.image}</span>
        {selected ? <span className="hjm-image-choice__check" aria-hidden="true">✓</span> : null}
      </span>
      {/* Every tile reserves the same caption block, so wrapped rows stay even and virtual rows share one height.
          aria-label already names the tile; the description is read once through aria-describedby. */}
      {captionLines > 0 ? <span className="hjm-image-choice__caption">
        {showItemLabels ? <Text variant={imageChoiceRecipe.itemLabelVariant} className="hjm-image-choice__item-label" aria-hidden="true" data-lines={itemLabelLines === 1 ? undefined : itemLabelLines}>{item.label}</Text> : null}
        {item.description === undefined ? null : <Text id={descriptionId} variant={imageChoiceRecipe.itemDescriptionVariant} tone={imageChoiceRecipe.itemDescriptionTone} className="hjm-image-choice__item-description" aria-hidden="true">{item.description}</Text>}
      </span> : null}
    </button>;
  };
  // First-paint estimate in px; the rendered row is measured afterwards because caption line height is rem-based.
  const estimatedTileHeight = resolveImageChoiceTileHeight(captionLines, typography[imageChoiceRecipe.itemLabelVariant].lineHeight * (theme?.environment.textScale ?? 1));
  return <div className={["hjm-image-choice", className].filter(Boolean).join(" ")} style={style}>
    {showLabel ? <span className="hjm-image-choice__label">{label}</span> : null}
    {virtualized
      ? <VirtualTileRows items={items} renderTile={renderTile} label={label} role={groupRole} height={virtualized.height} overscan={virtualized.overscan ?? virtualListRecipe.overscan} estimatedTileHeight={estimatedTileHeight} />
      : <div className="hjm-image-choice__tiles" role={groupRole} aria-label={label}>{items.map(renderTile)}</div>}
  </div>;
}

/**
 * Windowed rows of tiles. It reuses the VirtualList window math (`resolveVirtualWindow`) but not the VirtualList
 * component: that one names its rows as list items and moves focus row by row, which would replace the radio/checkbox
 * group this control is. Tiles stay in the tab order; focusing one scrolls it into view and the window follows.
 */
function VirtualTileRows({ items, renderTile, label, role, height, overscan, estimatedTileHeight }: Readonly<{
  items: readonly ImageChoiceItem[]; renderTile: (item: ImageChoiceItem, index: number) => ReactNode; label: string;
  role: "radiogroup" | "group"; height: number; overscan: number; estimatedTileHeight: number;
}>) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [measuredTileHeight, setMeasuredTileHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  useEffect(() => {
    if (!host.current) return;
    // Measure the slot itself (content box: inside the inset and the scrollbar); sheets and sidebars change it.
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    // Every row is one tile high (the caption block is reserved), so any mounted row gives the real stride.
    const rendered = host.current?.querySelector<HTMLElement>(".hjm-image-choice__row")?.offsetHeight ?? 0;
    if (rendered > 0 && rendered !== measuredTileHeight) setMeasuredTileHeight(rendered);
  });
  const columns = width > 0 ? Math.min(items.length, resolveImageChoiceColumns(width)) : 0;
  const stride = (measuredTileHeight || estimatedTileHeight) + imageChoiceRecipe.gap;
  const rowCount = columns ? Math.ceil(items.length / columns) : 0;
  const range = resolveVirtualWindow(rowCount, stride, height, scrollTop, overscan);
  // Keep the focused tile's row mounted when scrolling moves it out of the window, so focus is not dropped to body.
  const rows = Array.from({ length: range.end - range.start }, (_, i) => range.start + i);
  if (focusedRow !== null && focusedRow < rowCount && !rows.includes(focusedRow)) rows.push(focusedRow);
  rows.sort((first, second) => first - second); // DOM order is the tab order
  return <div ref={host} className="hjm-image-choice__viewport" role={role} aria-label={label} style={{ height }}
    onScroll={event => setScrollTop(event.currentTarget.scrollTop)}>
    {columns ? <div style={{ position: "relative", height: Math.max(0, range.totalHeight - imageChoiceRecipe.gap) }}>
      {rows.map(row => <div key={row} className="hjm-image-choice__row" style={{ top: row * stride, display: "grid", gridTemplateColumns: `repeat(${columns}, ${resolveImageChoiceOuterSize()}px)`, justifyContent: "space-between" }}
        onFocusCapture={() => setFocusedRow(row)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedRow(current => current === row ? null : current); }}>
        {items.slice(row * columns, row * columns + columns).map((item, offset) => renderTile(item, row * columns + offset))}
      </div>)}
    </div> : null}
  </div>;
}
