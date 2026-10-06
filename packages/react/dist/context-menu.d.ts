import { type ContextMenuItemDescriptor } from "@hjmds/design-contracts/components/context-menu";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ContextMenuProps<Key extends string = string> = Readonly<{
    /** The region the menu belongs to; right-click and long-press are bound here. */
    children: ReactNode;
    items: readonly ContextMenuItemDescriptor<Key>[];
    accessibilityLabel: string;
    onAction: (id: Key) => void;
    className?: string;
    /** Canonical layout-only placement on the in-flow host; the menu popup itself is anchored, not placed. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function ContextMenu<Key extends string = string>({ children, items, accessibilityLabel, onAction, className, layoutStyle, }: ContextMenuProps<Key>): import("react").JSX.Element;
//# sourceMappingURL=context-menu.d.ts.map