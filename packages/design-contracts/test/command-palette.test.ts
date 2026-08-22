import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import { validateCollection } from "../src/collection.js";
import { backdrop } from "../src/foundations.js";
import { floatingSurfaceContract } from "../src/component-contracts.js";
import {
  canDismissCommandPalette,
  commandPaletteBehaviorDefaults,
  commandPaletteBehaviorScenarios,
  commandPaletteRecipe,
  validateCommandPaletteDescriptor,
  type CommandPaletteDismissPolicy,
  type CommandPaletteSource,
} from "../src/command-palette.js";

describe("CommandPalette descriptor validation", () => {
  it("requires a non-empty accessibilityLabel and searchPlaceholder", () => {
    expect(() =>
      validateCommandPaletteDescriptor({
        accessibilityLabel: "",
        searchPlaceholder: "명령 검색",
      }),
    ).toThrow(/accessibilityLabel/);
    expect(() =>
      validateCommandPaletteDescriptor({
        accessibilityLabel: "명령 팔레트",
        searchPlaceholder: " ",
      }),
    ).toThrow(/searchPlaceholder/);
    expect(() =>
      validateCommandPaletteDescriptor({
        accessibilityLabel: "명령 팔레트",
        searchPlaceholder: "명령 검색",
      }),
    ).not.toThrow();
  });
});

describe("CommandPalette dismiss policy", () => {
  it("always closes on activation or a programmatic owner close, even when locked down", () => {
    const lockedDown: CommandPaletteDismissPolicy = {
      dismissible: false,
      outsideDismiss: false,
      escapeDismiss: false,
    };
    expect(canDismissCommandPalette("activation", lockedDown)).toBe(true);
    expect(canDismissCommandPalette("programmatic", lockedDown)).toBe(true);
    expect(canDismissCommandPalette("escape", lockedDown)).toBe(false);
    expect(canDismissCommandPalette("outside", lockedDown)).toBe(false);
    expect(canDismissCommandPalette("close-action", lockedDown)).toBe(false);
  });

  it("respects outside/escape policy under the default policy", () => {
    expect(canDismissCommandPalette("outside")).toBe(true);
    expect(canDismissCommandPalette("escape")).toBe(true);
    expect(canDismissCommandPalette("close-action")).toBe(true);
    expect(
      canDismissCommandPalette("outside", {
        ...commandPaletteBehaviorDefaults,
        outsideDismiss: false,
      }),
    ).toBe(false);
  });
});

describe("CommandPalette items are Menu-shaped, not Select-shaped", () => {
  it("accepts shortcut and danger tone on items via the shared collection validator", () => {
    const source: CommandPaletteSource = {
      sections: [
        {
          id: "recent",
          label: "최근",
          items: [{ id: "recent-1", label: "최근 본 선수", textValue: "최근 본 선수" }],
        },
        {
          id: "commands",
          label: "명령어",
          items: [
            {
              id: "new-post",
              label: "새 트윗 작성",
              textValue: "새 트윗 작성",
              shortcut: "⌘N",
            },
            {
              id: "delete-account",
              label: "계정 삭제",
              textValue: "계정 삭제",
              tone: "danger",
            },
          ],
        },
      ],
    };
    expect(() => validateCollection(source)).not.toThrow();
  });
});

describe("CommandPalette visual recipe", () => {
  it("reuses the shared floating surface and modal backdrop instead of declaring new chrome", () => {
    expect(commandPaletteRecipe.backdrop).toBe(backdrop.modal);
    expect(commandPaletteRecipe.content.background).toBe(
      floatingSurfaceContract.background,
    );
    expect(commandPaletteRecipe.content.shadow).toBe(
      floatingSurfaceContract.shadow,
    );
  });

  it("declares the expected anatomy slots", () => {
    expect(commandPaletteRecipe.slots).toContain("searchField");
    expect(commandPaletteRecipe.slots).toContain("section");
    expect(commandPaletteRecipe.slots).toContain("emptyState");
  });

  it("keeps a self-contained, non-empty, deduplicated behavior scenario list", () => {
    expect(commandPaletteBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(commandPaletteBehaviorScenarios).size).toBe(
      commandPaletteBehaviorScenarios.length,
    );
  });
});

describe("CommandPalette catalog and crosswalk", () => {
  it("still reserves CommandPalette as planned/web/overlay", () => {
    const entry = componentCatalog.find((item) => item.name === "CommandPalette");
    expect(entry).toMatchObject({
      category: "overlay",
      platform: "web",
      status: "planned",
    });
  });

  it("has no antd crosswalk entry — there is no direct antd counterpart", () => {
    const entry = antDesignReferenceComponents.find(
      (item) => item.name === "CommandPalette",
    );
    expect(entry).toBeUndefined();
  });
});
