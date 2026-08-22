import {
  createLoadMoreController,
  validateLoadMoreDescriptor,
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
  useMemo,
  useRef,
  type HTMLAttributes,
} from "react";
import { classNames } from "./internal.js";

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
    const controller = useMemo(
      () => createLoadMoreController({ mode, onLoadMore: (request) => onLoadMoreRef.current(request) }),
      [mode],
    );
    const sentinelRef = useRef<HTMLSpanElement>(null);
    const request = useCallback(
      async (reason: LoadMoreRequestReason) => {
        try {
          const outcome = await controller.request(descriptor.state, reason);
          onRequestOutcome?.(outcome, reason);
        } catch (error) {
          onRequestError?.(error, reason);
        }
      },
      [controller, descriptor.state, onRequestError, onRequestOutcome],
    );

    useEffect(() => () => {
      controller.dispose();
    }, [controller]);

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
          if (entries.some((entry) => entry.isIntersecting)) void request("viewport");
        },
        { root: intersectionRoot, rootMargin },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [descriptor.state.status, intersectionRoot, mode, request, rootMargin]);

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
            onClick={() => void request("manual")}
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
              onClick={() => void request("retry")}
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
