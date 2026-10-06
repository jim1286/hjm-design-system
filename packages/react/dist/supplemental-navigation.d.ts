import { type LoadMoreDescriptor, type LoadMoreMode, type LoadMoreRequestHandler, type LoadMoreRequestOutcome, type LoadMoreRequestReason } from "@hjmds/design-contracts/components/load-more";
import { type LoadMoreDensity } from "@hjmds/design-contracts/recipes";
import { type HTMLAttributes } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type LoadMoreProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
    descriptor: LoadMoreDescriptor;
    mode?: LoadMoreMode;
    density?: LoadMoreDensity;
    onLoadMore: LoadMoreRequestHandler;
    onRequestOutcome?: (outcome: LoadMoreRequestOutcome, reason: LoadMoreRequestReason) => void;
    onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
    intersectionRoot?: Element | Document | null;
    rootMargin?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=supplemental-navigation.d.ts.map