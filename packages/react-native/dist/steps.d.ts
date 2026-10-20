import { type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor, type StepsStatusLabels } from "@hjmds/design-contracts/components/steps";
import type { ReactNode } from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type StepsProps<Id extends string = string> = Readonly<{
    descriptor: StepsDescriptor<Id>;
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
    renderMark?: (status: StepStatus, position: number) => ReactNode;
    /**
     * Return to a step before the cursor (2026-10-18, spint compose). Only those steps become buttons; the cursor and
     * later steps stay static in default linear mode. Free reading mode makes every step selectable.
     * Omit the handler while the flow is locked.
     */
    onStepPress?: (id: Id) => void;
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Linear steps preserving one cursor and reading order; steps before the cursor can be pressed to go back. */
export declare function Steps<Id extends string>({ descriptor, statusLabels, composeAccessibleName, renderMark, onStepPress, layoutStyle, }: StepsProps<Id>): import("react").JSX.Element;
//# sourceMappingURL=steps.d.ts.map