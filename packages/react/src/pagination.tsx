import { resolvePaginationDescriptor, type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from "@hjmds/design-contracts/components/pagination";
import { forwardRef, useLayoutEffect, useRef, type HTMLAttributes } from "react";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      label,
      descriptor,
      labels,
      composeAccessibleName,
      onPageChange,
      className,
      layoutStyle,
      onFocusCapture,
      onBlurCapture,
      ...props
    },
    ref,
  ) {
    if (label.trim().length === 0) throw new TypeError("Pagination label must not be empty");
    const resolved = resolvePaginationDescriptor(descriptor, {
      labels,
      composeAccessibleName,
    });
    const focusedButton = useRef<HTMLElement | null>(null);
    const currentButton = useRef<HTMLButtonElement>(null);
    useLayoutEffect(() => {
      // A smaller result set or moved page window can remove the focused numbered button.
      if (focusedButton.current && !focusedButton.current.isConnected && document.activeElement === document.body) {
        currentButton.current?.focus();
      }
    });
    // Preserve focus when a page change reaches a boundary; aria-disabled buttons
    // remain reachable but their activation is guarded below.
    return (
      <nav
        {...props}
        style={{ ...props.style, ...layoutStyle }}
        ref={ref}
        className={classNames("hjm-pagination", className)}
        aria-label={label}
        onFocusCapture={(event) => { focusedButton.current = event.target; onFocusCapture?.(event); }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) focusedButton.current = null;
          onBlurCapture?.(event);
        }}
      >
        <ul className="hjm-pagination__list">
          <li>
            <button
              type="button"
              className="hjm-pagination__item hjm-pagination__previous"
              aria-label={resolved.labels.previous}
              aria-disabled={!resolved.hasPrevious || undefined}
              onClick={() => { if (resolved.hasPrevious) onPageChange(resolved.currentPage - 1, "previous"); }}
            >
              <span aria-hidden="true">‹</span>
            </button>
          </li>
          {resolved.items.map((item, index) =>
            item.type === "ellipsis" ? (
              <li key={`ellipsis-${index}`}>
                <span className="hjm-pagination__ellipsis" aria-hidden="true">…</span>
              </li>
            ) : (
              <li key={item.page}>
                <button
                  type="button"
                  className="hjm-pagination__item"
                  ref={item.current ? currentButton : undefined}
                  data-state={item.current ? "current" : "idle"}
                  aria-current={item.current ? "page" : undefined}
                  aria-label={item.accessibleName}
                  onClick={() => {
                    if (!item.current) onPageChange(item.page, "page");
                  }}
                >
                  {item.page}
                </button>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              className="hjm-pagination__item hjm-pagination__next"
              aria-label={resolved.labels.next}
              aria-disabled={!resolved.hasNext || undefined}
              onClick={() => { if (resolved.hasNext) onPageChange(resolved.currentPage + 1, "next"); }}
            >
              <span aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  },
);
