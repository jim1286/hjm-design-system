import { forwardRef } from "react";
import { Text, type TextProps } from "./layout.js";

/** A short inline result; use Notice for a titled message/action and Toast for transient overlays. */
export type StatusTextProps = Omit<TextProps, "children" | "role" | "aria-live" | "aria-atomic"> & Readonly<{
  children: string;
  announcement?: "none" | "polite" | "assertive";
}>;

export const StatusText = forwardRef<HTMLElement, StatusTextProps>(function StatusText(
  { children, announcement = "polite", className, ...props }, ref,
) {
  // The live node must stay mounted to announce later results, but an empty one would still take a
  // flex/grid slot and add a stack gap (Native renders nothing then), so it leaves layout while empty.
  const hidden = children === "" ? "hjm-visually-hidden" : undefined;
  return <Text {...props} ref={ref} className={[className, hidden].filter(Boolean).join(" ") || undefined}
    role={announcement === "none" ? undefined : announcement === "assertive" ? "alert" : "status"}
    aria-live={announcement === "none" ? "off" : announcement}
    aria-atomic={announcement === "none" ? undefined : true}
  >{children}</Text>;
});
