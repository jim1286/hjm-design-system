import { spacing } from "./foundations.js";

/**
 * Form owns two things only: the vertical rhythm between already-framed
 * Fields, and the repeatable submit session (idle → submitting →
 * succeeded/failed). Field values, registration, dependencies, validateTrigger
 * policy and Form.List-style repeating groups stay product-owned (React Hook
 * Form or equivalent) — see docs/form.md for the full boundary.
 */

// ---------------------------------------------------------------------------
// Submit session
// ---------------------------------------------------------------------------

export type FormSubmitStatus = "idle" | "submitting" | "succeeded" | "failed";

export type FormSubmitPhase =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "submitting" }>
  | Readonly<{ status: "succeeded" }>
  | Readonly<{ status: "failed"; message: string }>;

export type FormSubmitOutcome =
  | Readonly<{ outcome: "succeeded" }>
  | Readonly<{ outcome: "failed"; message: string }>
  | Readonly<{ outcome: "blocked"; reason: "already-submitting" }>
  | Readonly<{ outcome: "interrupted" }>;

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

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`Form ${field} must not be empty`);
  }
}

export function validateFormSubmitSessionOptions<Values>(
  options: FormSubmitSessionOptions<Values>,
): void {
  if (typeof options.onSubmit !== "function") {
    throw new TypeError("Form onSubmit must be a function");
  }
  assertCopy(options.fallbackErrorMessage, "fallbackErrorMessage");
}

function resolveFailureMessage<Values>(
  options: FormSubmitSessionOptions<Values>,
  error: unknown,
): string {
  try {
    const resolved = options.resolveErrorMessage?.(error)?.trim();
    return resolved || options.fallbackErrorMessage;
  } catch {
    return options.fallbackErrorMessage;
  }
}

/**
 * Owns submit re-entrancy and exactly-once settlement. Does not own field
 * values (the caller passes `values` at call time), field-level validation,
 * or when submission is allowed to start (the product decides that from its
 * own dirty/valid state before calling `submit`).
 */
export function createFormSubmitSession<Values>(
  options: FormSubmitSessionOptions<Values>,
): FormSubmitSession<Values> {
  validateFormSubmitSessionOptions(options);

  let phase: FormSubmitPhase = { status: "idle" };
  let disposed = false;
  let interruptCurrentAttempt: ((outcome: FormSubmitOutcome) => void) | null = null;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) listener();
  };
  const transition = (next: FormSubmitPhase) => {
    phase = next;
    notify();
  };

  return {
    getSnapshot: () => phase,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    submit(values) {
      if (disposed) throw new Error("Cannot use a disposed Form submit session");
      if (phase.status === "submitting") {
        return Promise.resolve({ outcome: "blocked", reason: "already-submitting" });
      }

      transition({ status: "submitting" });

      return new Promise<FormSubmitOutcome>((resolve) => {
        let settled = false;
        const settleOnce = (outcome: FormSubmitOutcome) => {
          if (settled) return;
          settled = true;
          interruptCurrentAttempt = null;
          resolve(outcome);
        };
        interruptCurrentAttempt = settleOnce;

        (async () => {
          try {
            await options.onSubmit(values);
            if (settled) return;
            transition({ status: "succeeded" });
            settleOnce({ outcome: "succeeded" });
          } catch (error) {
            if (settled) return;
            const message = resolveFailureMessage(options, error);
            transition({ status: "failed", message });
            settleOnce({ outcome: "failed", message });
          }
        })();
      });
    },
    reset() {
      if (disposed) return false;
      if (phase.status === "idle" || phase.status === "submitting") return false;
      transition({ status: "idle" });
      return true;
    },
    dispose() {
      if (disposed) return false;
      disposed = true;
      interruptCurrentAttempt?.({ outcome: "interrupted" });
      interruptCurrentAttempt = null;
      return true;
    },
  };
}

// ---------------------------------------------------------------------------
// Submit-failure focus
// ---------------------------------------------------------------------------

/**
 * Form does not register fields or run validation, so it cannot find the
 * first invalid field on its own. The product supplies its own field render
 * order and the ids it currently considers invalid (e.g. React Hook Form's
 * `formState.errors` keys); Form only fixes which one wins the race — first
 * in render order — so every product answers this the same way.
 */
export function validateFormFieldOrder(fieldOrder: readonly string[]): void {
  const seen = new Set<string>();
  fieldOrder.forEach((fieldId, index) => {
    if (fieldId.trim().length === 0) {
      throw new TypeError(`Form field id at index ${index} must not be empty`);
    }
    if (seen.has(fieldId)) {
      throw new TypeError(`Duplicate Form field id: ${fieldId}`);
    }
    seen.add(fieldId);
  });
}

/**
 * Web renderers call `.focus()` on the resolved field's control; React Native
 * renderers move accessibility focus to it (e.g. `AccessibilityInfo.sendAccessibilityEvent`
 * or a focus-trap ref). Returns `null` when there are no fields yet or none
 * are invalid, in which case a failed submit has no field to focus and the
 * form-level error slot below owns the announcement instead.
 */
export function resolveFirstInvalidFieldFocusTarget(
  fieldOrder: readonly string[],
  invalidFieldIds: ReadonlySet<string> | readonly string[],
): string | null {
  validateFormFieldOrder(fieldOrder);
  const invalid =
    invalidFieldIds instanceof Set ? invalidFieldIds : new Set(invalidFieldIds);
  for (const fieldId of fieldOrder) {
    if (invalid.has(fieldId)) return fieldId;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Visual recipe — inter-field rhythm only
// ---------------------------------------------------------------------------

export type FormDensity = "compact" | "comfortable";

export const formDefaults = {
  density: "comfortable",
} as const satisfies Readonly<{ density: FormDensity }>;

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
export const formRecipe = {
  slots: ["root", "field", "formError", "actions"] as const,
  defaults: formDefaults,
  density: {
    compact: { fieldGap: spacing.sm },
    comfortable: { fieldGap: spacing.lg },
  },
  formError: {
    position: "beforeActions",
    gap: spacing.sm,
  },
} as const satisfies Readonly<{
  slots: readonly ["root", "field", "formError", "actions"];
  defaults: Readonly<{ density: FormDensity }>;
  density: Record<FormDensity, Readonly<{ fieldGap: number }>>;
  formError: Readonly<{ position: "beforeActions"; gap: number }>;
}>;

// ---------------------------------------------------------------------------
// Behavior — source for the shared behaviorRegistry wiring
// ---------------------------------------------------------------------------

export const formBehaviorDefaults = {
  /** Reuses Toast's own `normal | high` vocabulary: a blocked submission is `high`/assertive. */
  errorAnnouncementPriority: "high",
} as const satisfies Readonly<{ errorAnnouncementPriority: "normal" | "high" }>;

/**
 * Kept beside the Form contract as the source value wired by
 * `behaviorRegistry.form`; this lets the registry reuse the contract without
 * redeclaring Form's inputs, events, states, or scenarios.
 */
export const formBehaviorSpec = {
  /*
    값은 제품이 소유하므로 controlled prop이 없다. 대신 renderer가 반드시 배선해야 하는
    것을 `inputs`/`events`로 선언한다 — 공유 불변식이 "controlled + inputs + events가
    하나도 없는 behavior는 renderer 테스트가 구동할 대상이 없다"고 요구하고, 그 지적이
    옳다. 같은 형태(컨트롤러가 상태를 소유하고 renderer가 구동)인 `loadMore`가 이미
    `controlled: []` + `inputs` + `events`로 선언한 선례를 따른다.
  */
  controlled: [],
  inputs: ["status", "formError", "fieldOrder"],
  events: ["onSubmit"],
  defaults: formBehaviorDefaults,
  stateAxes: {
    availability: ["enabled", "busy"],
    content: ["idle", "loading", "error"],
  },
  web: { roles: ["alert"], keyboard: ["Tab", "Enter"], focus: "native" },
  native: { roles: ["alert"], states: ["busy"], actions: ["submit"] },
  scenarios: [
    "submitting-blocks-every-concurrent-submit-attempt",
    "each-submit-attempt-settles-its-result-exactly-once",
    "failed-submit-returns-to-a-resting-state-that-still-allows-retry",
    "succeeded-submit-remains-resting-and-allows-resubmission",
    "dispose-during-submit-settles-the-pending-attempt-as-interrupted",
    "disposed-session-rejects-further-submit-attempts",
    "form-level-error-never-carries-a-per-field-message",
    "first-invalid-field-in-render-order-receives-focus-on-submit-failure",
    "form-level-error-is-announced-when-no-field-target-exists",
  ],
} as const;
