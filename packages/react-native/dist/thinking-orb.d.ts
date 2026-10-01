import { type StyleProp, type ViewStyle } from "react-native";
import { type ThinkingOrbOptions } from "@hjmds/design-contracts/components/thinking-orb";
export type ThinkingOrbProps = ThinkingOrbOptions & Readonly<{
    style?: StyleProp<ViewStyle>;
    testID?: string;
}>;
/** Skia is isolated to this entry; hosts must forward navigation/list visibility via active. */
export declare function ThinkingOrb({ state, appearance, size, label, speed, paused, active, style, testID }: ThinkingOrbProps): import("react").JSX.Element;
//# sourceMappingURL=thinking-orb.d.ts.map