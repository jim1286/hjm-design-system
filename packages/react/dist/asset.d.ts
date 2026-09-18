import { type AssetDescriptor } from "@hjmds/design-contracts/components/asset";
import { type ReactNode } from "react";
export type AssetProps = Readonly<{
    descriptor: AssetDescriptor;
    /**
     * The media itself. A player is the product's dependency, never this
     * package's — the frame is all the contract owns. `animate` is the
     * already-resolved answer to "may this move right now".
     */
    children: ReactNode | ((state: Readonly<{
        animate: boolean;
    }>) => ReactNode);
    /** A small mark on the frame's outer corner (play, status dot). */
    accessory?: ReactNode;
    className?: string;
}>;
export declare const Asset: import("react").ForwardRefExoticComponent<Readonly<{
    descriptor: AssetDescriptor;
    /**
     * The media itself. A player is the product's dependency, never this
     * package's — the frame is all the contract owns. `animate` is the
     * already-resolved answer to "may this move right now".
     */
    children: ReactNode | ((state: Readonly<{
        animate: boolean;
    }>) => ReactNode);
    /** A small mark on the frame's outer corner (play, status dot). */
    accessory?: ReactNode;
    className?: string;
}> & import("react").RefAttributes<HTMLDivElement>>;
export type AssetGroupProps = Readonly<{
    /** Accessible name for the group; the overlap alone does not say what it is. */
    label: string;
    size?: AssetDescriptor["size"];
    children: ReactNode;
    className?: string;
}>;
/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export declare function AssetGroup({ label, size, children, className }: AssetGroupProps): import("react").JSX.Element;
//# sourceMappingURL=asset.d.ts.map