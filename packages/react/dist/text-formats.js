import { createElement, forwardRef } from "react";
import { classNames } from "./internal.js";
const elementFor = {
    kbd: "kbd",
    code: "code",
    quote: "blockquote",
};
/**
 * Each kind emits its own element, which is the entire point: `<kbd>`, `<code>`
 * and `<blockquote>` mean different things to assistive technology, and a
 * styled `<span>` means none of them.
 */
export const TextFormat = forwardRef(function TextFormat({ kind, children, className, ...props }, forwardedRef) {
    if (!Object.prototype.hasOwnProperty.call(elementFor, kind)) {
        throw new TypeError(`Unsupported TextFormat kind: ${String(kind)}`);
    }
    return createElement(elementFor[kind], {
        ...props,
        ref: forwardedRef,
        className: classNames("hjm-text-format", className),
        "data-kind": kind,
    }, children);
});
//# sourceMappingURL=text-formats.js.map