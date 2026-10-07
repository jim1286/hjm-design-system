import { expect, it } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "../src/design-profile.js";
import { checkPaletteContrast } from "../src/palette-contrast.js";
import { THEMES } from "../src/colors.js";
import { heading } from "../src/foundations.js";

it("keeps the neutral palette compatible and gives each requested preset a distinct arrangement", () => {
  expect(Object.keys(hjmDesignPresets).filter(id => id !== "neutral")).toHaveLength(10);
  expect(hjmDesignPresets.neutral.palette).toEqual(THEMES);
  expect(new Set(["retro", "paper", "forest"].map(name => hjmDesignPresets[name as "retro" | "paper" | "forest"].screens.overview)).size).toBe(3);
  for (const preset of Object.values(hjmDesignPresets)) {
    expect(checkPaletteContrast(preset.palette.light)).toEqual([]);
    expect(checkPaletteContrast(preset.palette.dark)).toEqual([]);
  }
});

it("inherits all axes but lets an app replace only one choice without modifying the built-in", () => {
  const custom = defineHjmDesignProfile({ extends: "forest", id: "my-app", compositions: { collection: "rows" }, interactions: { selectionMotion: "none" } });
  expect(custom.id).toBe("my-app");
  expect(custom.palette).toEqual(hjmDesignPresets.forest.palette);
  expect(custom.compositions).toEqual({ collection: "rows", toolbar: "collapsible" });
  expect(custom.interactions).toEqual({ contentTransition: "rise", selectionMotion: "none" });
  expect(hjmDesignPresets.forest.compositions.collection).toBe("cards");
  expect(Object.isFrozen(custom.tokens.radius)).toBe(true);
});

it("owns its resolved copy without freezing caller arrays or material state", () => {
  const families = ["My Font", "sans-serif"];
  const layers = ["noise"] as const;
  const material = { layers, intensity: 0.1 };
  const custom = defineHjmDesignProfile({ tokens: { fontFamily: { ui: families } }, material: { card: material } });
  families.push("Another Font");
  material.intensity = 0.3;
  expect(custom.tokens.fontFamily.ui).toEqual(["My Font", "sans-serif"]);
  expect(custom.material.card?.intensity).toBe(0.1);
  expect(Object.isFrozen(material)).toBe(false);
  expect(Object.isFrozen(layers)).toBe(false);
});

it("rejects configurations that weaken readability or specify unimplemented variants", () => {
  expect(() => defineHjmDesignProfile({ palette: { light: { primary: "#ffffff", onPrimary: "#ffffff" } } })).toThrow(/contrast/);
  expect(() => defineHjmDesignProfile({ tokens: { radius: { full: 2 } } })).toThrow(/full radius/);
  expect(() => defineHjmDesignProfile({ tokens: { typography: { body: { fontSize: 8 } } } })).toThrow(/typography/);
  expect(() => defineHjmDesignProfile({ material: { canvas: { intensity: 1.5 } } })).toThrow(/intensity/);
  // Persisted JSON can outlive a package version; fail rather than silently changing layout.
  expect(() => defineHjmDesignProfile(JSON.parse('{"compositions":{"collection":"masonry"}}'))).toThrow(/collection/);
  expect(() => defineHjmDesignProfile(JSON.parse('{"extends":"missing"}'))).toThrow(/preset/);
});

it("inherits display headings independently and lets explicit visual levels override typography aliases", () => {
  const custom = defineHjmDesignProfile({ extends: "editorial", tokens: {
    typography: { heading: { fontSize: 26, lineHeight: 36 }, title: { fontWeight: "500" } },
    heading: { level1: { fontSize: 52, lineHeight: 64 }, level3: { fontSize: 29 } },
  } });
  expect(hjmDesignPresets.neutral.tokens.heading).toEqual(heading);
  expect(custom.tokens.heading.level1).toEqual({ fontSize: 52, lineHeight: 64, fontWeight: "500" });
  expect(custom.tokens.heading.level2).toEqual(hjmDesignPresets.editorial.tokens.heading.level2);
  expect(custom.tokens.heading.level3).toEqual({ fontSize: 29, lineHeight: 36, fontWeight: "500" });
  expect(custom.tokens.heading.level5.fontWeight).toBe("500");
  expect(custom.tokens.typography.heading.fontSize).toBe(26);
  expect(defineHjmDesignProfile({ extends: "editorial" }).tokens.heading).toEqual(hjmDesignPresets.editorial.tokens.heading);
  expect(Object.isFrozen(custom.tokens.heading.level1)).toBe(true);
  expect(hjmDesignPresets.editorial.tokens.heading.level1.fontSize).toBe(44);
});

it("rejects invalid display-heading metrics and unknown persisted heading levels", () => {
  expect(() => defineHjmDesignProfile({ tokens: { heading: { level1: { fontSize: 8 } } } })).toThrow(/typography/);
  expect(() => defineHjmDesignProfile({ tokens: { heading: { level2: { fontSize: 54, lineHeight: 40 } } } })).toThrow(/typography/);
  expect(() => defineHjmDesignProfile(JSON.parse('{"tokens":{"heading":{"level1":{"fontWeight":"900"}}}}'))).toThrow(/fontWeight/);
  expect(() => defineHjmDesignProfile(JSON.parse('{"tokens":{"heading":{"level6":{"fontSize":20}}}}'))).toThrow(/heading level/);
});
