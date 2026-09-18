import {
  topDefaults,
  topRecipe,
  validateTopDescriptor,
  type TopDescriptor,
} from "@hjmds/design-contracts/components/top";
import { forwardRef, createElement, type CSSProperties, type ReactNode } from "react";
import { classNames } from "./internal.js";

export type TopProps = Readonly<{
  descriptor: TopDescriptor;
  /** Secondary action sharing the title row; drops below it when space runs out. */
  trailing?: ReactNode;
  className?: string;
}>;

export const Top = forwardRef<HTMLElement, TopProps>(function Top(
  { descriptor, trailing, className },
  forwardedRef,
) {
  validateTopDescriptor(descriptor);
  const size = descriptor.size ?? topDefaults.size;
  const level = descriptor.headingLevel ?? topDefaults.headingLevel;
  const metrics = topRecipe.sizes[size];
  return (
    <header
      ref={forwardedRef}
      className={classNames("hjm-top", className)}
      data-size={size}
      style={{
        "--hjm-top-title-size": `${metrics.title.fontSize}px`,
        "--hjm-top-title-line-height": `${metrics.title.lineHeight}px`,
        "--hjm-top-title-weight": metrics.title.fontWeight,
        "--hjm-top-padding-top": `${metrics.paddingTop}px`,
        "--hjm-top-padding-bottom": `${metrics.paddingBottom}px`,
      } as CSSProperties}
    >
      {descriptor.eyebrow ? <p className="hjm-top__eyebrow">{descriptor.eyebrow}</p> : null}
      <div className="hjm-top__row">
        {/*
          A real heading element at the declared level, not styled text: this
          block is what a screen reader lands on when it skips to the content.
        */}
        {createElement(`h${level}`, { className: "hjm-top__title" }, descriptor.title)}
        {trailing ? <div className="hjm-top__trailing">{trailing}</div> : null}
      </div>
      {descriptor.description ? <p className="hjm-top__description">{descriptor.description}</p> : null}
    </header>
  );
});
