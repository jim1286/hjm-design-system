import { describe, expect, it, vi } from "vitest";

import {
  passwordFieldBehavior,
  passwordFieldRecipe,
  resolvePasswordFieldDescriptor,
  validatePasswordFieldDescriptor,
  type PasswordFieldDescriptor,
} from "../src/password-field.js";
import { fieldFrameContract, formSupportContract } from "../src/component-contracts.js";

const concealed: PasswordFieldDescriptor = { revealed: false, autofillHint: "current" };
const revealed: PasswordFieldDescriptor = { revealed: true, autofillHint: "current" };

const composeToggleAccessibleName = ({ willReveal }: { willReveal: boolean }) =>
  willReveal ? "비밀번호 보이기" : "비밀번호 숨기기";

describe("PasswordField descriptor validation", () => {
  it("accepts both autofill hints", () => {
    expect(() => validatePasswordFieldDescriptor(concealed)).not.toThrow();
    expect(() =>
      validatePasswordFieldDescriptor({ revealed: false, autofillHint: "new" }),
    ).not.toThrow();
  });

  it("rejects a non-boolean revealed flag", () => {
    expect(() =>
      validatePasswordFieldDescriptor({ revealed: "yes" as never, autofillHint: "current" }),
    ).toThrow(/revealed/);
  });

  it("rejects an unsupported autofillHint", () => {
    expect(() =>
      validatePasswordFieldDescriptor({ revealed: false, autofillHint: "signup" as never }),
    ).toThrow(/autofillHint/);
  });
});

describe("PasswordField toggle resolution", () => {
  it("names the toggle for the action it will perform, not the current state", () => {
    const resolvedConcealed = resolvePasswordFieldDescriptor(concealed, {
      composeToggleAccessibleName,
    });
    expect(resolvedConcealed.toggleAccessibleName).toBe("비밀번호 보이기");

    const resolvedRevealed = resolvePasswordFieldDescriptor(revealed, {
      composeToggleAccessibleName,
    });
    expect(resolvedRevealed.toggleAccessibleName).toBe("비밀번호 숨기기");
  });

  it("passes the inverted current state to the composer", () => {
    const composer = vi.fn(composeToggleAccessibleName);
    resolvePasswordFieldDescriptor(concealed, { composeToggleAccessibleName: composer });
    expect(composer).toHaveBeenCalledWith({ willReveal: true });

    resolvePasswordFieldDescriptor(revealed, { composeToggleAccessibleName: composer });
    expect(composer).toHaveBeenCalledWith({ willReveal: false });
  });

  it("maps revealed to the web input type and native secure entry flag", () => {
    expect(
      resolvePasswordFieldDescriptor(concealed, { composeToggleAccessibleName }),
    ).toMatchObject({ webInputType: "password", nativeSecureTextEntry: true });
    expect(
      resolvePasswordFieldDescriptor(revealed, { composeToggleAccessibleName }),
    ).toMatchObject({ webInputType: "text", nativeSecureTextEntry: false });
  });

  it("never derives or exposes anything resembling a value field", () => {
    const resolved = resolvePasswordFieldDescriptor(concealed, {
      composeToggleAccessibleName,
    });
    expect(resolved).not.toHaveProperty("value");
    expect(resolved).not.toHaveProperty("onValueChange");
  });

  it("rejects a composer that is missing or returns empty copy", () => {
    expect(() =>
      resolvePasswordFieldDescriptor(concealed, {
        composeToggleAccessibleName: undefined as never,
      }),
    ).toThrow(/composeToggleAccessibleName/);
    expect(() =>
      resolvePasswordFieldDescriptor(concealed, {
        composeToggleAccessibleName: () => "  ",
      }),
    ).toThrow(/composeToggleAccessibleName/);
  });
});

describe("PasswordField visual and behavior identity", () => {
  it("reuses Field's frame and support copy instead of a new frame", () => {
    expect(passwordFieldRecipe.frame).toBe(fieldFrameContract);
    expect(passwordFieldRecipe.support).toBe(formSupportContract);
  });

  it("keeps the toggle's icon pair mirroring the action, not a single static glyph", () => {
    expect(passwordFieldRecipe.toggle.icons.concealed).toBe("visibility");
    expect(passwordFieldRecipe.toggle.icons.revealed).toBe("visibilityOff");
  });

  it("declares the toggle and value as independent controlled axes", () => {
    expect(passwordFieldBehavior.controlled).toEqual(
      expect.arrayContaining([
        "value",
        "onValueChange",
        "revealed",
        "onRevealedChange",
      ]),
    );
  });

  it("has no strength-meter axis or scenario anywhere in the contract", () => {
    expect(Object.keys(passwordFieldRecipe)).not.toContain("strength");
    expect(passwordFieldBehavior.scenarios.join(" ")).toMatch(/strength-meter-is-out-of-scope/);
  });
});
