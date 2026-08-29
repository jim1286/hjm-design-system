import {
  resolveBreadcrumbDescriptor,
  type BreadcrumbItemDescriptor,
} from "@hjmds/design-contracts/components/breadcrumb";
import {
  resolvePaginationDescriptor,
  type ComposePaginationAccessibleName,
  type PaginationChangeHandler,
  type PaginationDescriptor,
  type PaginationLabels,
} from "@hjmds/design-contracts/components/pagination";
import {
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { classNames } from "./internal.js";

export type BreadcrumbProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> &
  Readonly<{
    label: string;
    items: readonly BreadcrumbItemDescriptor<Id>[];
    separator?: ReactNode;
  }>;

function BreadcrumbInner<Id extends string>(
  {
    label,
    items,
    separator = "›",
    className,
    ...props
  }: BreadcrumbProps<Id>,
  ref: ForwardedRef<HTMLElement>,
) {
  if (label.trim().length === 0) throw new TypeError("Breadcrumb label must not be empty");
  const descriptor = resolveBreadcrumbDescriptor({ items });
  return (
    <nav
      {...props}
      ref={ref}
      className={classNames("hjm-breadcrumb", className)}
      aria-label={label}
    >
      <ol className="hjm-breadcrumb__list">
        {descriptor.items.map((item, index) => (
          <li key={item.id} className="hjm-breadcrumb__item">
            {item.current ? (
              <span className="hjm-breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                className="hjm-breadcrumb__link"
                href={item.destination.href}
                data-destination={item.destination.kind}
              >
                {item.label}
              </a>
            )}
            {index < descriptor.items.length - 1 ? (
              <span className="hjm-breadcrumb__separator" aria-hidden="true">
                {separator}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const Breadcrumb = forwardRef(BreadcrumbInner) as <Id extends string = string>(
  props: BreadcrumbProps<Id> & RefAttributes<HTMLElement>,
) => ReactElement;

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
              disabled={!resolved.hasPrevious}
              onClick={() => onPageChange(resolved.currentPage - 1, "previous")}
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
              disabled={!resolved.hasNext}
              onClick={() => onPageChange(resolved.currentPage + 1, "next")}
            >
              <span aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  },
);
