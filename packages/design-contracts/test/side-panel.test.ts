import { describe, expect, it } from "vitest";
import {
  canDismissSidePanel,
  sidePanelBehavior,
  sidePanelBehaviorDefaults,
  sidePanelRecipe,
  type SidePanelDismissPolicy,
} from "../src/side-panel.js";

const modal: SidePanelDismissPolicy = sidePanelBehaviorDefaults;
const nonModal: SidePanelDismissPolicy = {
  modal: false,
  dismissible: true,
  dismissWhileBusy: false,
  escapeDismiss: true,
};

describe("canDismissSidePanel", () => {
  it("always allows the controlled owner's programmatic close", () => {
    expect(canDismissSidePanel("programmatic", true, { ...modal, dismissible: false })).toBe(true);
    expect(canDismissSidePanel("programmatic", true, nonModal)).toBe(true);
  });

  it("blocks every user dismiss while busy unless the policy opts in", () => {
    expect(canDismissSidePanel("escape", true, modal)).toBe(false);
    expect(canDismissSidePanel("escape", true, { ...modal, dismissWhileBusy: true })).toBe(true);
  });

  it("allows outside dismiss only for a modal panel", () => {
    expect(canDismissSidePanel("outside", false, modal)).toBe(true);
    expect(canDismissSidePanel("outside", false, nonModal)).toBe(false);
  });

  it("still allows escape and close-action for a non-modal panel", () => {
    expect(canDismissSidePanel("escape", false, nonModal)).toBe(true);
    expect(canDismissSidePanel("close-action", false, nonModal)).toBe(true);
  });

  it("respects a fully non-dismissible policy for user-driven reasons", () => {
    const locked: SidePanelDismissPolicy = { ...nonModal, dismissible: false };
    expect(canDismissSidePanel("escape", false, locked)).toBe(false);
    expect(canDismissSidePanel("close-action", false, locked)).toBe(false);
    expect(canDismissSidePanel("programmatic", false, locked)).toBe(true);
  });
});

describe("SidePanel type-level modal/outsideDismiss coupling", () => {
  it("cannot express outsideDismiss on a non-modal policy", () => {
    // @ts-expect-error outsideDismiss does not exist on the modal:false branch
    const invalid: SidePanelDismissPolicy = {
      modal: false,
      dismissible: true,
      dismissWhileBusy: false,
      escapeDismiss: true,
      outsideDismiss: true,
    };
    expect(invalid).toBeDefined();
  });
});

describe("SidePanel visual and behavior contract", () => {
  it("docks flush to the viewport edge instead of Sheet's floating radius", () => {
    expect(sidePanelRecipe.content.radius).toBeNull();
  });

  it("keeps the header target touch-safe", () => {
    expect(sidePanelRecipe.header.minHeight).toBeGreaterThanOrEqual(44);
  });

  it("exposes no back or swipe dismiss reason on this web-only platform", () => {
    expect(sidePanelBehavior.web.dismiss).toEqual(["escape", "outside"]);
    expect(sidePanelBehavior.native).toEqual({ roles: [], states: [], actions: [] });
  });

  it("declares the modal configuration axis alongside edge", () => {
    expect(sidePanelBehavior.configuration).toEqual({
      edge: ["start", "end"],
      modal: ["true", "false"],
    });
  });
});
