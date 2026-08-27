import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveDescriptionListColumnCount, resolveDescriptionListDescriptor, } from "@hjm/design-contracts/components/description-list";
import { resolveTimelineDescriptor, } from "@hjm/design-contracts/components/timeline";
import { resolveStatisticDescriptor, validateStatisticGroup, } from "@hjm/design-contracts/components/statistic";
import { accordionRecipe, avatarRecipe, dividerRecipe, listRecipe, statisticRecipe, } from "@hjm/design-contracts/recipes";
import { Children, createElement, forwardRef, isValidElement, useEffect, useId, useRef, useState, } from "react";
import { classNames, useControllableState, useElementWidth } from "./internal.js";
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
export const Accordion = forwardRef(function Accordion({ items, value: valueProp, defaultValue = [], onValueChange, allowsMultipleExpanded = accordionRecipe.defaults.allowsMultipleExpanded, density = accordionRecipe.defaults.density, headingLevel = 3, className, ...props }, ref) {
    validateAccordionItems(items);
    const [value, setValue] = useControllableState({
        ...(valueProp === undefined ? {} : { value: valueProp }),
        defaultValue,
        ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const validIds = new Set(items.map((item) => item.id));
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
    const toggle = (id) => {
        const expanded = value.includes(id);
        setValue(expanded
            ? value.filter((candidate) => candidate !== id)
            : allowsMultipleExpanded
                ? [...value, id]
                : [id]);
    };
    return (_jsx("div", { ...props, ref: ref, className: classNames("hjm-accordion", className), "data-density": density, "data-multiple": allowsMultipleExpanded || undefined, children: items.map((item, index) => {
            const expanded = value.includes(item.id);
            const triggerId = `${baseId}-accordion-trigger-${index}`;
            const panelId = `${baseId}-accordion-panel-${index}`;
            const trigger = (_jsxs("button", { ref: (node) => {
                    if (node)
                        triggerRefs.current.set(item.id, node);
                    else
                        triggerRefs.current.delete(item.id);
                }, id: triggerId, type: "button", className: "hjm-accordion__trigger", "aria-expanded": expanded, "aria-controls": panelId, disabled: item.disabled, onClick: () => toggle(item.id), onKeyDown: (event) => {
                    const target = accordionFocusTarget(items, index, event.key);
                    if (target === undefined || target < 0)
                        return;
                    event.preventDefault();
                    triggerRefs.current.get(items[target].id)?.focus();
                }, children: [_jsx("span", { className: "hjm-accordion__title", children: item.title }), _jsx("span", { className: "hjm-accordion__indicator", "aria-hidden": "true", children: expanded ? "−" : "+" })] }));
            return (_jsxs("div", { className: "hjm-accordion__item", "data-state": item.disabled ? "disabled" : expanded ? "expanded" : "collapsed", children: [createElement(`h${headingLevel}`, { className: "hjm-accordion__header" }, trigger), _jsx("div", { id: panelId, role: "region", className: "hjm-accordion__panel", "aria-labelledby": triggerId, hidden: !expanded, children: item.panel })] }, item.id));
        }) }));
});
function initials(name) {
    return name
        .trim()
        .split(/\s+/u)
        .slice(0, 2)
        .map((part) => Array.from(part)[0] ?? "")
        .join("")
        .toLocaleUpperCase();
}
export const Avatar = forwardRef(function Avatar({ name, src, alt = name, fallback, size = avatarRecipe.defaults.size, shape = avatarRecipe.defaults.shape, imageProps, className, ...props }, ref) {
    if (name.trim().length === 0)
        throw new TypeError("Avatar name must not be empty");
    const [imageAvailable, setImageAvailable] = useState(Boolean(src));
    useEffect(() => setImageAvailable(Boolean(src)), [src]);
    const { onError, className: imageClassName, ...restImageProps } = imageProps ?? {};
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-avatar", className), "data-size": size, "data-shape": shape, "data-state": imageAvailable ? "image" : "fallback", children: src && imageAvailable ? (_jsx("img", { ...restImageProps, src: src, alt: alt, className: classNames("hjm-avatar__image", imageClassName), onError: (event) => {
                setImageAvailable(false);
                onError?.(event);
            } })) : (_jsx("span", { className: "hjm-avatar__fallback", role: alt.length > 0 ? "img" : undefined, "aria-label": alt.length > 0 ? alt : undefined, "aria-hidden": alt.length === 0 || undefined, children: fallback ?? initials(name) })) }));
});
export const Divider = forwardRef(function Divider({ orientation = dividerRecipe.defaults.orientation, inset = dividerRecipe.defaults.inset, decorative = false, className, ...props }, ref) {
    return createElement(orientation === "horizontal" ? "hr" : "div", {
        ...props,
        ref,
        className: classNames("hjm-divider", className),
        "data-orientation": orientation,
        "data-inset": inset,
        role: decorative ? "presentation" : "separator",
        "aria-hidden": decorative || undefined,
        "aria-orientation": decorative ? undefined : orientation,
    });
});
/** Semantic list container that owns separators around composed rows. */
export const List = forwardRef(function List({ label, children, separator = listRecipe.defaults.separator, appearance = "plain", className, ...props }, ref) {
    if (!label.trim())
        throw new TypeError("List label must not be empty");
    const items = Children.toArray(children);
    return (_jsx("div", { ...props, ref: ref, "aria-label": label, className: classNames("hjm-list", className), "data-appearance": appearance, "data-separator": separator, role: "list", children: items.map((item, index) => (_jsx("div", { className: "hjm-list__item", role: "listitem", children: item }, isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`))) }));
});
export function Statistic({ descriptor, density = "comfortable", presentation = "plain", contextLabel, accessibilityLabel, composeAccessibilityLabel, renderTrendMark, className, ...props }) {
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
    return (_jsxs("article", { ...props, "aria-label": announcement, className: classNames("hjm-statistic", className), "data-density": density, "data-presentation": presentation, children: [_jsx("span", { "aria-hidden": "true", className: "hjm-statistic__label", children: resolved.label }), _jsxs("span", { "aria-hidden": "true", className: "hjm-statistic__value-row", children: [resolved.prefix ? _jsx("span", { className: "hjm-statistic__affix", children: resolved.prefix }) : null, _jsx("strong", { className: "hjm-statistic__value", children: resolved.value }), resolved.suffix ? _jsx("span", { className: "hjm-statistic__affix", children: resolved.suffix }) : null] }), resolved.trend ? (_jsxs("span", { "aria-hidden": "true", className: "hjm-statistic__trend", "data-tone": resolved.trend.tone, children: [_jsx("span", { className: "hjm-statistic__trend-mark", children: renderTrendMark?.({ name: trendName, color: "currentColor", size: 16 }) ?? (resolved.trend.direction === "up" ? "↑" : resolved.trend.direction === "down" ? "↓" : "—") }), resolved.trend.label] })) : null, resolved.hint ? _jsx("span", { "aria-hidden": "true", className: "hjm-statistic__hint", children: resolved.hint }) : null] }));
}
export function StatisticGroup({ label, descriptor, density, presentation, composeAccessibilityLabel, renderTrendMark, className, style, ...props }) {
    validateStatisticGroup(descriptor);
    if (!label.trim())
        throw new TypeError("StatisticGroup label must not be empty");
    return (_jsx("div", { ...props, "aria-label": label, className: classNames("hjm-statistic-group", className), role: "list", style: { ...style, "--hjm-statistic-columns": descriptor.columns ?? statisticRecipe.defaults.columns }, children: descriptor.items.map((item) => (_jsx("div", { role: "listitem", children: _jsx(Statistic, { contextLabel: label, descriptor: item, ...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel }), ...(density === undefined ? {} : { density }), ...(presentation === undefined ? {} : { presentation }), ...(renderTrendMark === undefined ? {} : { renderTrendMark }) }) }, item.id))) }));
}
function DescriptionListInner({ items, columns, className, style, ...props }, forwardedRef) {
    const descriptor = resolveDescriptionListDescriptor({
        items,
        ...(columns === undefined ? {} : { columns }),
    });
    const [width, ref] = useElementWidth(forwardedRef);
    const theme = useOptionalHjmTheme();
    const resolvedColumns = resolveDescriptionListColumnCount(width ?? 0, descriptor.columns, theme?.environment.textScale ?? 1);
    const responsiveStyle = {
        ...style,
        "--hjm-description-columns": resolvedColumns,
    };
    return (_jsx("dl", { ...props, ref: ref, className: classNames("hjm-description-list", className), "data-columns": resolvedColumns, "data-state": resolvedColumns < descriptor.columns ? "collapsed" : "ready", style: responsiveStyle, children: descriptor.items.map((item) => (_jsxs("div", { className: "hjm-description-list__item", children: [_jsx("dt", { className: "hjm-description-list__label", children: item.label }), _jsx("dd", { className: "hjm-description-list__value", children: item.value })] }, item.id))) }));
}
export const DescriptionList = forwardRef(DescriptionListInner);
function TableInner({ columns, rows, getRowKey, caption, emptyState, onSortChange, wrapperClassName, className, ...props }, ref) {
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
    return (_jsx("div", { className: classNames("hjm-table-scroll", wrapperClassName), tabIndex: 0, children: _jsxs("table", { ...props, ref: ref, className: classNames("hjm-table", className), children: [caption ? _jsx("caption", { className: "hjm-table__caption", children: caption }) : null, _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { scope: "col", className: "hjm-table__header", "data-align": column.align ?? "start", "aria-sort": column.sortDirection ?? (column.sortable ? "none" : undefined), children: column.sortable ? (_jsxs("button", { type: "button", className: "hjm-table__sort", onClick: () => onSortChange?.(column.id, column.sortDirection === "ascending" ? "descending" : "ascending"), children: [column.header, _jsx("span", { "aria-hidden": "true", children: column.sortDirection === "ascending"
                                            ? " ↑"
                                            : column.sortDirection === "descending"
                                                ? " ↓"
                                                : " ↕" })] })) : column.header }, column.id))) }) }), _jsx("tbody", { children: rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { className: "hjm-table__empty", colSpan: columns.length, children: emptyState }) })) : (rows.map((row, rowIndex) => (_jsx("tr", { className: "hjm-table__row", children: columns.map((column) => (_jsx("td", { className: "hjm-table__cell", "data-align": column.align ?? "start", children: column.cell(row, rowIndex) }, column.id))) }, rowKeys[rowIndex])))) })] }) }));
}
export const Table = forwardRef(TableInner);
function TimelineInner({ items, composeAccessibleName, className, ...props }, ref) {
    const resolved = resolveTimelineDescriptor({ items }, { composeAccessibleName });
    return (_jsx("ol", { ...props, ref: ref, className: classNames("hjm-timeline", className), children: resolved.map((item, index) => (_jsxs("li", { "aria-label": item.accessibleName, className: "hjm-timeline__item", "data-tone": item.tone, children: [_jsxs("span", { className: "hjm-timeline__rail", "aria-hidden": "true", children: [_jsx("span", { className: "hjm-timeline__dot" }), index < resolved.length - 1 ? (_jsx("span", { className: "hjm-timeline__connector" })) : null] }), _jsxs("span", { className: "hjm-timeline__content", children: [_jsxs("span", { className: "hjm-timeline__heading", children: [_jsx("strong", { className: "hjm-timeline__label", children: item.label }), item.timestamp ? (_jsx("time", { className: "hjm-timeline__timestamp", children: item.timestamp })) : null] }), item.description ? (_jsx("span", { className: "hjm-timeline__description", children: item.description })) : null] })] }, item.id))) }));
}
export const Timeline = forwardRef(TimelineInner);
//# sourceMappingURL=advanced-display.js.map