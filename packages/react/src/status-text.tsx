import { forwardRef } from "react";
import { Text, type TextProps } from "./layout.js";

/** A short inline result; use Notice for a titled message/action and Toast for transient overlays. */
export type StatusTextProps = Omit<TextProps, "children" | "role" | "aria-live" | "aria-atomic"> & Readonly<{
  children: string;
  announcement?: "none" | "polite" | "assertive";
}>;

export const StatusText = forwardRef<HTMLElement, StatusTextProps>(function StatusText(
  { children, announcement = "polite", ...props }, ref,
) {
  return <Text {...props} ref={ref}
    role={announcement === "none" ? undefined : announcement === "assertive" ? "alert" : "status"}
    aria-live={announcement === "none" ? "off" : announcement}
    aria-atomic={announcement === "none" ? undefined : true}
  >{children}</Text>;
});
