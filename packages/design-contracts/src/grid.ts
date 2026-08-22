import { spacing } from "./foundations.js";
import {
  resolveResponsiveValue,
  resolveWindowClass,
  validateResponsiveValue,
  windowClassOrder,
  type ResponsiveValue,
  type WindowClass,
} from "./responsive.js";

/** `none` is the only non-token gap: the semantic absence of space. */
export const gridGaps = {
  none: 0,
  ...spacing,
} as const;

export type GridGapToken = keyof typeof gridGaps;

/** A single token applies to both axes; the object form allows independent axes. */
export type GridGap =
  | GridGapToken
  | Readonly<{
      row: GridGapToken;
      column: GridGapToken;
    }>;

export type GridDescriptor = Readonly<{
  /** Requested column count at each window class; every value must be a positive integer. */
  columns: ResponsiveValue<number>;
  /** Token-only spacing. Missing larger classes inherit toward compact. */
  gap?: ResponsiveValue<GridGap>;
  /**
   * Optional target floor. The resolver reduces `columns` before allowing
   * multiple columns below this width; one column still shrinks to its container.
   */
  minColumnWidth?: ResponsiveValue<number>;
}>;

export const gridDefaults = {
  gap: "md",
  flow: "row-major",
} as const satisfies Readonly<{
  gap: GridGapToken;
  flow: "row-major";
}>;

export const gridRecipe = {
  slots: ["root", "item"] as const,
  defaults: gridDefaults,
  gaps: gridGaps,
} as const;

export type ResolveGridLayoutOptions = Readonly<{
  /** Full window/viewport width used only to choose the shared WindowClass. */
  windowWidth: number;
  /** Inner grid width after page padding/sidebar; defaults to windowWidth. */
  availableWidth?: number;
}>;

export type ResolvedGridLayout = Readonly<{
  windowClass: WindowClass;
  flow: "row-major";
  requestedColumns: number;
  columns: number;
  rowGap: number;
  columnGap: number;
  columnWidth: number;
}>;

const descriptorKeys = new Set(["columns", "gap", "minColumnWidth"]);
const gapKeys = new Set(["row", "column"]);
const optionKeys = new Set(["windowWidth", "availableWidth"]);
const gapTokens = new Set<GridGapToken>(
  Object.keys(gridGaps) as GridGapToken[],
);

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rejectUnknownKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: ReadonlySet<string>,
  field: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new TypeError(`Unsupported Grid ${field} field: ${key}`);
    }
  }
}

function forEachResponsiveValue<Value>(
  responsive: ResponsiveValue<Value>,
  visit: (value: Value, windowClass: WindowClass) => void,
): void {
  validateResponsiveValue(responsive);
  for (const windowClass of windowClassOrder) {
    if (Object.hasOwn(responsive, windowClass)) {
      visit(responsive[windowClass] as Value, windowClass);
    }
  }
}

function validateColumnCount(value: number, windowClass: WindowClass): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(
      `Grid columns at ${windowClass} must be a positive integer`,
    );
  }
}

function validatePositiveWidth(value: number, field: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`Grid ${field} must be a positive finite number`);
  }
}

function validateGapToken(value: unknown, field: string): asserts value is GridGapToken {
  if (typeof value !== "string" || !gapTokens.has(value as GridGapToken)) {
    throw new TypeError(`Unsupported Grid ${field} gap: ${String(value)}`);
  }
}

function validateGap(value: GridGap, windowClass: WindowClass): void {
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

export function validateGridDescriptor(descriptor: GridDescriptor): void {
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

function validateResolveOptions(options: ResolveGridLayoutOptions): Readonly<{
  availableWidth: number;
  windowClass: WindowClass;
}> {
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

function resolveGap(gap: GridGap): Readonly<{ row: number; column: number }> {
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
export function resolveGridLayout(
  descriptor: GridDescriptor,
  options: ResolveGridLayoutOptions,
): ResolvedGridLayout {
  validateGridDescriptor(descriptor);
  const { availableWidth, windowClass } = validateResolveOptions(options);
  const requestedColumns = resolveResponsiveValue(descriptor.columns, windowClass);
  const responsiveGap = descriptor.gap ?? { compact: gridDefaults.gap };
  const { row: rowGap, column: columnGap } = resolveGap(
    resolveResponsiveValue(responsiveGap, windowClass),
  );

  let columns = requestedColumns;
  if (descriptor.minColumnWidth !== undefined) {
    const minColumnWidth = resolveResponsiveValue(
      descriptor.minColumnWidth,
      windowClass,
    );
    const fittingColumns = Math.max(
      1,
      Math.floor((availableWidth + columnGap) / (minColumnWidth + columnGap)),
    );
    columns = Math.min(requestedColumns, fittingColumns);
  }

  const columnWidth =
    (availableWidth - columnGap * (columns - 1)) / columns;
  if (!Number.isFinite(columnWidth) || columnWidth <= 0) {
    throw new RangeError(
      "Grid columns and column gap leave no positive column width",
    );
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
