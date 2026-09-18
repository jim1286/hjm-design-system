import { type BottomInfoDescriptor } from "@hjmds/design-contracts/components/bottom-info";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type BottomInfoProps = BottomInfoDescriptor & Readonly<{
    renderItem?: (item: string, index: number) => ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function BottomInfo({ items, tone, renderItem, style }: BottomInfoProps): import("react").JSX.Element;
//# sourceMappingURL=bottom-info.d.ts.map