import { type ToggleGroupDescriptor, type ToggleGroupSize } from "@hjmds/design-contracts/components/toggle-group";
import { type StyleProp, type ViewStyle } from "react-native";
export type ToggleGroupProps<Id extends string = string> = Readonly<{
    descriptor: ToggleGroupDescriptor<Id>;
    pressedIds?: ReadonlySet<Id>;
    defaultPressedIds?: ReadonlySet<Id>;
    onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
    size?: ToggleGroupSize;
    style?: StyleProp<ViewStyle>;
}>;
export declare function ToggleGroup<Id extends string = string>({ descriptor, pressedIds: controlledPressed, defaultPressedIds, onPressedIdsChange, size, style, }: ToggleGroupProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=toggle-group.d.ts.map