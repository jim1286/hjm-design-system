import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createLoadMoreController, validateLoadMoreDescriptor, } from "@hjmds/design-contracts/components/load-more";
import { loadMoreRecipe, } from "@hjmds/design-contracts/recipes";
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, } from "react";
import { classNames } from "./internal.js";
function createLoadMoreControllerFacade() {
    const detachedSnapshot = {
        mode: "automatic",
        inFlightRequestKey: null,
        disposed: true,
    };
    let active = null;
    return {
        facade: {
            getSnapshot: () => active?.getSnapshot() ?? detachedSnapshot,
            request: (state, reason) => {
                if (!active)
                    throw new Error("Cannot use a detached LoadMore controller");
                return active.request(state, reason);
            },
            dispose: () => active?.dispose() ?? false,
        },
        attach(controller) {
            active = controller;
            return () => {
                if (active === controller)
                    active = null;
            };
        },
    };
}
/**
 * A collection footer that keeps product data controlled while the shared
 * controller prevents overlapping cursor requests.
 */
export const LoadMore = forwardRef(function LoadMore({ descriptor, mode = loadMoreRecipe.defaults.mode, density = loadMoreRecipe.defaults.density, onLoadMore, onRequestOutcome, onRequestError, intersectionRoot = null, rootMargin = "200px 0px", className, ...props }, ref) {
    validateLoadMoreDescriptor(descriptor);
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;
    const [controllerFacade] = useState(createLoadMoreControllerFacade);
    const controller = controllerFacade.facade;
    const sentinelRef = useRef(null);
    const currentRequestIdentityRef = useRef(null);
    const completedRequestIdentityRef = useRef(null);
    const currentRequestIdentity = descriptor.state.status === "ready" || descriptor.state.status === "error"
        ? `${descriptor.state.status}:${descriptor.state.requestKey}`
        : null;
    useLayoutEffect(() => {
        currentRequestIdentityRef.current = currentRequestIdentity;
    }, [currentRequestIdentity]);
    const request = useCallback(async (state, reason) => {
        if (state.status === "loading" || state.status === "complete")
            return;
        const requestIdentity = `${state.status}:${state.requestKey}`;
        // IntersectionObserver may deliver an already queued callback after
        // disconnect. Only events for the currently committed descriptor may
        // enter the shared request controller.
        if (currentRequestIdentityRef.current !== requestIdentity)
            return;
        // Once a request settles successfully, retire that exact state/key
        // until the product commits a new cursor or a retryable error state.
        if (completedRequestIdentityRef.current === requestIdentity)
            return;
        try {
            const outcome = await controller.request(state, reason);
            if (outcome === "started") {
                completedRequestIdentityRef.current = requestIdentity;
            }
            onRequestOutcome?.(outcome, reason);
        }
        catch (error) {
            onRequestError?.(error, reason);
        }
    }, [controller, onRequestError, onRequestOutcome]);
    useEffect(() => {
        const attached = createLoadMoreController({
            mode,
            onLoadMore: (nextRequest) => onLoadMoreRef.current(nextRequest),
        });
        const detach = controllerFacade.attach(attached);
        return () => {
            detach();
            attached.dispose();
        };
    }, [controllerFacade, mode]);
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
            if (entries.some((entry) => entry.isIntersecting)) {
                void request(descriptor.state, "viewport");
            }
        }, { root: intersectionRoot, rootMargin });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [descriptor.state, intersectionRoot, mode, request, rootMargin]);
    const { state, labels } = descriptor;
    return (_jsxs("div", { ...props, ref: ref, className: classNames("hjm-load-more", className), "data-mode": mode, "data-density": density, "data-state": state.status, "aria-busy": state.status === "loading" || undefined, children: [_jsx("span", { ref: sentinelRef, className: "hjm-load-more__sentinel", "aria-hidden": "true" }), state.status === "ready" ? (_jsx("button", { type: "button", className: "hjm-load-more__trigger", onClick: () => void request(state, "manual"), children: labels.loadMore })) : state.status === "loading" ? (_jsxs("div", { className: "hjm-load-more__status", role: "status", children: [_jsx("span", { className: "hjm-load-more__spinner", "aria-hidden": "true" }), labels.loading] })) : state.status === "error" ? (_jsxs("div", { className: "hjm-load-more__error", children: [_jsx("span", { role: "alert", children: state.message }), _jsx("button", { type: "button", className: "hjm-load-more__trigger", onClick: () => void request(state, "retry"), children: labels.retry })] })) : (_jsx("div", { className: "hjm-load-more__end", children: labels.complete }))] }));
});
//# sourceMappingURL=supplemental-navigation.js.map