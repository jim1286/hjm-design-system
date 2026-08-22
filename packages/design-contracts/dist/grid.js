import { spacing } from "./foundations.js";
import { resolveResponsiveValue, resolveWindowClass, validateResponsiveValue, windowClassOrder, } from "./responsive.js";
/** `none` is the only non-token gap: the semantic absence of space. */
export const gridGaps = {
    none: 0,
    ...spacing,
};
export const gridDefaults = {
    gap: "md",
    flow: "row-major",
};
export const gridRecipe = {
    slots: ["root", "item"],
    defaults: gridDefaults,
    gaps: gridGaps,
};
const descriptorKeys = new Set(["columns", "gap", "minColumnWidth"]);
const gapKeys = new Set(["row", "column"]);
const optionKeys = new Set(["windowWidth", "availableWidth"]);
const gapTokens = new Set(Object.keys(gridGaps));
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function rejectUnknownKeys(value, allowed, field) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
            throw new TypeError(`Unsupported Grid ${field} field: ${key}`);
        }
    }
}
function forEachResponsiveValue(responsive, visit) {
    validateResponsiveValue(responsive);
    for (const windowClass of windowClassOrder) {
        if (Object.hasOwn(responsive, windowClass)) {
            visit(responsive[windowClass], windowClass);
        }
    }
}
function validateColumnCount(value, windowClass) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new RangeError(`Grid columns at ${windowClass} must be a positive integer`);
    }
}
function validatePositiveWidth(value, field) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new RangeError(`Grid ${field} must be a positive finite number`);
    }
}
function validateGapToken(value, field) {
    if (typeof value !== "string" || !gapTokens.has(value)) {
        throw new TypeError(`Unsupported Grid ${field} gap: ${String(value)}`);
    }
}
function validateGap(value, windowClass) {
    if (typeof value === "string") {
        validateGapToken(value, windowClass);
        return;
    }
    if (!isRecord(value)) {
        throw new TypeError(`Grid gap at ${windowClass} must be a token or axis object`);
    }
    rejectUnknownKeys(value, gapKeys, `gap.${windowClass}`);
    validateGapToken(value.row, `${windowClass}.row`);
    validateGapToken(value.column, `${windowClass}.column`);
}
export function validateGridDescriptor(descriptor) {
    if (!isRecord(descriptor)) {
        throw new TypeError("Grid descriptor must be an object");
    }
    rejectUnknownKeys(descriptor, descriptorKeys, "descriptor");
    forEachResponsiveValue(descriptor.columns, validateColumnCount);
    if (descriptor.gap !== undefined) {
        forEachResponsiveValue(descriptor.gap, validateGap);
    }
    if (descriptor.minColumnWidth !== undefined) {
        forEachResponsiveValue(descriptor.minColumnWidth, (value, windowClass) => {
            validatePositiveWidth(value, `minColumnWidth at ${windowClass}`);
        });
    }
}
function validateResolveOptions(options) {
    if (!isRecord(options)) {
        throw new TypeError("Grid layout options must be an object");
    }
    rejectUnknownKeys(options, optionKeys, "layout options");
    // resolveWindowClass owns the zero-width/negative distinction for the window.
    const windowClass = resolveWindowClass(options.windowWidth);
    const availableWidth = options.availableWidth ?? options.windowWidth;
    validatePositiveWidth(availableWidth, "availableWidth");
    return { availableWidth, windowClass };
}
function resolveGap(gap) {
    if (typeof gap === "string") {
        const resolved = gridGaps[gap];
        return { row: resolved, column: resolved };
    }
    return {
        row: gridGaps[gap.row],
        column: gridGaps[gap.column],
    };
}
/**
 * Resolves renderer-neutral grid geometry. Columns may only collapse from
 * the requested count when `minColumnWidth` requires it; they never widen.
 * Renderers must preserve child source order (`row-major`) on both platforms.
 */
export function resolveGridLayout(descriptor, options) {
    validateGridDescriptor(descriptor);
    const { availableWidth, windowClass } = validateResolveOptions(options);
    const requestedColumns = resolveResponsiveValue(descriptor.columns, windowClass);
    const responsiveGap = descriptor.gap ?? { compact: gridDefaults.gap };
    const { row: rowGap, column: columnGap } = resolveGap(resolveResponsiveValue(responsiveGap, windowClass));
    let columns = requestedColumns;
    if (descriptor.minColumnWidth !== undefined) {
        const minColumnWidth = resolveResponsiveValue(descriptor.minColumnWidth, windowClass);
        const fittingColumns = Math.max(1, Math.floor((availableWidth + columnGap) / (minColumnWidth + columnGap)));
        columns = Math.min(requestedColumns, fittingColumns);
    }
    const columnWidth = (availableWidth - columnGap * (columns - 1)) / columns;
    if (!Number.isFinite(columnWidth) || columnWidth <= 0) {
        throw new RangeError("Grid columns and column gap leave no positive column width");
    }
    return {
        windowClass,
        flow: gridDefaults.flow,
        requestedColumns,
        columns,
        rowGap,
        columnGap,
        columnWidth,
    };
}
//# sourceMappingURL=grid.js.map