import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import { floatingSurfaceContract } from "../src/component-contracts.js";
import {
  canDismissPopover,
  popoverBehaviorDefaults,
  popoverBehaviorScenarios,
  popoverDescriptorDefaults,
  popoverRecipe,
  resolvePopoverDescriptor,
  validatePopoverDescriptor,
  validatePopoverOpenState,
  type PopoverDescriptor,
  type PopoverDismissPolicy,
  type PopoverOpenState,
} from "../src/popover.js";

describe("Popover descriptor", () => {
  it("rejects unsupported fields and enum values", () => {
    expect(() =>
      validatePopoverDescriptor({ placement: "left" } as never),
    ).toThrow(/placement/);
    expect(() =>
      validatePopoverDescriptor({ align: "middle" } as never),
    ).toThrow(/align/);
    expect(() =>
      validatePopoverDescriptor({ content: "hi" } as never),
    ).toThrow(/Unsupported Popover descriptor field/);
    expect(() => validatePopoverDescriptor(null as never)).toThrow(
      /must be an object/,
    );
  });

  it("requires accessibilityLabel to be trimmed visible copy when provided", () => {
    expect(() =>
      validatePopoverDescriptor({ accessibilityLabel: "" }),
    ).toThrow(/accessibilityLabel/);
    expect(() =>
      validatePopoverDescriptor({ accessibilityLabel: " padded " }),
    ).toThrow(/whitespace/);
    expect(() =>
      validatePopoverDescriptor({ accessibilityLabel: "필터" }),
    ).not.toThrow();
  });

  it("accepts an empty descriptor and does not reject valid combinations", () => {
    const descriptor: PopoverDescriptor = { placement: "top", align: "end" };
    expect(() => validatePopoverDescriptor(descriptor)).not.toThrow();
    expect(() => validatePopoverDescriptor({})).not.toThrow();
  });

  it("resolves defaults and preserves an explicit accessibilityLabel without inventing one", () => {
    const resolved = resolvePopoverDescriptor({});
    expect(resolved.placement).toBe(popoverDescriptorDefaults.placement);
    expect(resolved.align).toBe(popoverDescriptorDefaults.align);
    expect(resolved).not.toHaveProperty("accessibilityLabel");

    const labeled = resolvePopoverDescriptor({ accessibilityLabel: "필터" });
    expect(labeled.accessibilityLabel).toBe("필터");
  });
});

describe("Popover open state", () => {
  it("rejects a controlled/uncontrolled mix and missing onOpenChange", () => {
    expect(() =>
      validatePopoverOpenState({
        open: true,
        defaultOpen: true,
      } as never),
    ).toThrow(/defaultOpen/);
    expect(() =>
      validatePopoverOpenState({ open: true } as never),
    ).toThrow(/onOpenChange/);
    expect(() =>
      validatePopoverOpenState({ onOpenChange: "nope" } as never),
    ).toThrow(/onOpenChange/);
  });

  it("accepts a fully uncontrolled state and a valid controlled state", () => {
    const uncontrolled: PopoverOpenState = {};
    const controlled: PopoverOpenState = {
      open: false,
      onOpenChange: () => {},
    };
    expect(() => validatePopoverOpenState(uncontrolled)).not.toThrow();
    expect(() => validatePopoverOpenState(controlled)).not.toThrow();
  });
});

describe("Popover dismiss policy", () => {
  it("lets a controlled owner's programmatic close win even when nothing else can dismiss", () => {
    const lockedDown: PopoverDismissPolicy = {
      dismissible: false,
      outsideDismiss: false,
      escapeDismiss: false,
      focusOutDismiss: false,
    };
    expect(canDismissPopover("programmatic", lockedDown)).toBe(true);
    expect(canDismissPopover("escape", lockedDown)).toBe(false);
    expect(canDismissPopover("outside-pointer", lockedDown)).toBe(false);
    expect(canDismissPopover("outside-focus", lockedDown)).toBe(false);
    expect(canDismissPopover("close-action", lockedDown)).toBe(false);
  });

  it("separates pointer-outside from focus-outside so each can be governed independently", () => {
    const pointerOnly: PopoverDismissPolicy = {
      ...popoverBehaviorDefaults,
      focusOutDismiss: false,
    };
    expect(canDismissPopover("outside-pointer", pointerOnly)).toBe(true);
    expect(canDismissPopover("outside-focus", pointerOnly)).toBe(false);

    const focusOnly: PopoverDismissPolicy = {
      ...popoverBehaviorDefaults,
      outsideDismiss: false,
    };
    expect(canDismissPopover("outside-focus", focusOnly)).toBe(true);
    expect(canDismissPopover("outside-pointer", focusOnly)).toBe(false);
  });

  it("allows an explicit in-content close action under default policy", () => {
    expect(canDismissPopover("close-action")).toBe(true);
    expect(canDismissPopover("escape")).toBe(true);
  });
});

describe("Popover visual recipe", () => {
  it("reuses the shared floating surface instead of declaring new chrome", () => {
    expect(popoverRecipe.surface).toBe(floatingSurfaceContract);
  });

  it("keeps a self-contained, non-empty behavior scenario list for the lead to wire", () => {
    expect(popoverBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(popoverBehaviorScenarios).size).toBe(
      popoverBehaviorScenarios.length,
    );
  });
});

describe("Popover catalog and crosswalk stay untouched", () => {
  it("still reserves Popover as planned/web/overlay, matching dropdown.md's premise", () => {
    const entry = componentCatalog.find((item) => item.name === "Popover");
    expect(entry).toMatchObject({
      category: "overlay",
      platform: "web",
      status: "planned",
    });
  });

  it("keeps the antd Popover crosswalk pointed at the same target", () => {
    const entry = antDesignReferenceComponents.find(
      (item) => item.name === "Popover",
    );
    expect(entry).toMatchObject({
      targets: ["popover"],
      relationship: "direct",
    });
  });
});
