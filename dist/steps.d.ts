/**
 * Ant Design Steps' full surface (navigation/clickable jump, dot type, custom
 * per-item icon, vertical orientation) is intentionally not reproduced. Both
 * known consumers (Yajalal onboarding, BurnTok sign-up) are single-cursor,
 * horizontal, back-button-driven wizards; see docs/steps.md for the per-axis
 * rationale.
 */
export type StepStatus = "pending" | "current" | "complete" | "error";
/** Only the cursor step can be "current" or "error"; every other step is derived. */
export type StepCursorStatus = Extract<StepStatus, "current" | "error">;
export type StepItemDescriptor<Id extends string = string> = Readonly<{
    id: Id;
    label: string;
    description?: string;
}>;
/**
 * A single stable cursor (`currentStepId`) is the source of truth instead of a
 * per-item status array, so "two current steps" or "a completed step past an
 * unresolved error" cannot be represented. Clickable jump is out of scope, so
 * the flow is always linear relative to the cursor.
 */
export type StepsDescriptor<Id extends string = string> = Readonly<{
    steps: readonly StepItemDescriptor<Id>[];
    currentStepId: Id;
    currentStepStatus?: StepCursorStatus;
}>;
export declare const stepsDefaults: {
    readonly currentStepStatus: "current";
};
export type StepsStatusLabels = Readonly<{
    pending: string;
    current: string;
    complete: string;
    error: string;
}>;
export type StepsAccessibleNameInfo = Readonly<{
    position: number;
    total: number;
    label: string;
}>;
/**
 * Products own the exact phrase order and counter-word grammar (Korean
 * "3단계 중 2단계" does not translate structurally to English "step 2 of 3"),
 * so the resolver invokes this composer instead of assembling copy itself.
 */
export type ComposeStepsAccessibleName = (info: StepsAccessibleNameInfo) => string;
export type ResolvedStepDescriptor<Id extends string = string> = StepItemDescriptor<Id> & Readonly<{
    status: StepStatus;
    /** 1-indexed so position and label both preserve reading order for renderers. */
    position: number;
    total: number;
    /** Primary accessible name: order + label. Never says status by itself. */
    accessibleName: string;
    /** Supplementary status announcement (Web aria-describedby text / RN accessibilityHint). */
    statusLabel: string;
}>;
export type ResolveStepsOptions = Readonly<{
    statusLabels: StepsStatusLabels;
    composeAccessibleName: ComposeStepsAccessibleName;
}>;
export declare function validateStepItemDescriptor<Id extends string>(step: StepItemDescriptor<Id>): void;
export declare function validateStepsDescriptor<Id extends string>(descriptor: StepsDescriptor<Id>): void;
export declare function validateStepsStatusLabels(labels: StepsStatusLabels): void;
/** A step is visually and semantically "reached" once it is no longer waiting. */
export declare function isStepReached(status: StepStatus): boolean;
/**
 * Derives every step's status from its position relative to the single
 * cursor, then attaches the order-preserving accessible name and the
 * supplementary status announcement. Throws on a malformed descriptor,
 * labels bag, or composer instead of silently rendering an inconsistent flow.
 */
export declare function resolveStepsDescriptor<Id extends string>(descriptor: StepsDescriptor<Id>, options: ResolveStepsOptions): readonly ResolvedStepDescriptor<Id>[];
export declare const stepsRecipe: {
    readonly slots: readonly ["root", "step", "indicator", "marker", "connector", "label", "description"];
    readonly gap: 8;
    readonly indicator: {
        readonly size: 24;
        readonly borderWidth: 1;
        readonly activeBorderWidth: 2;
        /** null means the renderer shows the step's own position number instead of a glyph. */
        readonly marks: {
            readonly pending: null;
            readonly current: null;
            readonly complete: "check";
            readonly error: "error";
        };
        readonly border: {
            readonly pending: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
            readonly current: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly complete: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly error: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly background: {
            readonly pending: null;
            readonly current: null;
            readonly complete: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly error: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
        readonly content: {
            readonly pending: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly current: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly complete: Readonly<{
                source: "accent";
                key: "success";
                alpha?: number;
            }>;
            readonly error: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly connector: {
        readonly height: 1;
        readonly tone: {
            readonly reached: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly unreached: Readonly<{
                source: "theme";
                key: "border";
                alpha?: number;
            }>;
        };
    };
    readonly label: {
        readonly textVariant: "label";
        readonly fontWeight: "600";
        readonly color: {
            readonly pending: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly current: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly complete: Readonly<{
                source: "theme";
                key: "text";
                alpha?: number;
            }>;
            readonly error: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
        };
    };
    readonly description: {
        readonly textVariant: "caption";
        readonly color: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
    };
};
//# sourceMappingURL=steps.d.ts.map