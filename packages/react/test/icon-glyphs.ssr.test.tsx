import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { semanticIconNames, semanticIconPaths } from "@hjmds/design-contracts/components/icon";
import { HjmProvider } from "../src/index.js";
import { Icon } from "../src/supplemental-display.js";

describe("built-in semantic glyphs", () => {
  it("draws every semantic name from the shared contract path registry", () => {
    for (const name of semanticIconNames) {
      expect(renderToStaticMarkup(<Icon name={name} />)).toContain(`d="${semanticIconPaths[name]}"`);
    }
  });
  it("keeps reorder and rotate marks fixed in RTL", () => {
    for (const name of ["arrowUp", "arrowDown", "rotate", "unblock"] as const) {
      expect(renderToStaticMarkup(<HjmProvider direction="rtl"><Icon name={name} /></HjmProvider>)).toContain('data-transform="none"');
    }
    expect(renderToStaticMarkup(<HjmProvider direction="rtl"><Icon name="back" /></HjmProvider>)).toContain('data-transform="mirror-inline"');
  });
});
