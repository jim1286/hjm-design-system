export declare function isDevelopment(): boolean;
/** Keep general component diagnostics independent of removed compatibility props. */
export declare function warnOnce(key: string, message: string): void;
/** Prevent untyped callers from sending a removed visual override through host props. */
export declare function assertNoRemovedStyleProps(component: string, props: object, names: readonly string[]): void;
export declare function resetDiagnosticsForTest(): void;
//# sourceMappingURL=diagnostics.d.ts.map