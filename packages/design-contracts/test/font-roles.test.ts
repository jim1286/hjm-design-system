import { expect, it } from "vitest";
import { fontFamily, resolveFontFamilyStack, resolveTextFontRole, type FontFamilyRoles } from "../src/foundations.js";
import { defineHjmDesignProfile, hjmDesignPresets } from "../src/design-profile.js";

it("keeps ui-only products compatible and isolates independent role arrays", () => {
  const display = ["Product Display", "serif"], reading = ["Product Reading", "sans-serif"];
  const profile = defineHjmDesignProfile({ extends: "paper", tokens: { fontFamily: { ui: ["Product UI"], display, reading } } });
  display.push("Later"); reading[0] = "Changed";
  expect(resolveFontFamilyStack(profile.tokens.fontFamily, "display")).toEqual(["Product Display", "serif"]);
  expect(resolveFontFamilyStack(profile.tokens.fontFamily, "reading")).toEqual(["Product Reading", "sans-serif"]);
  expect(Object.isFrozen(profile.tokens.fontFamily.reading)).toBe(true);
  const uiOnly = defineHjmDesignProfile({ tokens: { fontFamily: { ui: ["Legacy UI"] } } });
  expect(resolveFontFamilyStack(uiOnly.tokens.fontFamily, "reading")).toEqual(["Legacy UI"]);
  expect(resolveFontFamilyStack(uiOnly.tokens.fontFamily, "display")).toEqual(["Legacy UI"]);
  for (const preset of Object.values(hjmDesignPresets)) {
    expect(resolveFontFamilyStack(preset.tokens.fontFamily, "reading")).toEqual(preset.tokens.fontFamily.ui);
    expect(resolveFontFamilyStack(preset.tokens.fontFamily, "display")).toEqual(preset.tokens.fontFamily.ui);
  }
  expect(resolveFontFamilyStack(fontFamily, "code")).toEqual(fontFamily.code);
});

it("rejects malformed persisted roles and keeps type metrics separate from family choice", () => {
  for (const fonts of [{ display: [] }, { reading: [" "] }, { display: "serif" }, { reading: [4] }, { poster: ["serif"] }]) {
    expect(() => defineHjmDesignProfile(JSON.parse(JSON.stringify({ tokens: { fontFamily: fonts } })))).toThrow(/font/);
  }
  expect(resolveTextFontRole("bodyLarge")).toBe("reading");
  expect(resolveTextFontRole("title")).toBe("display");
  expect(resolveTextFontRole("caption")).toBe("ui");
  expect(resolveTextFontRole("body", "code")).toBe("code");
  expect(() => resolveFontFamilyStack(fontFamily, "poster" as keyof FontFamilyRoles)).toThrow(/font role/);
  expect(() => resolveTextFontRole("body", "poster" as "ui")).toThrow(/font role/);
});
