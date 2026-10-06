import { type ToggleGroupDescriptor, type ToggleGroupSize } from "@hjmds/design-contracts/components/toggle-group";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type ToggleGroupProps<Id extends string = string> = Readonly<{
    descriptor: ToggleGroupDescriptor<Id>;
    pressedIds?: ReadonlySet<Id>;
    defaultPressedIds?: ReadonlySet<Id>;
    onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
    size?: ToggleGroupSize;
    className?: string;
    /** Canonical layout-only placement on the root group. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
export declare const ToggleGroup: <Id extends string = string>(props: ToggleGroupProps<Id> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=toggle-group.d.ts.map