import type { ComponentRef } from "react";
import { forwardRef } from "react";
import { type Text as NativeText } from "react-native";
import { type TextProps } from "./primitives.js";
import type { AnnouncementMode } from "./feedback.js";
/** Inline state/result copy; no panel, action, dismissal, or notification queue is created. */
export type StatusTextProps = Omit<TextProps, "children" | "accessibilityLiveRegion" | "aria-live"> & Readonly<{
    children: string;
    announcement?: AnnouncementMode;
    /** iOS: opt in for a conditionally mounted result. Persistent initial hints stay quiet. */
    announceOnMount?: boolean;
}>;
export declare const StatusText: ReturnType<typeof forwardRef<ComponentRef<typeof NativeText>, StatusTextProps>>;
//# sourceMappingURL=status-text.d.ts.map