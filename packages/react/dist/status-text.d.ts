import { type TextProps } from "./layout.js";
/** A short inline result; use Notice for a titled message/action and Toast for transient overlays. */
export type StatusTextProps = Omit<TextProps, "children" | "role" | "aria-live" | "aria-atomic"> & Readonly<{
    children: string;
    announcement?: "none" | "polite" | "assertive";
}>;
export declare const StatusText: import("react").ForwardRefExoticComponent<Omit<TextProps, "children" | "role" | "aria-atomic" | "aria-live"> & Readonly<{
    children: string;
    announcement?: "none" | "polite" | "assertive";
}> & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=status-text.d.ts.map