export type LoadMoreMode = "automatic" | "manual";
export type LoadMoreRequestReason = "viewport" | "manual" | "retry";
export type LoadMoreReadyState = Readonly<{
    status: "ready";
    requestKey: string;
}>;
export type LoadMoreLoadingState = Readonly<{
    status: "loading";
    requestKey: string;
}>;
export type LoadMoreErrorState = Readonly<{
    status: "error";
    requestKey: string;
    message: string;
}>;
export type LoadMoreCompleteState = Readonly<{
    status: "complete";
    requestKey?: never;
}>;
/** Existing collection items stay mounted while this footer state changes. */
export type LoadMoreState = LoadMoreReadyState | LoadMoreLoadingState | LoadMoreErrorState | LoadMoreCompleteState;
export type LoadMoreRequest = Readonly<{
    requestKey: string;
    reason: LoadMoreRequestReason;
}>;
export type LoadMoreLabels = Readonly<{
    loadMore: string;
    loading: string;
    retry: string;
    complete: string;
}>;
export type LoadMoreDescriptor = Readonly<{
    state: LoadMoreState;
    labels: LoadMoreLabels;
}>;
export type LoadMoreRequestHandler = (request: LoadMoreRequest) => Promise<void>;
export type LoadMoreRequestOutcome = "started" | "blocked-by-mode" | "blocked-by-state" | "already-requesting";
export type LoadMoreControllerOptions = Readonly<{
    mode?: LoadMoreMode;
    onLoadMore: LoadMoreRequestHandler;
}>;
export type LoadMoreControllerSnapshot = Readonly<{
    mode: LoadMoreMode;
    inFlightRequestKey: string | null;
    disposed: boolean;
}>;
export type LoadMoreController = Readonly<{
    getSnapshot(): LoadMoreControllerSnapshot;
    request(state: LoadMoreState, reason: LoadMoreRequestReason): Promise<LoadMoreRequestOutcome>;
    dispose(): boolean;
}>;
export declare const loadMoreBehaviorDefaults: {
    readonly mode: "automatic";
};
export declare function validateLoadMoreState(state: LoadMoreState): void;
export declare function validateLoadMoreLabels(labels: LoadMoreLabels): void;
export declare function validateLoadMoreDescriptor(descriptor: LoadMoreDescriptor): void;
export declare function canRequestLoadMore(state: LoadMoreState, mode: LoadMoreMode, reason: LoadMoreRequestReason): boolean;
/**
 * Prevents duplicate and out-of-order page requests without owning collection
 * data. Query state remains product-owned; this controller only gates events.
 */
export declare function createLoadMoreController(options: LoadMoreControllerOptions): LoadMoreController;
//# sourceMappingURL=load-more.d.ts.map