import { type ToggleGroupDescriptor, type ToggleGroupSize } from "@hjmds/design-contracts/components/toggle-group";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ToggleGroupProps<Id extends string = string> = Readonly<{
    descriptor: ToggleGroupDescriptor<Id>;
    pressedIds?: ReadonlySet<Id>;
    defaultPressedIds?: ReadonlySet<Id>;
    onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
    size?: ToggleGroupSize;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `toggleGroupRecipe` (`size`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
export declare function ToggleGroup<Id extends string = string>({ descriptor, pressedIds: controlledPressed, defaultPressedIds, onPressedIdsChange, size, layoutStyle, style, }: ToggleGroupProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=toggle-group.d.ts.map