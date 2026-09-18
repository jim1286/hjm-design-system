import { type CollapsibleOpenState } from "@hjmds/design-contracts/components/collapsible";
import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type CollapsibleProps = CollapsibleOpenState & Readonly<{
    /** The control's label; it also tells the user what will appear. */
    trigger: ReactNode;
    children: ReactNode;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Collapsible({ trigger, children, disabled, style, ...openState }: CollapsibleProps): import("react").JSX.Element;
//# sourceMappingURL=collapsible.d.ts.map