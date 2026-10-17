import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import type { IconButtonEdge } from "@hjmds/design-contracts/recipes";
export type NotificationBellProps = Readonly<{
    label: string;
    count: number;
    icon: ReactNode;
    onPress: () => void;
    disabled?: boolean;
    active?: boolean;
    /** Container edge(s) the bell sits on, as IconButton `edge`: its glyph slot lands on the container inset (top-bar end). */
    edge?: IconButtonEdge;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. `width` is ignored: the badge is anchored to the icon's edge. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function NotificationBell({ label, count, icon, onPress, disabled, active, edge, layoutStyle }: NotificationBellProps): import("react").JSX.Element;
//# sourceMappingURL=notification-bell.d.ts.map