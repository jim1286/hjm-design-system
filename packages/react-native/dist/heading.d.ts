import { type HeadingDescriptor } from "@hjmds/design-contracts/components/heading";
import type { ReactNode } from "react";
import type { StyleProp, TextStyle } from "react-native";
export type HeadingProps = HeadingDescriptor & Readonly<{
    children: ReactNode;
    style?: StyleProp<TextStyle>;
}>;
export declare function Heading({ level, semanticLevel, children, style }: HeadingProps): import("react").JSX.Element;
//# sourceMappingURL=heading.d.ts.map