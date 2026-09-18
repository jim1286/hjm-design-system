import {
  headingRecipe,
  resolveHeadingSemanticLevel,
  validateHeadingDescriptor,
  type HeadingDescriptor,
} from "@hjmds/design-contracts/components/heading";
import {
  createElement,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";

export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> &
  HeadingDescriptor &
  Readonly<{ children: ReactNode }>;

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level, semanticLevel, children, className, ...props },
  forwardedRef,
) {
  const descriptor: HeadingDescriptor = {
    level,
    ...(semanticLevel === undefined ? {} : { semanticLevel }),
  };
  validateHeadingDescriptor(descriptor);
  const metrics = headingRecipe.levels[level];
  // Visual size and document level are separate axes: the element comes from
  // the semantic level, the type comes from the visual one.
  return createElement(
    `h${resolveHeadingSemanticLevel(descriptor)}`,
    {
      ...props,
      ref: forwardedRef,
      className: classNames("hjm-heading", className),
      "data-level": level,
      style: {
        "--hjm-heading-size": `${metrics.fontSize}px`,
        "--hjm-heading-line-height": `${metrics.lineHeight}px`,
        "--hjm-heading-weight": metrics.fontWeight,
      } as CSSProperties,
    },
    children,
  );
});
