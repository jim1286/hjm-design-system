import { type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor, type StepsPresentation, type StepsStatusLabels } from "@hjmds/design-contracts/components/steps";
import { type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type StepsProps<Id extends string = string> = Readonly<{
    descriptor: StepsDescriptor<Id>;
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
    presentation?: StepsPresentation;
    /** Required localized toggle label for compact presentation. */
    overviewLabel?: string;
    /** Vertical-only slot. Keep drafts in the product's controlled state. */
    renderStepContent?: (id: Id) => ReactNode;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    onStepPress?: (id: Id) => void;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** All presentations share one resolver: changing the layout never skips form validation. */
export declare function Steps<Id extends string>({ descriptor, statusLabels, composeAccessibleName, presentation, overviewLabel, renderStepContent, renderMark, onStepPress, layoutStyle }: StepsProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=steps.d.ts.map