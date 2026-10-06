import { expect, it } from "vitest";
import { resolveAvatarInitials, resolveBlobatarFallback } from "../src/avatar-fallback.js";
it("keeps case-sensitive identity and rejects empty identifiers", () => {
  expect(resolveBlobatarFallback({ seed: "User-A" })).toEqual({ seed: "User-A", expression: "idle" });
  expect(() => resolveBlobatarFallback({ seed: " " })).toThrow();
});
// One initials rule for both renderers (Web took the first two words, Native the first and last).
it("derives initials from the first and last word in code points", () => {
  expect(resolveAvatarInitials("kim min jun")).toBe("KJ");
  expect(resolveAvatarInitials("  Ada  ")).toBe("A");
  expect(resolveAvatarInitials("황지민")).toBe("황");
  expect(resolveAvatarInitials("𝒜da 𝒵oe")).toBe("𝒜𝒵");
  expect(resolveAvatarInitials("Kim Min Jun", " ab😀d ")).toBe("AB😀");
  expect(() => resolveAvatarInitials("   ")).toThrow(TypeError);
});
