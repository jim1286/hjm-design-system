import { type CommandPaletteActivateHandler, type CommandPaletteDescriptor, type CommandPaletteDismissPolicy, type CommandPaletteOpenChangeDetails, type CommandPaletteQueryState, type CommandPaletteSource } from "@hjmds/design-contracts/components/command-palette";
import { type ReactNode } from "react";
import { type OverlayTrigger } from "./modal.js";
export type CommandPaletteProps<Key extends string = string> = Readonly<{
    descriptor: CommandPaletteDescriptor;
    source: CommandPaletteSource<Key, string>;
    query: string;
    onQueryChange: (query: string) => void;
    onActivate: CommandPaletteActivateHandler<Key>;
    /** Runs after the palette is gone, for a command that opens the next surface. */
    onActivateAfterDismiss?: CommandPaletteActivateHandler<Key>;
    queryState?: CommandPaletteQueryState;
    dismissPolicy?: Partial<CommandPaletteDismissPolicy>;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: CommandPaletteOpenChangeDetails) => void;
    trigger?: OverlayTrigger;
    renderLeading?: (itemId: Key) => ReactNode;
    portalContainer?: HTMLElement;
    className?: string;
}>;
export declare const CommandPalette: <Key extends string = string>(props: CommandPaletteProps<Key> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=command-palette.d.ts.map