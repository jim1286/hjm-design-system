import type { TextFormatKind } from "@hjmds/design-contracts/components/text-formats";
import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "./internal.js";

export type TextFormatProps = HTMLAttributes<HTMLElement> &
  Readonly<{
    kind: TextFormatKind;
    children: ReactNode;
  }>;

const elementFor: Readonly<Record<TextFormatKind, string>> = {
  kbd: "kbd",
  code: "code",
  quote: "blockquote",
};

/**
 * Each kind emits its own element, which is the entire point: `<kbd>`, `<code>`
 * and `<blockquote>` mean different things to assistive technology, and a
 * styled `<span>` means none of them.
 */
export const TextFormat = forwardRef<HTMLElement, TextFormatProps>(function TextFormat(
  { kind, children, className, ...props },
  forwardedRef,
) {
  if (!Object.prototype.hasOwnProperty.call(elementFor, kind)) {
    throw new TypeError(`Unsupported TextFormat kind: ${String(kind)}`);
  }
  return createElement(
    elementFor[kind],
    {
      ...props,
      ref: forwardedRef,
      className: classNames("hjm-text-format", className),
      "data-kind": kind,
    },
    children,
  );
});
