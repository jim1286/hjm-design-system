import { type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor, type StepsStatusLabels } from "@hjmds/design-contracts/components/steps";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type StepsProps<Id extends string = string> = Readonly<{
    descriptor: StepsDescriptor<Id>;
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
    /**
     * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
     * `stepsRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
     */
    style?: StyleProp<ViewStyle>;
}>;
/** Non-interactive linear steps preserving one cursor and reading order. */
export declare function Steps<Id extends string>({ descriptor, statusLabels, composeAccessibleName, renderMark, layoutStyle, style, }: StepsProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=steps.d.ts.map