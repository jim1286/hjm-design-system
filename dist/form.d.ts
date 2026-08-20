/**
 * Form owns two things only: the vertical rhythm between already-framed
 * Fields, and the repeatable submit session (idle → submitting →
 * succeeded/failed). Field values, registration, dependencies, validateTrigger
 * policy and Form.List-style repeating groups stay product-owned (React Hook
 * Form or equivalent) — see docs/form.md for the full boundary.
 */
export type FormSubmitStatus = "idle" | "submitting" | "succeeded" | "failed";
export type FormSubmitPhase = Readonly<{
    status: "idle";
}> | Readonly<{
    status: "submitting";
}> | Readonly<{
    status: "succeeded";
}> | Readonly<{
    status: "failed";
    message: string;
}>;
export type FormSubmitOutcome = Readonly<{
    outcome: "succeeded";
}> | Readonly<{
    outcome: "failed";
    message: string;
}> | Readonly<{
    outcome: "blocked";
    reason: "already-submitting";
}> | Readonly<{
    outcome: "interrupted";
}>;
/** Rejects to report a submission failure; resolving never implies success. */
export type FormSubmitHandler<Values> = (values: Values) => void | Promise<void>;
export type FormSubmitSessionOptions<Values> = Readonly<{
    onSubmit: FormSubmitHandler<Values>;
    /** Localized fallback shown when `resolveErrorMessage` is absent, throws, or returns empty copy. */
    fallbackErrorMessage: string;
    resolveErrorMessage?: (error: unknown) => string;
}>;
/**
 * A single submit session is reused across many attempts — unlike
 * AlertDialog's one-shot confirm, a form typically stays mounted and gets
 * resubmitted (edit → retry, or a settings screen saved again later). Each
 * attempt still settles its own returned Promise exactly once, and
 * `submitting` blocks every concurrent attempt the same way AlertDialog's
 * `busy` blocks a second confirm.
 */
export type FormSubmitSession<Values> = Readonly<{
    getSnapshot(): FormSubmitPhase;
    subscribe(listener: () => void): () => void;
    submit(values: Values): Promise<FormSubmitOutcome>;
    /** Moves a resting `succeeded`/`failed` phase back to `idle`. No-op while submitting. */
    reset(): boolean;
    dispose(): boolean;
}>;
export declare function validateFormSubmitSessionOptions<Values>(options: FormSubmitSessionOptions<Values>): void;
/**
 * Owns submit re-entrancy and exactly-once settlement. Does not own field
 * values (the caller passes `values` at call time), field-level validation,
 * or when submission is allowed to start (the product decides that from its
 * own dirty/valid state before calling `submit`).
 */
export declare function createFormSubmitSession<Values>(options: FormSubmitSessionOptions<Values>): FormSubmitSession<Values>;
/**
 * Form does not register fields or run validation, so it cannot find the
 * first invalid field on its own. The product supplies its own field render
 * order and the ids it currently considers invalid (e.g. React Hook Form's
 * `formState.errors` keys); Form only fixes which one wins the race — first
 * in render order — so every product answers this the same way.
 */
export declare function validateFormFieldOrder(fieldOrder: readonly string[]): void;
/**
 * Web renderers call `.focus()` on the resolved field's control; React Native
 * renderers move accessibility focus to it (e.g. `AccessibilityInfo.sendAccessibilityEvent`
 * or a focus-trap ref). Returns `null` when there are no fields yet or none
 * are invalid, in which case a failed submit has no field to focus and the
 * form-level error slot below owns the announcement instead.
 */
export declare function resolveFirstInvalidFieldFocusTarget(fieldOrder: readonly string[], invalidFieldIds: ReadonlySet<string> | readonly string[]): string | null;
export type FormDensity = "compact" | "comfortable";
export declare const formDefaults: {
    readonly density: "comfortable";
};
/**
 * Anatomy is fixed, not a configurable prop: fields, then the form-level
 * error, then actions. `field` frame styling (background, border, its own
 * label/hint/error gap) belongs to `fieldRecipe`; this recipe only sets the
 * gap *between* one field and the next. `formError` renders as the existing
 * Notice `tone="danger"` contract — Form fixes only its slot position, it
 * does not redeclare Notice's colors. `actions` has no dedicated layout here;
 * composing Button/Stack in that slot is the product's job, same reasoning
 * the roadmap already applies to Stack.
 */
export declare const formRecipe: {
    readonly slots: readonly ["root", "field", "formError", "actions"];
    readonly defaults: {
        readonly density: "comfortable";
    };
    readonly density: {
        readonly compact: {
            readonly fieldGap: 12;
        };
        readonly comfortable: {
            readonly fieldGap: 20;
        };
    };
    readonly formError: {
        readonly position: "beforeActions";
        readonly gap: 12;
    };
};
export declare const formBehaviorDefaults: {
    /** Reuses Toast's own `normal | high` vocabulary: a blocked submission is `high`/assertive. */
    readonly errorAnnouncementPriority: "high";
};
/**
 * Kept beside the Form contract as the source value wired by
 * `behaviorRegistry.form`; this lets the registry reuse the contract without
 * redeclaring Form's inputs, events, states, or scenarios.
 */
export declare const formBehaviorSpec: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["status", "formError", "fieldOrder"];
    readonly events: readonly ["onSubmit"];
    readonly defaults: {
        /** Reuses Toast's own `normal | high` vocabulary: a blocked submission is `high`/assertive. */
        readonly errorAnnouncementPriority: "high";
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "busy"];
        readonly content: readonly ["idle", "loading", "error"];
    };
    readonly web: {
        readonly roles: readonly ["alert"];
        readonly keyboard: readonly ["Tab", "Enter"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["alert"];
        readonly states: readonly ["busy"];
        readonly actions: readonly ["submit"];
    };
    readonly scenarios: readonly ["submitting-blocks-every-concurrent-submit-attempt", "each-submit-attempt-settles-its-result-exactly-once", "failed-submit-returns-to-a-resting-state-that-still-allows-retry", "succeeded-submit-remains-resting-and-allows-resubmission", "dispose-during-submit-settles-the-pending-attempt-as-interrupted", "disposed-session-rejects-further-submit-attempts", "form-level-error-never-carries-a-per-field-message", "first-invalid-field-in-render-order-receives-focus-on-submit-failure", "form-level-error-is-announced-when-no-field-target-exists"];
};
//# sourceMappingURL=form.d.ts.map