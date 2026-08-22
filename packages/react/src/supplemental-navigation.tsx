import {
  createLoadMoreController,
  validateLoadMoreDescriptor,
  type LoadMoreController,
  type LoadMoreControllerSnapshot,
  type LoadMoreDescriptor,
  type LoadMoreMode,
  type LoadMoreRequestHandler,
  type LoadMoreRequestOutcome,
  type LoadMoreRequestReason,
} from "@hjm/design-contracts/components/load-more";
import {
  loadMoreRecipe,
  type LoadMoreDensity,
} from "@hjm/design-contracts/recipes";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { classNames } from "./internal.js";

function createLoadMoreControllerFacade(): Readonly<{
  facade: LoadMoreController;
  attach(controller: LoadMoreController): () => void;
}> {
  const detachedSnapshot: LoadMoreControllerSnapshot = {
    mode: "automatic",
    inFlightRequestKey: null,
    disposed: true,
  };
  let active: LoadMoreController | null = null;
  return {
    facade: {
      getSnapshot: () => active?.getSnapshot() ?? detachedSnapshot,
      request: (state, reason) => {
        if (!active) throw new Error("Cannot use a detached LoadMore controller");
        return active.request(state, reason);
      },
      dispose: () => active?.dispose() ?? false,
    },
    attach(controller) {
      active = controller;
      return () => {
        if (active === controller) active = null;
      };
    },
  };
}

export type LoadMoreProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  Readonly<{
    descriptor: LoadMoreDescriptor;
    mode?: LoadMoreMode;
    density?: LoadMoreDensity;
    onLoadMore: LoadMoreRequestHandler;
    onRequestOutcome?: (
      outcome: LoadMoreRequestOutcome,
      reason: LoadMoreRequestReason,
    ) => void;
    onRequestError?: (error: unknown, reason: LoadMoreRequestReason) => void;
    intersectionRoot?: Element | Document | null;
    rootMargin?: string;
  }>;

/**
 * A collection footer that keeps product data controlled while the shared
 * controller prevents overlapping cursor requests.
 */
export const LoadMore = forwardRef<HTMLDivElement, LoadMoreProps>(
  function LoadMore(
    {
      descriptor,
      mode = loadMoreRecipe.defaults.mode,
      density = loadMoreRecipe.defaults.density,
      onLoadMore,
      onRequestOutcome,
      onRequestError,
      intersectionRoot = null,
      rootMargin = "200px 0px",
      className,
      ...props
    },
    ref,
  ) {
    validateLoadMoreDescriptor(descriptor);
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;
    const [controllerFacade] = useState(createLoadMoreControllerFacade);
    const controller = controllerFacade.facade;
    const sentinelRef = useRef<HTMLSpanElement>(null);
    const currentRequestIdentityRef = useRef<string | null>(null);
    const completedRequestIdentityRef = useRef<string | null>(null);
    const currentRequestIdentity =
      descriptor.state.status === "ready" || descriptor.state.status === "error"
        ? `${descriptor.state.status}:${descriptor.state.requestKey}`
        : null;

    useLayoutEffect(() => {
      currentRequestIdentityRef.current = currentRequestIdentity;
    }, [currentRequestIdentity]);

    const request = useCallback(
      async (
        state: LoadMoreDescriptor["state"],
        reason: LoadMoreRequestReason,
      ) => {
        if (state.status === "loading" || state.status === "complete") return;
        const requestIdentity = `${state.status}:${state.requestKey}`;
        // IntersectionObserver may deliver an already queued callback after
        // disconnect. Only events for the currently committed descriptor may
        // enter the shared request controller.
        if (currentRequestIdentityRef.current !== requestIdentity) return;
        // Once a request settles successfully, retire that exact state/key
        // until the product commits a new cursor or a retryable error state.
        if (completedRequestIdentityRef.current === requestIdentity) return;
        try {
          const outcome = await controller.request(state, reason);
          if (outcome === "started") {
            completedRequestIdentityRef.current = requestIdentity;
          }
          onRequestOutcome?.(outcome, reason);
        } catch (error) {
          onRequestError?.(error, reason);
        }
      },
      [controller, onRequestError, onRequestOutcome],
    );

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
      if (
        mode !== "automatic" ||
        descriptor.state.status !== "ready" ||
        typeof IntersectionObserver === "undefined"
      ) {
        return;
      }
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            void request(descriptor.state, "viewport");
          }
        },
        { root: intersectionRoot, rootMargin },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [descriptor.state, intersectionRoot, mode, request, rootMargin]);

    const { state, labels } = descriptor;
    return (
      <div
        {...props}
        ref={ref}
        className={classNames("hjm-load-more", className)}
        data-mode={mode}
        data-density={density}
        data-state={state.status}
        aria-busy={state.status === "loading" || undefined}
      >
        <span ref={sentinelRef} className="hjm-load-more__sentinel" aria-hidden="true" />
        {state.status === "ready" ? (
          <button
            type="button"
            className="hjm-load-more__trigger"
            onClick={() => void request(state, "manual")}
          >
            {labels.loadMore}
          </button>
        ) : state.status === "loading" ? (
          <div className="hjm-load-more__status" role="status">
            <span className="hjm-load-more__spinner" aria-hidden="true" />
            {labels.loading}
          </div>
        ) : state.status === "error" ? (
          <div className="hjm-load-more__error">
            <span role="alert">{state.message}</span>
            <button
              type="button"
              className="hjm-load-more__trigger"
              onClick={() => void request(state, "retry")}
            >
              {labels.retry}
            </button>
          </div>
        ) : (
          <div className="hjm-load-more__end">{labels.complete}</div>
        )}
      </div>
    );
  },
);
