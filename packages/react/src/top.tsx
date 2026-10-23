"use client";

import {
  resolveTopTitle,
  topDefaults,
  topRecipe,
  type TopDescriptor,
} from "@hjmds/design-contracts/components/top";
import { forwardRef, createElement, type CSSProperties, type ReactNode } from "react";
import { classNames, useDesignProfileDefaults } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type TopProps = Readonly<{
  descriptor: TopDescriptor;
  /** Secondary action sharing the title row; drops below it when space runs out. */
  trailing?: ReactNode;
  className?: string;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export const Top = forwardRef<HTMLElement, TopProps>(function Top(
  { descriptor, trailing, className, layoutStyle },
  forwardedRef,
) {
  const resolvedTitle = resolveTopTitle(descriptor);
  const size = descriptor.size ?? topDefaults.size;
  const level = descriptor.headingLevel ?? topDefaults.headingLevel;
  const metrics = topRecipe.sizes[size];
  const profile = useDesignProfileDefaults();
  // Keep the visual role independent of the semantic heading level and preserve recipe defaults.
  const title = profile
    ? size === "large" ? profile.tokens.heading.level3 : profile.tokens.typography.titleLarge
    : metrics.title;
  return (
    <header
      ref={forwardedRef}
      className={classNames("hjm-top", className)}
      data-size={size}
      style={{ ...layoutStyle,
        "--hjm-top-title-size": `${title.fontSize}px`,
        "--hjm-top-title-line-height": `${title.lineHeight}px`,
        "--hjm-top-title-weight": title.fontWeight,
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
        {/*
          `titleLineBreaks="preserve"` keeps the product's `\n` with pre-line; the heading's name is computed from the
          same text with whitespace normalized, so it stays one sentence for assistive tech.
        */}
        {createElement(`h${level}`, { className: "hjm-top__title", "data-line-breaks": resolvedTitle.lines.length > 1 ? "preserve" : undefined }, resolvedTitle.text)}
        {trailing ? <div className="hjm-top__trailing">{trailing}</div> : null}
      </div>
      {descriptor.description ? <p className="hjm-top__description">{descriptor.description}</p> : null}
    </header>
  );
});
