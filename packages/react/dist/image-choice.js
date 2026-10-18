import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Text } from "./layout.js";
import { useOptionalHjmTheme } from "./provider.js";
import { typography } from "@hjmds/design-contracts/foundations";
import { imageChoiceRecipe, resolveImageChoiceCaptionLines, resolveImageChoiceColumns, resolveImageChoiceTileHeight, resolveImageChoiceToggle, validateImageChoiceItemLabelLines, validateImageChoiceItems, } from "@hjmds/design-contracts/components/image-choice";
import { resolveVirtualWindow, virtualListRecipe } from "@hjmds/design-contracts/components/virtual-list";
/**
 * Picks avatars or photos by image (2026-10-16). Tiles are square, wrap to the available width, and show
 * a brand ring plus a check when chosen; assistive tech hears radios (single) or checkboxes (multiple).
 */
export function ImageChoiceGroup(props) {
    const { label, showLabel = false, showItemLabels = false, itemLabelLines = imageChoiceRecipe.itemLabelLines, items, disabled = false, className, virtualized } = props;
    validateImageChoiceItems(items);
    validateImageChoiceItemLabelLines(itemLabelLines);
    const theme = useOptionalHjmTheme();
    const baseId = useId();
    const isSelected = (id) => props.selectionMode === "single" ? props.value === id : props.value.includes(id);
    const choose = (id) => {
        if (props.selectionMode === "single")
            props.onValueChange(resolveImageChoiceToggle("single", props.value, id));
        else
            props.onValueChange(resolveImageChoiceToggle("multiple", props.value, id));
    };
    const role = props.selectionMode === "single" ? "radio" : "checkbox";
    const groupRole = props.selectionMode === "single" ? "radiogroup" : "group";
    const captionLines = resolveImageChoiceCaptionLines({ showItemLabels, itemLabelLines, hasDescription: items.some(item => item.description !== undefined) });
    const style = { "--hjm-image-choice-size": `${imageChoiceRecipe.tileSize}px`, "--hjm-image-choice-gap": `${imageChoiceRecipe.gap}px`, "--hjm-image-choice-radius": `${imageChoiceRecipe.radius}px`, "--hjm-image-choice-ring": `${imageChoiceRecipe.ringWidth}px`, "--hjm-image-choice-offset": `${imageChoiceRecipe.ringOffset}px`, "--hjm-image-choice-check": `${imageChoiceRecipe.checkSize}px`, "--hjm-image-choice-item-label-gap": `${imageChoiceRecipe.itemLabelGap}px`, "--hjm-image-choice-caption-lines": captionLines, "--hjm-image-choice-viewport-inset": `${imageChoiceRecipe.virtualViewportInset}px` };
    const renderTile = (item, index) => {
        const selected = isSelected(item.id);
        const descriptionId = item.description === undefined ? undefined : `${baseId}-description-${index}`;
        return _jsxs("button", { type: "button", role: role, "aria-checked": selected, "aria-label": item.label, "aria-describedby": descriptionId, className: "hjm-image-choice__tile", "data-selected": selected || undefined, disabled: disabled || item.disabled, onClick: () => choose(item.id), children: [_jsxs("span", { className: "hjm-image-choice__ring", children: [_jsx("span", { className: "hjm-image-choice__image", children: item.image }), selected ? _jsx("span", { className: "hjm-image-choice__check", "aria-hidden": "true", children: "\u2713" }) : null] }), captionLines > 0 ? _jsxs("span", { className: "hjm-image-choice__caption", children: [showItemLabels ? _jsx(Text, { variant: imageChoiceRecipe.itemLabelVariant, className: "hjm-image-choice__item-label", "aria-hidden": "true", "data-lines": itemLabelLines === 1 ? undefined : itemLabelLines, children: item.label }) : null, item.description === undefined ? null : _jsx(Text, { id: descriptionId, variant: imageChoiceRecipe.itemDescriptionVariant, tone: imageChoiceRecipe.itemDescriptionTone, className: "hjm-image-choice__item-description", "aria-hidden": "true", children: item.description })] }) : null] }, item.id);
    };
    // First-paint estimate in px; the rendered row is measured afterwards because caption line height is rem-based.
    const estimatedTileHeight = resolveImageChoiceTileHeight(captionLines, typography[imageChoiceRecipe.itemLabelVariant].lineHeight * (theme?.environment.textScale ?? 1));
    return _jsxs("div", { className: ["hjm-image-choice", className].filter(Boolean).join(" "), style: style, children: [showLabel ? _jsx("span", { className: "hjm-image-choice__label", children: label }) : null, virtualized
                ? _jsx(VirtualTileRows, { items: items, renderTile: renderTile, label: label, role: groupRole, height: virtualized.height, overscan: virtualized.overscan ?? virtualListRecipe.overscan, estimatedTileHeight: estimatedTileHeight })
                : _jsx("div", { className: "hjm-image-choice__tiles", role: groupRole, "aria-label": label, children: items.map(renderTile) })] });
}
/**
 * Windowed rows of tiles. It reuses the VirtualList window math (`resolveVirtualWindow`) but not the VirtualList
 * component: that one names its rows as list items and moves focus row by row, which would replace the radio/checkbox
 * group this control is. Tiles stay in the tab order; focusing one scrolls it into view and the window follows.
 */
function VirtualTileRows({ items, renderTile, label, role, height, overscan, estimatedTileHeight }) {
    const host = useRef(null);
    const [width, setWidth] = useState(0);
    const [measuredTileHeight, setMeasuredTileHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [focusedRow, setFocusedRow] = useState(null);
    useEffect(() => {
        if (!host.current)
            return;
        // Measure the slot itself (content box: inside the inset and the scrollbar); sheets and sidebars change it.
        const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
        observer.observe(host.current);
        return () => observer.disconnect();
    }, []);
    useLayoutEffect(() => {
        // Every row is one tile high (the caption block is reserved), so any mounted row gives the real stride.
        const rendered = host.current?.querySelector(".hjm-image-choice__row")?.offsetHeight ?? 0;
        if (rendered > 0 && rendered !== measuredTileHeight)
            setMeasuredTileHeight(rendered);
    });
    const columns = width > 0 ? resolveImageChoiceColumns(width) : 0;
    const stride = (measuredTileHeight || estimatedTileHeight) + imageChoiceRecipe.gap;
    const rowCount = columns ? Math.ceil(items.length / columns) : 0;
    const range = resolveVirtualWindow(rowCount, stride, height, scrollTop, overscan);
    // Keep the focused tile's row mounted when scrolling moves it out of the window, so focus is not dropped to body.
    const rows = Array.from({ length: range.end - range.start }, (_, i) => range.start + i);
    if (focusedRow !== null && focusedRow < rowCount && !rows.includes(focusedRow))
        rows.push(focusedRow);
    rows.sort((first, second) => first - second); // DOM order is the tab order
    return _jsx("div", { ref: host, className: "hjm-image-choice__viewport", role: role, "aria-label": label, style: { height }, onScroll: event => setScrollTop(event.currentTarget.scrollTop), children: columns ? _jsx("div", { style: { position: "relative", height: Math.max(0, range.totalHeight - imageChoiceRecipe.gap) }, children: rows.map(row => _jsx("div", { className: "hjm-image-choice__row", style: { top: row * stride }, onFocusCapture: () => setFocusedRow(row), onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget))
                    setFocusedRow(current => current === row ? null : current); }, children: items.slice(row * columns, row * columns + columns).map((item, offset) => renderTile(item, row * columns + offset)) }, row)) }) : null });
}
//# sourceMappingURL=image-choice.js.map