import { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type EffectSurfaceDescriptor } from "@hjmds/design-contracts/effect-surface";
export type EffectSurfaceProps = Readonly<{
    descriptor?: EffectSurfaceDescriptor;
    children: ReactNode;
    style?: StyleProp<ViewStyle>; /** Host screen/list visibility; false freezes decoration. */
    visible?: boolean;
}>;
export declare function EffectSurface({ descriptor, children, style, visible }: EffectSurfaceProps): import("react").JSX.Element;
//# sourceMappingURL=effect-surface.d.ts.map