/** Logical forward offset. Horizontal RTL hosts normalize their own scrollLeft. */
export type ScrollMetrics = Readonly<{
    offset: number;
    contentSize: number;
    viewportSize: number;
}>;
export declare function resolveScrollProgress({ offset, contentSize, viewportSize }: ScrollMetrics): number;
//# sourceMappingURL=scroll-progress.d.ts.map