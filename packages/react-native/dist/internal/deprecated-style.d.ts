export declare function isDevelopment(): boolean;
/** Development-only console.warn deduplicated by key for the lifetime of the JS runtime. */
export declare function warnOnce(key: string, message: string): void;
/** Warns once per component/prop pair for each deprecated visual style prop the caller passed. */
export declare function warnDeprecatedStyleProps(component: string, props: Readonly<Record<string, unknown>>, replacement: string): void;
/** Test seam: the once-per-runtime memo would otherwise hide warnings across test cases. */
export declare function resetDeprecatedStyleWarningsForTest(): void;
//# sourceMappingURL=deprecated-style.d.ts.map