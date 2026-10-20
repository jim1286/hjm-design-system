import { type ReactNode } from "react";
import { chipRecipe } from "@hjmds/design-contracts/recipes";
import { type ShortcutRailItem } from "@hjmds/design-contracts/shortcut-rail";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ShortcutRailProps<Item extends ShortcutRailItem = ShortcutRailItem> = Readonly<{
    label: string;
    items: readonly Item[];
    onAction(item: NoInfer<Item>): void;
    /** Controls before the item list, in the same scroll/wrap flow. */
    leading?: ReactNode;
    layout?: "scroll" | "wrap";
    size?: keyof typeof chipRecipe.sizes;
    renderLeading?(item: NoInfer<Item>): ReactNode;
    layoutStyle?: HjmCompositionStyleProp;
    testID?: string;
}> & (Readonly<{
    onRemove(item: NoInfer<Item>): void;
    removeLabel(item: NoInfer<Item>): string;
    removeIcon?: ReactNode;
    isRemovable?(item: NoInfer<Item>): boolean;
}> | Readonly<{
    onRemove?: never;
    removeLabel?: never;
    removeIcon?: never;
    isRemovable?: never;
}>);
export declare function ShortcutRail<Item extends ShortcutRailItem>({ label, items, onAction, onRemove, removeLabel, removeIcon, isRemovable, leading, layout, size, renderLeading, layoutStyle, testID }: ShortcutRailProps<Item>): import("react").JSX.Element | null;
//# sourceMappingURL=shortcut-rail.d.ts.map