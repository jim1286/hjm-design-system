import { resolveBreadcrumbDescriptor, type BreadcrumbItemDescriptor } from "@hjmds/design-contracts/components/breadcrumb";
import { forwardRef, type ForwardedRef, type HTMLAttributes, type ReactElement, type ReactNode, type RefAttributes } from "react";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type BreadcrumbProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> &
  Readonly<{
    label: string;
    items: readonly BreadcrumbItemDescriptor<Id>[];
    separator?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function BreadcrumbInner<Id extends string>(
  {
    label,
    items,
    separator,
    className,
    layoutStyle,
    ...props
  }: BreadcrumbProps<Id>,
  ref: ForwardedRef<HTMLElement>,
) {
  if (label.trim().length === 0) throw new TypeError("Breadcrumb label must not be empty");
  const descriptor = resolveBreadcrumbDescriptor({ items });
  return (
    <nav
      {...props}
      style={{ ...props.style, ...layoutStyle }}
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
              <span className="hjm-breadcrumb__separator" aria-hidden="true" data-default={separator === undefined}>
                {separator === undefined ? "›" : separator}
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

