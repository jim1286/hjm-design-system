import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "../src/display.js";

describe("whole-card activation", () => {
  it("keeps passive cards as articles and renders active cards as native buttons", () => {
    expect(renderToStaticMarkup(<Card>Summary</Card>)).toMatch(/^<article/u);
    const markup = renderToStaticMarkup(<Card aria-label="Timer" selected disabled onActivate={() => {}}>Timer</Card>);
    expect(markup).toMatch(/^<button/u);
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('data-state="disabled"');
  });
  it("requires an accessible name", () => {
    expect(() => renderToStaticMarkup(<Card onActivate={() => {}}>Timer</Card>)).toThrow(/aria-label/u);
  });
  it("keeps actions outside the activation button when both are supplied", () => {
    const markup = renderToStaticMarkup(
      <Card aria-label="KE123 Seoul to Tokyo" title="ICN → NRT" selected disabled onActivate={() => {}}
        actions={<button type="button" aria-label="Delete KE123">Delete</button>} />,
    );
    // The root stays an article; the card's name and state move to a sibling overlay button.
    expect(markup).toMatch(/^<article/u);
    expect(markup).toContain('data-activation="overlay"');
    expect(markup).not.toMatch(/^<article[^>]*aria-label/u);
    const activator = markup.match(/<button[^>]*data-slot="activator"[^>]*><\/button>/u)?.[0] ?? "";
    expect(activator).toContain('aria-label="KE123 Seoul to Tokyo"');
    expect(activator).toContain('aria-pressed="true"');
    expect(activator).toContain('disabled=""');
    // No button nests inside another: the activator closes before the actions region starts.
    expect(markup.indexOf("</button>")).toBeLessThan(markup.indexOf('data-slot="actions"'));
  });
});
