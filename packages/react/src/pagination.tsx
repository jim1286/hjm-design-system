import { resolvePaginationDescriptor, type ComposePaginationAccessibleName, type PaginationChangeHandler, type PaginationDescriptor, type PaginationLabels } from "@hjmds/design-contracts/components/pagination";
import { forwardRef, type HTMLAttributes } from "react";
import { classNames } from "./internal.js";

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  Readonly<{
    label: string;
    descriptor: PaginationDescriptor;
    labels: PaginationLabels;
    composeAccessibleName: ComposePaginationAccessibleName;
    onPageChange: PaginationChangeHandler;
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
      ...props
    },
    ref,
  ) {
    if (label.trim().length === 0) throw new TypeError("Pagination label must not be empty");
    const resolved = resolvePaginationDescriptor(descriptor, {
      labels,
      composeAccessibleName,
    });
    // Preserve focus when a page change reaches a boundary; aria-disabled buttons
    // remain reachable but their activation is guarded below.
    return (
      <nav
        {...props}
        ref={ref}
        className={classNames("hjm-pagination", className)}
        aria-label={label}
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
