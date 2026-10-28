"use client";
import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IdentityAction } from "./internal/identity-action.js";
import { resolveAvatarInitials } from "@hjmds/design-contracts/avatar-fallback";
import { TableSortButton } from "./table-sort-button.js";
import { getNextDataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { resolveDescriptionListColumnCount, resolveDescriptionListDescriptor, } from "@hjmds/design-contracts/components/description-list";
import { getTimelineSelectionTarget, resolveTimelineDescriptor, timelineDefaults, validateTimelineSelection, } from "@hjmds/design-contracts/components/timeline";
import { resolveStatisticDescriptor, validateStatisticGroup, } from "@hjmds/design-contracts/components/statistic";
import { accordionRecipe, avatarRecipe, resolveAvatarSize, validateAvatarPresentation, dividerRecipe, listRecipe, validateDividerLineStyle, statisticRecipe, } from "@hjmds/design-contracts/recipes";
import { Children, createElement, forwardRef, Fragment, isValidElement, useId, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { assignRef, classNames, useControllableState, useElementWidth } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
function validateAccordionItems(items) {
    if (items.length === 0)
        throw new TypeError("Accordion requires at least one item");
    const ids = new Set();
    for (const item of items) {
        if (item.id.trim().length === 0)
            throw new TypeError("Accordion item id must not be empty");
        if (ids.has(item.id))
            throw new TypeError(`Duplicate Accordion item id: ${item.id}`);
        ids.add(item.id);
    }
}
function accordionFocusTarget(items, currentIndex, key) {
    if (key === "Home")
        return items.findIndex((item) => !item.disabled);
    if (key === "End") {
        for (let index = items.length - 1; index >= 0; index -= 1) {
            if (!items[index]?.disabled)
                return index;
        }
        return -1;
    }
    const direction = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
    if (direction === 0)
        return undefined;
    for (let offset = 1; offset <= items.length; offset += 1) {
        const index = (currentIndex + direction * offset + items.length) % items.length;
        if (!items[index]?.disabled)
            return index;
    }
    return currentIndex;
}
export const Accordion = forwardRef(function Accordion({ items, value: valueProp, defaultValue = [], onValueChange, allowsMultipleExpanded = accordionRecipe.defaults.allowsMultipleExpanded, density = accordionRecipe.defaults.density, headingLevel = 3, renderIndicator, className, layoutStyle, ...props }, ref) {
    validateAccordionItems(items);
    const [storedValue, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const validIds = new Set(items.map((item) => item.id));
    const committed = useRef(false);
    const value = valueProp === undefined && committed.current ? storedValue.filter(id => validIds.has(id)) : storedValue;
    useLayoutEffect(() => {
        committed.current = true;
        // Removed uncontrolled disclosures retire their expansion; reinsertion starts closed.
        if (value.length !== storedValue.length)
            setValue(value);
    }, [value, storedValue, setValue]);
    const valueIds = new Set();
    for (const id of value) {
        if (!validIds.has(id))
            throw new RangeError(`Unknown Accordion value: ${id}`);
        if (valueIds.has(id))
            throw new TypeError(`Duplicate Accordion value: ${id}`);
        valueIds.add(id);
    }
    if (!allowsMultipleExpanded && value.length > 1) {
        throw new RangeError("Accordion only allows one expanded item");
    }
    const baseId = useId().replaceAll(":", "");
    const triggerRefs = useRef(new Map());
    const host = useRef(null);
    const focused = useRef(null);
    useLayoutEffect(() => {
        const previous = focused.current;
        if (!previous)
            return;
        const index = items.findIndex(item => item.id === previous.id);
        const removed = index < 0;
        const disabledTrigger = index >= 0 && items[index].disabled && triggerRefs.current.get(previous.id) === previous.node;
        if (!(removed || disabledTrigger) || (document.activeElement !== previous.node && document.activeElement !== document.body))
            return;
        // Restore only the removed/disabled target, never steal a user's external focus.
        const origin = removed ? Math.min(previous.index, items.length - 1) : index + 1;
        const target = Array.from({ length: items.length }, (_, offset) => items[(origin + offset) % items.length]).find(item => !item.disabled);
        focused.current = null;
        (target ? triggerRefs.current.get(target.id) : host.current)?.focus();
    }, [items]);
    const toggle = (id) => {
        const expanded = value.includes(id);
        setValue(expanded
            ? value.filter((candidate) => candidate !== id)
            : allowsMultipleExpanded
                ? [...value, id]
                : [id]);
    };
    return (_jsx("div", { ...props, style: { ...props.style, ...layoutStyle }, ref: node => { host.current = node; assignRef(ref, node); }, tabIndex: -1, className: classNames("hjm-accordion", className), "data-density": density, "data-multiple": allowsMultipleExpanded || undefined, children: items.map((item, index) => {
            const expanded = value.includes(item.id);
            const triggerId = `${baseId}-accordion-trigger-${index}`;
            const panelId = `${baseId}-accordion-panel-${index}`;
            const trigger = (_jsxs("button", { ref: (node) => {
                    if (node)
                        triggerRefs.current.set(item.id, node);
                    else
                        triggerRefs.current.delete(item.id);
                }, id: triggerId, type: "button", className: "hjm-accordion__trigger", "aria-expanded": expanded, "aria-label": item.accessibilityLabel, "aria-controls": panelId, disabled: item.disabled, onClick: () => toggle(item.id), onKeyDown: (event) => {
                    const target = accordionFocusTarget(items, index, event.key);
                    if (target === undefined || target < 0)
                        return;
                    event.preventDefault();
                    triggerRefs.current.get(items[target].id)?.focus();
                }, children: [_jsx("span", { className: "hjm-accordion__title", children: item.title }), _jsx("span", { className: "hjm-accordion__indicator", "aria-hidden": "true", children: renderIndicator ? renderIndicator({ value: item.id, expanded, disabled: item.disabled === true }) : expanded ? "−" : "+" })] }));
            return (_jsxs("div", { onFocusCapture: event => { if (event.target instanceof HTMLElement)
                    focused.current = { id: item.id, index, node: event.target }; }, className: "hjm-accordion__item", "data-state": item.disabled ? "disabled" : expanded ? "expanded" : "collapsed", children: [createElement(`h${headingLevel}`, { className: "hjm-accordion__header" }, trigger), _jsx("div", { id: panelId, role: "region", className: "hjm-accordion__panel", "aria-labelledby": triggerId, hidden: !expanded, children: item.panel })] }, item.id));
        }) }));
});
export const Avatar = forwardRef(function Avatar({ name, action, src, imageFit = "cover", alt: altProp, decorative = false, fallback, renderFallback, renderImage, size = avatarRecipe.defaults.size, shape = avatarRecipe.defaults.shape, frame = avatarRecipe.defaults.frame, accessory, accessoryPlacement = avatarRecipe.defaults.accessoryPlacement, imageProps, className, layoutStyle, ...props }, ref) {
    if (!decorative && (name === undefined || name.trim().length === 0))
        throw new TypeError("Avatar name must not be empty");
    if (renderImage && imageProps)
        throw new TypeError("Avatar renderImage and imageProps are exclusive; pass image attributes to the host");
    validateAvatarPresentation({ shape, frame, accessoryPlacement });
    const diameter = resolveAvatarSize(size);
    const alt = decorative ? "" : altProp ?? name ?? "";
    const generation = useMemo(() => ({}), [src]);
    const active = useRef(generation);
    useLayoutEffect(() => { active.current = generation; return () => { active.current = null; }; }, [generation]);
    const [failed, setFailed] = useState(null);
    const imageAvailable = Boolean(src) && failed !== generation;
    const { onError, className: imageClassName, ...restImageProps } = imageProps ?? {};
    const fail = () => { if (active.current === generation)
        setFailed(generation); };
    const initials = name !== undefined && name.trim().length > 0 ? resolveAvatarInitials(name) : null;
    const avatarNode = (_jsxs("span", { ...props, "aria-hidden": decorative || props["aria-hidden"], style: { ...props.style, ...(action ? {} : layoutStyle), "--hjm-avatar-size": `${diameter}px`,
            "--hjm-avatar-contained-ratio": avatarRecipe.containedImageRatio,
            // Absolute children are placed from the padding edge; subtract the frame border so the offset is from the box.
            "--hjm-avatar-accessory-inset": `${0 - avatarRecipe.accessory.offset - avatarRecipe.frames[frame].borderWidth}px` }, ref: ref, className: classNames("hjm-avatar", className), "data-size": size, "data-shape": shape, "data-image-fit": imageFit, "data-frame": frame, "data-state": imageAvailable ? "image" : "fallback", children: [src && imageAvailable ? (renderImage ? (_jsx(Fragment, { children: renderImage({ src, alt, size: diameter, className: "hjm-avatar__image", onError: fail }) }, src)) : (_createElement("img", { ...restImageProps, key: src, src: src, alt: alt, className: classNames("hjm-avatar__image", imageClassName), onError: (event) => {
                    if (active.current !== generation)
                        return;
                    setFailed(generation);
                    onError?.(event);
                } }))) : (_jsx("span", { className: "hjm-avatar__fallback", role: alt.length > 0 ? "img" : undefined, "aria-label": alt.length > 0 ? alt : undefined, "aria-hidden": alt.length === 0 || undefined, children: renderFallback?.({ size: diameter, decorative: true }) ?? fallback ?? initials })), accessory ? _jsx("span", { className: "hjm-avatar__accessory", "data-placement": accessoryPlacement, children: accessory }) : null] }));
    return action ? _jsx(IdentityAction, { action: action, ...(layoutStyle ? { layoutStyle } : {}), children: avatarNode }) : avatarNode;
});
/**
 * Overlapping avatars. The overlap comes from the recipe ratio rather than a
 * pixel value so it holds across all four sizes, and the group carries one
 * accessible name instead of letting a reader walk five unlabelled images.
 */
export const AvatarGroup = forwardRef(function AvatarGroup({ label, children, size = avatarRecipe.defaults.size, overflow, className, layoutStyle, style, ...props }, ref) {
    if (label.trim().length === 0)
        throw new TypeError("AvatarGroup label must not be empty");
    const offset = Math.round(avatarRecipe.sizes[size] * avatarRecipe.overlapRatio);
    return (_jsxs("span", { ...props, ref: ref, role: "group", "aria-label": label, className: classNames("hjm-avatar-group", className), "data-size": size, 
        // The caller `style` used to be replaced by the overlap variable; merge it
        // and keep the recipe overlap last so it stays size-derived.
        style: { ...style, ...layoutStyle, "--hjm-avatar-overlap": `${offset}px` }, children: [children, overflow ? _jsx("span", { className: "hjm-avatar-group__overflow", "aria-hidden": "true", children: overflow }) : null] }));
});
export const Divider = forwardRef(function Divider({ orientation = dividerRecipe.defaults.orientation, inset = dividerRecipe.defaults.inset, lineStyle = dividerRecipe.defaults.lineStyle, decorative = false, className, layoutStyle, ...props }, ref) {
    validateDividerLineStyle(lineStyle);
    return createElement(orientation === "horizontal" ? "hr" : "div", {
        ...props,
        style: { ...props.style, ...layoutStyle },
        ref,
        className: classNames("hjm-divider", className),
        "data-orientation": orientation,
        "data-inset": inset,
        "data-line-style": lineStyle,
        role: decorative ? "presentation" : "separator",
        "aria-hidden": decorative || undefined,
        "aria-orientation": decorative ? undefined : orientation,
    });
});
/** Decorative separator for a product-owned virtual collection. List owns separators for finite rows. */
export function ListSeparator({ separator = "content", leading = false, layoutStyle }) {
    if (!listRecipe.separators[separator])
        return null;
    return _jsx("div", { "aria-hidden": "true", role: "presentation", className: "hjm-list-separator", style: {
            marginInlineStart: `var(--hjm-list-separator-${separator}-${leading ? "leading-start" : "start"})`,
            marginInlineEnd: `var(--hjm-list-separator-${separator}-end)`,
            ...layoutStyle,
        } });
}
/** Semantic list container that owns separators around composed rows. */
export const List = forwardRef(function List({ label, children, separator = listRecipe.defaults.separator, appearance = "plain", className, layoutStyle, ...props }, ref) {
    if (!label.trim())
        throw new TypeError("List label must not be empty");
    const items = Children.toArray(children);
    return (_jsx("div", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, "aria-label": label, className: classNames("hjm-list", className), "data-appearance": appearance, "data-separator": separator, role: "list", children: items.map((item, index) => (_jsx("div", { className: "hjm-list__item", role: "listitem", children: item }, isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`))) }));
});
export function Statistic(props) {
    return _jsx(StatisticView, { ...props });
}
function StatisticView({ descriptor, density = "comfortable", presentation = "plain", contextLabel, accessibilityLabel, composeAccessibilityLabel, leading, valueColor, bar = false, renderTrendMark, renderValue, className, layoutStyle, ...props }) {
    const resolved = resolveStatisticDescriptor(descriptor);
    const valueText = `${resolved.prefix ?? ""}${resolved.value}${resolved.suffix ?? ""}`;
    const announcement = accessibilityLabel ?? composeAccessibilityLabel?.({
        ...(contextLabel === undefined ? {} : { contextLabel }),
        descriptor: resolved,
        valueText,
    }) ?? [contextLabel, resolved.label, valueText, resolved.trend?.label, resolved.hint]
        .filter(Boolean)
        .join(", ");
    if (!announcement.trim())
        throw new TypeError("Statistic accessibility label must not be empty");
    const trendName = resolved.trend
        ? statisticRecipe.trend.marks[resolved.trend.direction]
        : undefined;
    return (_jsxs("article", { ...props, style: { ...props.style, ...layoutStyle, ...(valueColor ? { "--hjm-statistic-value-color": valueColor } : {}) }, "aria-label": announcement, className: classNames("hjm-statistic", className), "data-arrangement": bar ? "bar" : undefined, "data-density": density, "data-presentation": presentation, children: [_jsx("span", { "aria-hidden": "true", className: "hjm-statistic__label", children: resolved.label }), _jsxs("span", { "aria-hidden": "true", className: "hjm-statistic__value-row", "data-leading": leading === undefined ? undefined : "", children: [leading === undefined ? null : _jsx("span", { className: "hjm-statistic__leading", children: leading }), resolved.prefix ? _jsx("span", { className: "hjm-statistic__affix", children: resolved.prefix }) : null, _jsx("strong", { className: "hjm-statistic__value", children: renderValue?.(resolved.value) ?? resolved.value }), resolved.suffix ? _jsx("span", { className: "hjm-statistic__affix", children: resolved.suffix }) : null] }), resolved.trend ? (_jsxs("span", { "aria-hidden": "true", className: "hjm-statistic__trend", "data-tone": resolved.trend.tone, children: [_jsx("span", { className: "hjm-statistic__trend-mark", children: renderTrendMark?.({ name: trendName, color: "currentColor", size: 16 }) ?? (resolved.trend.direction === "up" ? "↑" : resolved.trend.direction === "down" ? "↓" : "—") }), resolved.trend.label] })) : null, resolved.hint ? _jsx("span", { "aria-hidden": "true", className: "hjm-statistic__hint", children: resolved.hint }) : null] }));
}
export function StatisticGroup({ label, descriptor, density, presentation, composeAccessibilityLabel, arrangement = "grid", renderLeading, getValueColor, renderTrendMark, className, style, layoutStyle, ...props }) {
    validateStatisticGroup(descriptor);
    if (!label.trim())
        throw new TypeError("StatisticGroup label must not be empty");
    return (_jsx("div", { ...props, "aria-label": label, className: classNames("hjm-statistic-group", className), role: "list", "data-arrangement": arrangement, style: { ...style, ...layoutStyle, "--hjm-statistic-columns": arrangement === "bar" ? descriptor.items.length : descriptor.columns ?? statisticRecipe.defaults.columns }, children: descriptor.items.map((item) => {
            const valueColor = getValueColor?.(item);
            return (_jsx("div", { role: "listitem", children: _jsx(StatisticView, { bar: arrangement === "bar", ...(valueColor ? { valueColor } : {}), ...(renderLeading ? { leading: renderLeading(item, { color: valueColor ?? "currentColor", size: statisticRecipe.group.bar.iconSize }) } : {}), contextLabel: label, descriptor: item, ...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel }), ...(density === undefined ? {} : { density }), ...(presentation === undefined ? {} : { presentation }), ...(renderTrendMark === undefined ? {} : { renderTrendMark }) }) }, item.id));
        }) }));
}
function DescriptionListInner({ items, columns, layout, className, layoutStyle, style, ...props }, forwardedRef) {
    const descriptor = resolveDescriptionListDescriptor({
        items,
        ...(columns === undefined ? {} : { columns }),
        ...(layout === undefined ? {} : { layout }),
    });
    const [width, ref] = useElementWidth(forwardedRef);
    const theme = useOptionalHjmTheme();
    const resolvedColumns = resolveDescriptionListColumnCount(width ?? 0, descriptor.columns, theme?.environment.textScale ?? 1);
    const responsiveStyle = {
        ...style,
        ...layoutStyle,
        "--hjm-description-columns": resolvedColumns,
    };
    return (_jsx("dl", { ...props, ref: ref, className: classNames("hjm-description-list", className), "data-layout": descriptor.layout, "data-columns": resolvedColumns, "data-state": resolvedColumns < descriptor.columns ? "collapsed" : "ready", style: responsiveStyle, children: descriptor.items.map((item) => (_jsxs("div", { className: "hjm-description-list__item", children: [_jsx("dt", { className: "hjm-description-list__label", children: item.label }), _jsx("dd", { className: "hjm-description-list__value", children: item.value })] }, item.id))) }));
}
export const DescriptionList = forwardRef(DescriptionListInner);
// Table's callback cannot express null; share the sort policy with a two-state cycle.
function TableInner({ columns, rows, getRowKey, caption, emptyState, onSortChange, wrapperClassName, className, layoutStyle, ...props }, ref) {
    if (columns.length === 0)
        throw new TypeError("Table requires at least one column");
    const ids = new Set();
    for (const column of columns) {
        if (column.id.trim().length === 0)
            throw new TypeError("Table column id must not be empty");
        if (ids.has(column.id))
            throw new TypeError(`Duplicate Table column id: ${column.id}`);
        ids.add(column.id);
        if (column.sortDirection && !column.sortable) {
            throw new TypeError(`Table column ${column.id} has sortDirection but is not sortable`);
        }
    }
    const rowKeys = rows.map((row, rowIndex) => getRowKey(row, rowIndex));
    const seenRowKeys = new Set();
    for (const rowKey of rowKeys) {
        if (rowKey.trim().length === 0)
            throw new TypeError("Table row key must not be empty");
        if (seenRowKeys.has(rowKey))
            throw new TypeError(`Duplicate Table row key: ${rowKey}`);
        seenRowKeys.add(rowKey);
    }
    return (
    // Placement belongs to the scroll wrapper (the visual root); `style` keeps
    // going to the <table>, where it always went.
    _jsx("div", { className: classNames("hjm-table-scroll", wrapperClassName), style: layoutStyle, tabIndex: 0, children: _jsxs("table", { ...props, ref: ref, className: classNames("hjm-table", className), children: [caption ? _jsx("caption", { className: "hjm-table__caption", children: caption }) : null, _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { scope: "col", className: "hjm-table__header", "data-align": column.align ?? "start", "aria-sort": column.sortDirection ?? (column.sortable ? "none" : undefined), children: column.sortable ? (_jsx(TableSortButton, { header: column.header, ...(column.sortDirection === undefined ? {} : { direction: column.sortDirection }), glyphs: { ascending: " ↑", descending: " ↓", none: " ↕" }, className: "hjm-table__sort", onSort: () => {
                                    const next = getNextDataTableSortState(column.sortDirection ? { columnId: column.id, direction: column.sortDirection } : null, column.id, "two-state");
                                    onSortChange?.(column.id, next.direction);
                                } })) : column.header }, column.id))) }) }), _jsx("tbody", { children: rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { className: "hjm-table__empty", colSpan: columns.length, children: emptyState }) })) : (rows.map((row, rowIndex) => (_jsx("tr", { className: "hjm-table__row", children: columns.map((column) => (_jsx("td", { className: "hjm-table__cell", "data-align": column.align ?? "start", children: column.cell(row, rowIndex) }, column.id))) }, rowKeys[rowIndex])))) })] }) }));
}
export const Table = forwardRef(TableInner);
function TimelineInner({ items, variant = timelineDefaults.variant, composeAccessibleName, renderMetadata, renderActions, selectedId, onSelectedIdChange, className, layoutStyle, onKeyDown, ...props }, ref) {
    validateTimelineSelection(selectedId, onSelectedIdChange, { hasActions: renderActions !== undefined, variant });
    const selectable = onSelectedIdChange !== undefined;
    const journal = variant === "journal";
    // Anchor collapsed state to its selected record. External map/day selection opens the new record immediately.
    const [disclosure, setDisclosure] = useState({ id: selectedId, collapsed: false });
    if (disclosure.id !== selectedId)
        setDisclosure({ id: selectedId, collapsed: false });
    if (selectable && !props["aria-label"] && !props["aria-labelledby"]) {
        throw new TypeError("A selectable Timeline needs aria-label or aria-labelledby (listbox name)");
    }
    const resolved = resolveTimelineDescriptor(selectable ? { items, selectedId: selectedId ?? null } : { items }, { composeAccessibleName });
    const idPrefix = useId();
    // Roving tab stop: the selected record, or the first one before anything is chosen.
    const tabStopId = selectable ? (selectedId ?? resolved[0]?.id) : undefined;
    const select = (list, id, toggle = false) => {
        if (journal)
            setDisclosure({ id, collapsed: toggle && id === selectedId && !disclosure.collapsed });
        if (id !== selectedId)
            onSelectedIdChange?.(id);
        list.querySelector(`[data-timeline-id="${CSS.escape(id)}"]`)?.focus();
    };
    const handleKeyDown = (event) => {
        onKeyDown?.(event);
        if (!selectable || event.defaultPrevented)
            return;
        const focusedId = event.target.closest("[data-timeline-id]")?.dataset.timelineId;
        if (focusedId === undefined)
            return;
        if (!journal && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            select(event.currentTarget, focusedId, true);
            return;
        }
        const target = getTimelineSelectionTarget(items, focusedId, event.key);
        if (target === undefined)
            return;
        event.preventDefault();
        select(event.currentTarget, target);
    };
    return (_jsx("ol", { ...props, style: { ...props.style, ...layoutStyle }, ref: ref, className: classNames("hjm-timeline", className), role: selectable && !journal ? "listbox" : props.role, "aria-orientation": selectable && !journal ? "vertical" : undefined, "data-selectable": selectable || undefined, "data-variant": variant, onKeyDown: handleKeyDown, children: resolved.map((item, index) => {
            const actions = renderActions?.(item);
            const detailIds = selectable
                ? [item.description ? `${idPrefix}-${index}-description` : null, item.timestamp ? `${idPrefix}-${index}-timestamp` : null].filter(Boolean).join(" ")
                : "";
            const expanded = !selectable || (item.selected && (disclosure.id !== selectedId || !disclosure.collapsed));
            const body = _jsxs(_Fragment, { children: [_jsxs("span", { className: "hjm-timeline__rail", "aria-hidden": "true", children: [_jsx("span", { className: "hjm-timeline__dot" }), index < resolved.length - 1 ? _jsx("span", { className: "hjm-timeline__connector" }) : null] }), _jsxs("span", { className: "hjm-timeline__content", children: [_jsxs("span", { className: "hjm-timeline__heading", children: [_jsx("strong", { className: "hjm-timeline__label", children: item.label }), !journal ? renderMetadata?.(item) : selectable ? _jsx("span", { className: "hjm-timeline__chevron", "aria-hidden": "true", children: "\u2304" }) : null] }), journal && item.timestamp ? _jsx("time", { className: "hjm-timeline__timestamp", dateTime: item.dateTime, children: item.timestamp }) : null, _jsxs("span", { className: "hjm-timeline__details", id: `${idPrefix}-${index}-details`, hidden: journal && !expanded, children: [journal ? renderMetadata?.(item) : null, item.description ? _jsx("span", { className: "hjm-timeline__description", id: selectable && !journal ? `${idPrefix}-${index}-description` : undefined, children: item.description }) : null, !journal && item.timestamp ? _jsx("time", { className: "hjm-timeline__timestamp", dateTime: item.dateTime, id: selectable ? `${idPrefix}-${index}-timestamp` : undefined, children: item.timestamp }) : null] })] }), actions ? _jsx("div", { className: "hjm-timeline__actions", children: actions }) : null] });
            if (journal && selectable)
                return _jsx("li", { children: _jsx("button", { type: "button", className: "hjm-timeline__item", "data-tone": item.tone, "data-state": item.selected ? "selected" : undefined, "data-timeline-id": item.id, "aria-label": [item.accessibleName, item.timestamp].filter(Boolean).join(", "), "aria-expanded": expanded, "aria-controls": `${idPrefix}-${index}-details`, "aria-describedby": expanded ? `${idPrefix}-${index}-details` : undefined, onClick: event => select(event.currentTarget.closest("ol"), item.id, true), children: body }) }, item.id);
            return _jsx("li", { "aria-label": item.accessibleName, className: "hjm-timeline__item", "data-tone": item.tone, "data-emphasized": item.emphasized || undefined, ...(selectable ? {
                    role: "option", "aria-selected": item.selected, "aria-describedby": detailIds || undefined,
                    "data-timeline-id": item.id, "data-state": item.selected ? "selected" : undefined,
                    tabIndex: item.id === tabStopId ? 0 : -1,
                    onClick: (event) => select(event.currentTarget.parentElement, item.id),
                } : {}), children: body }, item.id);
        }) }));
}
export const Timeline = forwardRef(TimelineInner);
//# sourceMappingURL=advanced-display.js.map