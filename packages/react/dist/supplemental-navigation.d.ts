import { type LoadMoreDescriptor, type LoadMoreMode, type LoadMoreRequestHandler, type LoadMoreRequestOutcome, type LoadMoreRequestReason } from "@hjm/design-contracts/components/load-more";
import { type LoadMoreDensity } from "@hjm/design-contracts/recipes";
import { type HTMLAttributes } from "react";
export type LoadMoreProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    descriptor: LoadMoreDescriptor;
    mode?: LoadMoreMode;
    density?: LoadMoreDensity;
    onLoadMore: LoadMoreRequestHandler;
    onRequestOutcome?: (outcome: LoadMoreRequestOutcome, reason: LoadMoreRequestReason) => void;
    onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
    intersectionRoot?: Element | Document | null;
    rootMargin?: string;
}>;
/**
 * A collection footer that keeps product data controlled while the shared
 * controller prevents overlapping cursor requests.
 */
export declare const LoadMore: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    descriptor: LoadMoreDescriptor;
    mode?: LoadMoreMode;
    density?: LoadMoreDensity;
    onLoadMore: LoadMoreRequestHandler;
    onRequestOutcome?: (outcome: LoadMoreRequestOutcome, reason: LoadMoreRequestReason) => void;
    onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
    intersectionRoot?: Element | Document | null;
    rootMargin?: string;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=supplemental-navigation.d.ts.map