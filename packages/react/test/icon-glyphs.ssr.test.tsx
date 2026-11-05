import { renderToStaticMarkup } from "react-dom/server";
import { icons } from "lucide";
import { describe, expect, it } from "vitest";
import { semanticIconLucideNames, semanticIconNames } from "@hjmds/design-contracts/components/icon";
import { HjmProvider } from "../src/index.js";
import { semanticIconNodes } from "../src/semantic-lucide.js";
import { Icon } from "../src/supplemental-display.js";

const pascal = (name: string) => name.replace(/(^|-)([a-z0-9])/gu, (_, __, letter: string) => letter.toUpperCase());

describe("built-in semantic glyphs", () => {
  it("draws every semantic name with the Lucide icon the contract names", () => {
    for (const name of semanticIconNames) {
      expect(semanticIconNodes[name]).toBe(icons[pascal(semanticIconLucideNames[name]) as keyof typeof icons]);
      const markup = renderToStaticMarkup(<Icon name={name} />);
      for (const [tag] of semanticIconNodes[name]) expect(markup).toContain(`<${tag}`);
    }
    expect(renderToStaticMarkup(<Icon name="trendFlat" />)).toContain('y1="9"');
  });
  it("keeps reorder and rotate marks fixed in RTL", () => {
    for (const name of ["arrowUp", "arrowDown", "rotate", "unblock"] as const) {
      expect(renderToStaticMarkup(<HjmProvider direction="rtl"><Icon name={name} /></HjmProvider>)).toContain('data-transform="none"');
    }
    expect(renderToStaticMarkup(<HjmProvider direction="rtl"><Icon name="back" /></HjmProvider>)).toContain('data-transform="mirror-inline"');
  });
});
