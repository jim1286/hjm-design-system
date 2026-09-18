import { describe, expect, it } from "vitest";
import { behaviorRegistry } from "../src/behaviors.js";
import { componentCatalog, recipeRegistry } from "../src/catalog.js";
import {
  reconcileToggleGroupSelection,
  toggleGroupBehavior,
  toggleGroupSelection,
  validateToggleGroupDescriptor,
  type ToggleGroupDescriptor,
} from "../src/toggle-group.js";
import {
  removeTagAt,
  resolveTagsInputActiveSuggestion,
  resolveTagsInputCommit,
  tagsInputBehavior,
  tagsInputBehaviorDefaults,
} from "../src/tags-input.js";

const group: ToggleGroupDescriptor = {
  accessibilityLabel: "글자 꾸미기",
  items: [
    { id: "bold", label: "굵게" },
    { id: "italic", label: "기울임" },
    { id: "underline", label: "밑줄", disabled: true },
  ],
};

describe("ToggleGroup", () => {
  it("lets several items be pressed at once and none is valid", () => {
    let pressed = toggleGroupSelection(group, new Set(), "bold");
    pressed = toggleGroupSelection(group, pressed, "italic");
    expect([...pressed].sort()).toEqual(["bold", "italic"]);
    pressed = toggleGroupSelection(group, pressed, "bold");
    pressed = toggleGroupSelection(group, pressed, "italic");
    expect([...pressed]).toEqual([]);
  });

  it("never presses a disabled item and drops ids that left the group", () => {
    expect(toggleGroupSelection(group, new Set(), "underline").has("underline")).toBe(false);
    const reduced: ToggleGroupDescriptor = { ...group, items: [group.items[0]!] };
    expect([...reconcileToggleGroupSelection(reduced, new Set(["bold", "italic"]))]).toEqual(["bold"]);
  });

  it("rejects an empty group and duplicate ids", () => {
    expect(() => validateToggleGroupDescriptor({ ...group, items: [] })).toThrow(RangeError);
    expect(() => validateToggleGroupDescriptor({ ...group, items: [group.items[0]!, group.items[0]!] })).toThrow(/Duplicate/);
  });

  it("keeps single choice out of this contract", () => {
    // No mode axis: SegmentedControl owns "pick one".
    expect(Object.keys(toggleGroupBehavior)).not.toContain("configuration");
    expect(componentCatalog.find((item) => item.name === "ToggleGroup")).toMatchObject({
      recipe: "toggleGroupRecipe",
      behavior: "toggleGroup",
    });
    expect(recipeRegistry).toHaveProperty("toggleGroupRecipe");
    expect(behaviorRegistry.toggleGroup).toBe(toggleGroupBehavior);
  });
});

describe("TagsInput", () => {
  it("trims and accepts a value, rejecting empty and whitespace-only input", () => {
    expect(resolveTagsInputCommit([], "  산책  ")).toEqual({ accepted: true, value: "산책" });
    expect(resolveTagsInputCommit([], "   ")).toMatchObject({ accepted: false, reason: "empty" });
  });

  it("reports why a value was rejected instead of swallowing it", () => {
    expect(resolveTagsInputCommit(["산책"], "산책")).toMatchObject({ accepted: false, reason: "duplicate" });
    expect(resolveTagsInputCommit(["산책"], "산책", { allowDuplicates: true })).toMatchObject({ accepted: true });
    expect(resolveTagsInputCommit(["a", "b"], "c", { maxTags: 2 })).toMatchObject({ accepted: false, reason: "limit" });
    expect(resolveTagsInputCommit([], "!!", { isValid: (value) => /^[\w가-힣]+$/u.test(value) }))
      .toMatchObject({ accepted: false, reason: "invalid" });
  });

  it("removes one occurrence by position, not by value", () => {
    expect(removeTagAt(["a", "b", "a"], 2)).toEqual(["a", "b"]);
    expect(() => removeTagAt(["a"], 5)).toThrow(RangeError);
  });

  it("defaults to Enter only and to a two-step backspace", () => {
    // A comma or a space is part of the value in many languages, so the product
    // opts in rather than losing tags by surprise.
    expect(tagsInputBehaviorDefaults.commitKeys).toEqual(["Enter"]);
    expect(tagsInputBehaviorDefaults.backspaceRemovesLastTag).toBe(false);
    expect(tagsInputBehavior.web.keyboard).toContain("Backspace");
  });
});

describe("TagsInput suggestions", () => {
  const suggestions = [
    { id: "walk", label: "산책" },
    { id: "meal", label: "저녁", disabled: true },
    { id: "rain", label: "비", value: "비 오는 날" },
  ];

  it("cycles the active candidate and skips disabled ones", () => {
    expect(resolveTagsInputActiveSuggestion(suggestions, null, "next")).toBe("walk");
    expect(resolveTagsInputActiveSuggestion(suggestions, "walk", "next")).toBe("rain");
    // Short lists wrap instead of dead-ending.
    expect(resolveTagsInputActiveSuggestion(suggestions, "rain", "next")).toBe("walk");
    expect(resolveTagsInputActiveSuggestion(suggestions, "walk", "previous")).toBe("rain");
    expect(resolveTagsInputActiveSuggestion([], null, "next")).toBeNull();
  });
});
