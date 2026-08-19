import { describe, expect, it, vi } from "vitest";
import {
  createFormSubmitSession,
  formBehaviorSpec,
  formDefaults,
  formRecipe,
  resolveFirstInvalidFieldFocusTarget,
  validateFormFieldOrder,
  validateFormSubmitSessionOptions,
  type FormSubmitOutcome,
} from "../src/form.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("Form submit session options", () => {
  it("requires onSubmit to be a function and fallbackErrorMessage to be visible copy", () => {
    expect(() =>
      validateFormSubmitSessionOptions({
        onSubmit: async () => {},
        fallbackErrorMessage: "다시 시도해주세요",
      }),
    ).not.toThrow();
    expect(() =>
      validateFormSubmitSessionOptions({
        onSubmit: "not-a-function" as never,
        fallbackErrorMessage: "다시 시도해주세요",
      }),
    ).toThrow(/onSubmit/);
    expect(() =>
      validateFormSubmitSessionOptions({
        onSubmit: async () => {},
        fallbackErrorMessage: " ",
      }),
    ).toThrow(/fallbackErrorMessage/);
  });
});

describe("Form submit session invariants", () => {
  it("blocks a concurrent submit attempt without invoking onSubmit twice", async () => {
    const gate = deferred<void>();
    const onSubmit = vi.fn(() => gate.promise);
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
    });

    const first = session.submit({ email: "a@example.com" });
    expect(session.getSnapshot()).toEqual({ status: "submitting" });

    const second = session.submit({ email: "a@example.com" });
    await expect(second).resolves.toEqual({
      outcome: "blocked",
      reason: "already-submitting",
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);

    gate.resolve();
    await expect(first).resolves.toEqual({ outcome: "succeeded" });
    expect(session.getSnapshot()).toEqual({ status: "succeeded" });
  });

  it("settles each attempt exactly once even if a listener re-reads the snapshot mid-transition", async () => {
    const onSubmit = vi.fn(async () => {});
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
    });
    const seen: string[] = [];
    session.subscribe(() => seen.push(session.getSnapshot().status));

    const outcome = await session.submit({});
    expect(outcome).toEqual({ outcome: "succeeded" });
    expect(seen).toEqual(["submitting", "succeeded"]);
  });

  it("moves to a resting failed state that still allows retry, using the fallback message on empty translation", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
      resolveErrorMessage: () => "   ",
    });

    await expect(session.submit({})).resolves.toEqual({
      outcome: "failed",
      message: "제출에 실패했어요",
    });
    expect(session.getSnapshot()).toEqual({
      status: "failed",
      message: "제출에 실패했어요",
    });

    await expect(session.submit({})).resolves.toEqual({ outcome: "succeeded" });
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("falls back to the localized message when resolveErrorMessage throws", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("boom"));
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
      resolveErrorMessage: () => {
        throw new Error("translator is down");
      },
    });
    await expect(session.submit({})).resolves.toEqual({
      outcome: "failed",
      message: "제출에 실패했어요",
    });
  });

  it("allows resubmission after success, keeping the session usable for repeat saves", async () => {
    const onSubmit = vi.fn(async () => {});
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
    });
    await expect(session.submit({})).resolves.toEqual({ outcome: "succeeded" });
    await expect(session.submit({})).resolves.toEqual({ outcome: "succeeded" });
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("blocks reset while submitting and no-ops from idle, but clears a resting phase", async () => {
    const gate = deferred<void>();
    const onSubmit = vi.fn(() => gate.promise);
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
    });

    expect(session.reset()).toBe(false);
    const pending = session.submit({});
    expect(session.reset()).toBe(false);

    gate.resolve();
    await pending;
    expect(session.getSnapshot()).toEqual({ status: "succeeded" });
    expect(session.reset()).toBe(true);
    expect(session.getSnapshot()).toEqual({ status: "idle" });
    expect(session.reset()).toBe(false);
  });

  it("settles an in-flight attempt as interrupted on dispose and rejects further use", async () => {
    const gate = deferred<void>();
    const onSubmit = vi.fn(() => gate.promise);
    const session = createFormSubmitSession({
      onSubmit,
      fallbackErrorMessage: "제출에 실패했어요",
    });

    const pending = session.submit({});
    expect(session.dispose()).toBe(true);
    await expect(pending).resolves.toEqual({ outcome: "interrupted" });
    expect(session.dispose()).toBe(false);
    expect(() => session.submit({})).toThrow(/disposed/);

    // The real handler settling afterward must not resurrect the outcome or phase.
    const outcomes: FormSubmitOutcome[] = [];
    pending.then((outcome) => outcomes.push(outcome));
    gate.resolve();
    await Promise.resolve();
    expect(outcomes).toHaveLength(1);
  });
});

describe("Form field focus targeting", () => {
  it("rejects empty and duplicate field ids but allows an empty order", () => {
    expect(() => validateFormFieldOrder([])).not.toThrow();
    expect(() => validateFormFieldOrder(["email", "password"])).not.toThrow();
    expect(() => validateFormFieldOrder(["email", " "])).toThrow(/index 1/);
    expect(() => validateFormFieldOrder(["email", "email"])).toThrow(/Duplicate/);
  });

  it("resolves the first invalid field in render order, independent of the invalid-set's own order", () => {
    const order = ["email", "password", "confirmPassword"];
    expect(
      resolveFirstInvalidFieldFocusTarget(order, new Set(["confirmPassword", "email"])),
    ).toBe("email");
    expect(resolveFirstInvalidFieldFocusTarget(order, ["confirmPassword"])).toBe(
      "confirmPassword",
    );
  });

  it("returns null when there are no fields yet or none are invalid", () => {
    expect(resolveFirstInvalidFieldFocusTarget([], [])).toBeNull();
    expect(resolveFirstInvalidFieldFocusTarget(["email"], [])).toBeNull();
  });
});

describe("Form visual recipe", () => {
  it("fixes anatomy order to fields, then form-level error, then actions", () => {
    expect(formRecipe.slots).toEqual(["root", "field", "formError", "actions"]);
    expect(formRecipe.formError.position).toBe("beforeActions");
  });

  it("gives comfortable density more inter-field breathing room than compact", () => {
    expect(formRecipe.density.comfortable.fieldGap).toBeGreaterThan(
      formRecipe.density.compact.fieldGap,
    );
    expect(formRecipe.defaults).toEqual(formDefaults);
    expect(formDefaults.density).toBe("comfortable");
  });
});

describe("Form behavior wiring reference", () => {
  it("never exposes a field-level error axis on the form-level contract", () => {
    expect(formBehaviorSpec.stateAxes.content).toEqual(["idle", "loading", "error"]);
    expect(formBehaviorSpec.stateAxes).not.toHaveProperty("validation");
    expect(formBehaviorSpec.controlled).toEqual([]);
  });
});
