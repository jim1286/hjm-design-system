import { type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor, type StepsStatusLabels } from "@hjmds/design-contracts/components/steps";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type StepsProps<Id extends string = string> = Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
    descriptor: StepsDescriptor<Id>;
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Linear, read-only progress steps with one canonical cursor. */
export declare const Steps: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
    descriptor: Readonly<{
        steps: readonly Readonly<{
            id: string;
            label: string;
            description?: string;
        }>[];
        currentStepId: string;
        currentStepStatus?: import("@hjmds/design-contracts/components/steps").StepCursorStatus;
    }>;
    statusLabels: Readonly<{
        pending: string;
        current: string;
        complete: string;
        error: string;
    }>;
    composeAccessibleName: ComposeStepsAccessibleName;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLOListElement>>;
//# sourceMappingURL=steps.d.ts.map