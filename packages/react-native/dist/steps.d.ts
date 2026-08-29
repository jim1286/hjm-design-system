import { type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor, type StepsStatusLabels } from "@hjmds/design-contracts/components/steps";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type StepsProps<Id extends string = string> = Readonly<{
    descriptor: StepsDescriptor<Id>;
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
/** Non-interactive linear steps preserving one cursor and reading order. */
export declare function Steps<Id extends string>({ descriptor, statusLabels, composeAccessibleName, renderMark, style, }: StepsProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=steps.d.ts.map