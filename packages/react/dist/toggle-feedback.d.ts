import { type ReactNode } from "react";
import { type ToggleFeedbackEffect, type ToggleFeedbackState } from "@hjmds/design-contracts/toggle-feedback";
export type ToggleFeedbackButtonProps = Readonly<{
    entityId: string;
    state: ToggleFeedbackState;
    effect: ToggleFeedbackEffect;
    locale: string;
    icon?: ReactNode;
    renderIcon?: (state: Readonly<{
        selected: boolean;
        pending: boolean;
    }>) => ReactNode;
    labels: Readonly<{
        select: string;
        selected: string;
        pending: string;
        count: string;
        error: string;
    }>;
    /** Update confirmed state from the real API snapshot before resolving. */
    onSelectedChange: (selected: boolean) => void | Promise<void>;
    disabled?: boolean;
    active?: boolean;
}>;
export declare function ToggleFeedbackButton(props: ToggleFeedbackButtonProps): import("react").JSX.Element;
//# sourceMappingURL=toggle-feedback.d.ts.map