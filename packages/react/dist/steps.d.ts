import { type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor, type StepsPresentation, type StepsStatusLabels } from "@hjmds/design-contracts/components/steps";
import { type HTMLAttributes, type ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type StepsProps<Id extends string = string> = Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
    descriptor: StepsDescriptor<Id>;
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
    /** Focus rail is the default; compact reveals its overview, vertical expands the cursor's content. */
    presentation?: StepsPresentation;
    /** Required localized toggle label for compact presentation. */
    overviewLabel?: string;
    /** Vertical-only content slot. Products keep drafts outside this unmounted step content. */
    renderStepContent?: (id: Id) => ReactNode;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    /** Backward-only in linear forms; free reading permits any step. Omit while locked. */
    onStepPress?: (id: Id) => void;
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Presentation never changes the shared single-cursor state or validation/navigation policy. */
export declare const Steps: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
    descriptor: Readonly<{
        steps: readonly Readonly<{
            id: string;
            label: string;
            description?: string;
        }>[];
        currentStepId: string;
        currentStepStatus?: import("@hjmds/design-contracts/components/steps").StepCursorStatus;
        navigationMode?: "linear" | "free";
    }>;
    statusLabels: Readonly<{
        pending: string;
        current: string;
        complete: string;
        error: string;
    }>;
    composeAccessibleName: ComposeStepsAccessibleName;
    /** Focus rail is the default; compact reveals its overview, vertical expands the cursor's content. */
    presentation?: StepsPresentation;
    /** Required localized toggle label for compact presentation. */
    overviewLabel?: string;
    /** Vertical-only content slot. Products keep drafts outside this unmounted step content. */
    renderStepContent?: (id: string) => ReactNode;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    /** Backward-only in linear forms; free reading permits any step. Omit while locked. */
    onStepPress?: (id: string) => void;
    layoutStyle?: HjmCompositionStyleProp;
}> & import("react").RefAttributes<HTMLOListElement>>;
//# sourceMappingURL=steps.d.ts.map