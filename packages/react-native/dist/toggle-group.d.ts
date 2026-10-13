import { type ToggleGroupDescriptor, type ToggleGroupSize } from "@hjmds/design-contracts/components/toggle-group";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ToggleGroupProps<Id extends string = string> = Readonly<{
    descriptor: ToggleGroupDescriptor<Id>;
    pressedIds?: ReadonlySet<Id>;
    defaultPressedIds?: ReadonlySet<Id>;
    onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
    size?: ToggleGroupSize;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare function ToggleGroup<Id extends string = string>({ descriptor, pressedIds: controlledPressed, defaultPressedIds, onPressedIdsChange, size, layoutStyle, }: ToggleGroupProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=toggle-group.d.ts.map