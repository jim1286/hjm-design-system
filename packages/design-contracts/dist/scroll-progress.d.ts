/** Logical forward offset. Horizontal RTL hosts normalize their own scrollLeft. */
export type ScrollMetrics = Readonly<{
    offset: number;
    contentSize: number;
    viewportSize: number;
}>;
export declare function resolveScrollProgress(metrics: ScrollMetrics): number;
export type ScrollEdges = Readonly<{
    before: boolean;
    after: boolean;
}>;
/** Whether more content exists in either logical direction; not a scroll action. */
export declare function resolveScrollEdges(metrics: ScrollMetrics): ScrollEdges;
//# sourceMappingURL=scroll-progress.d.ts.map