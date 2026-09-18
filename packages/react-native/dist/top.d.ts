import { type TopDescriptor } from "@hjmds/design-contracts/components/top";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type TopProps = Readonly<{
    descriptor: TopDescriptor;
    /** Secondary action sharing the title row; stacks below it at large text. */
    trailing?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Top({ descriptor, trailing, style }: TopProps): import("react").JSX.Element;
//# sourceMappingURL=top.d.ts.map