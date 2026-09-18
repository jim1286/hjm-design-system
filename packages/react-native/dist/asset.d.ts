import { type AssetDescriptor } from "@hjmds/design-contracts/components/asset";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type AssetProps = Readonly<{
    descriptor: AssetDescriptor;
    /**
     * The media itself. A Lottie or video player is the product's dependency;
     * `animate` is the already-resolved answer to "may this move right now".
     */
    children: ReactNode | ((state: Readonly<{
        animate: boolean;
    }>) => ReactNode);
    /** A small mark on the frame's outer corner (play, status dot). */
    accessory?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Asset({ descriptor, children, accessory, style }: AssetProps): import("react").JSX.Element;
export type AssetGroupProps = Readonly<{
    /** Accessible name for the group; the overlap alone does not say what it is. */
    label: string;
    size?: AssetDescriptor["size"];
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
/** Overlaps assets with the same ratio Avatar uses — they share a row on purpose. */
export declare function AssetGroup({ label, size, children, style }: AssetGroupProps): import("react").JSX.Element;
//# sourceMappingURL=asset.d.ts.map