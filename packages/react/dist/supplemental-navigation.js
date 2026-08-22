import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createLoadMoreController, validateLoadMoreDescriptor, } from "@hjm/design-contracts/components/load-more";
import { loadMoreRecipe, } from "@hjm/design-contracts/recipes";
import { forwardRef, useCallback, useEffect, useMemo, useRef, } from "react";
import { classNames } from "./internal.js";
/**
 * A collection footer that keeps product data controlled while the shared
 * controller prevents overlapping cursor requests.
 */
export const LoadMore = forwardRef(function LoadMore({ descriptor, mode = loadMoreRecipe.defaults.mode, density = loadMoreRecipe.defaults.density, onLoadMore, onRequestOutcome, onRequestError, intersectionRoot = null, rootMargin = "200px 0px", className, ...props }, ref) {
    validateLoadMoreDescriptor(descriptor);
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;
    const controller = useMemo(() => createLoadMoreController({ mode, onLoadMore: (request) => onLoadMoreRef.current(request) }), [mode]);
    const sentinelRef = useRef(null);
    const request = useCallback(async (reason) => {
        try {
            const outcome = await controller.request(descriptor.state, reason);
            onRequestOutcome?.(outcome, reason);
        }
        catch (error) {
            onRequestError?.(error, reason);
        }
    }, [controller, descriptor.state, onRequestError, onRequestOutcome]);
    useEffect(() => () => {
        controller.dispose();
    }, [controller]);
    useEffect(() => {
        if (mode !== "automatic" ||
            descriptor.state.status !== "ready" ||
            typeof IntersectionObserver === "undefined") {
            return;
        }
        const sentinel = sentinelRef.current;
        if (!sentinel)
            return;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting))
                void request("viewport");
        }, { root: intersectionRoot, rootMargin });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [descriptor.state.status, intersectionRoot, mode, request, rootMargin]);
    const { state, labels } = descriptor;
    return (_jsxs("div", { ...props, ref: ref, className: classNames("hjm-load-more", className), "data-mode": mode, "data-density": density, "data-state": state.status, "aria-busy": state.status === "loading" || undefined, children: [_jsx("span", { ref: sentinelRef, className: "hjm-load-more__sentinel", "aria-hidden": "true" }), state.status === "ready" ? (_jsx("button", { type: "button", className: "hjm-load-more__trigger", onClick: () => void request("manual"), children: labels.loadMore })) : state.status === "loading" ? (_jsxs("div", { className: "hjm-load-more__status", role: "status", children: [_jsx("span", { className: "hjm-load-more__spinner", "aria-hidden": "true" }), labels.loading] })) : state.status === "error" ? (_jsxs("div", { className: "hjm-load-more__error", children: [_jsx("span", { role: "alert", children: state.message }), _jsx("button", { type: "button", className: "hjm-load-more__trigger", onClick: () => void request("retry"), children: labels.retry })] })) : (_jsx("div", { className: "hjm-load-more__end", children: labels.complete }))] }));
});
//# sourceMappingURL=supplemental-navigation.js.map