/**
 * Width classes are shared semantic names, not device categories. Web uses
 * CSS pixels and Native uses density-independent points for the same numeric
 * thresholds.
 */
export declare const windowClassOrder: readonly ["compact", "medium", "expanded", "wide"];
export type WindowClass = (typeof windowClassOrder)[number];
/**
 * `compact` is the required baseline. Missing larger classes inherit the
 * closest value declared at a narrower class, so sparse maps stay total.
 */
export type ResponsiveValue<Value> = Readonly<{
    compact: Value;
    medium?: Value;
    expanded?: Value;
    wide?: Value;
}>;
/** Validates only the responsive map shape; the owning contract validates each value. */
export declare function validateResponsiveValue<Value>(value: ResponsiveValue<Value>): void;
/** Resolves the shared width class at the inclusive foundation thresholds. */
export declare function resolveWindowClass(windowWidth: number): WindowClass;
/**
 * Resolves an exact class override or walks toward compact until a declared
 * value is found. The required compact baseline makes the result total.
 */
export declare function resolveResponsiveValue<Value>(value: ResponsiveValue<Value>, windowClass: WindowClass): Value;
//# sourceMappingURL=responsive.d.ts.map