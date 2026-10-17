import { type ContextMenuItemDescriptor } from "@hjmds/design-contracts/components/context-menu";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
/**
 * Platform-neutral item plus an optional decorative leading icon, matching Native
 * `NativeCanonicalContextMenuItem.icon` so one product menu renders the same on both (2026-10-17 parity review).
 * The icon inherits the item color (danger tone included) through `currentColor`.
 */
export type ContextMenuItem<Key extends string = string> = ContextMenuItemDescriptor<Key> & Readonly<{
    icon?: ReactNode;
}>;
export type ContextMenuProps<Key extends string = string> = Readonly<{
    /** The region the menu belongs to; right-click and long-press are bound here. */
    children: ReactNode;
    items: readonly ContextMenuItem<Key>[];
    accessibilityLabel: string;
    onAction: (id: Key) => void;
    className?: string;
    /** Canonical layout-only placement on the in-flow host; the menu popup itself is anchored, not placed. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function ContextMenu<Key extends string = string>({ children, items, accessibilityLabel, onAction, className, layoutStyle, }: ContextMenuProps<Key>): import("react").JSX.Element;
//# sourceMappingURL=context-menu.d.ts.map