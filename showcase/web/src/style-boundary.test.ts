import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("does not reuse renderer CSS classes for Showcase demos", () => {
  // New Carousel/BottomCTA exports collided with retired demo rules. Compare
  // both class sets so a future renderer cannot silently acquire demo geometry.
  const classes = (source: string) => new Set([...source.matchAll(/\.(hjm-[\w-]+)/g)].map((match) => match[1]!));
  const renderer = classes(readFileSync(new URL("../../../packages/react/src/styles.css", import.meta.url), "utf8"));
  const showcase = classes(readFileSync(new URL("./showcase.css", import.meta.url), "utf8"));
  expect([...showcase].filter((name) => renderer.has(name))).toEqual([]);
});
