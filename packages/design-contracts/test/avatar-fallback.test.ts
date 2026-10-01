import { expect, it } from "vitest";
import { resolveBlobatarFallback } from "../src/avatar-fallback.js";
it("keeps case-sensitive identity and rejects empty identifiers", () => {
  expect(resolveBlobatarFallback({ seed: "User-A" })).toEqual({ seed: "User-A", expression: "idle" });
  expect(() => resolveBlobatarFallback({ seed: " " })).toThrow();
});
