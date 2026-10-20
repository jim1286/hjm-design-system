import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card, ListRow } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";

it("keeps ordinary card and row actions out of toggle semantics while preserving explicit selection", () => {
  const selectionProps = (selected?: boolean) => selected === undefined ? {} : { selected };
  const controls = [
    (selected?: boolean) => <Card aria-label="Open profile" onActivate={() => {}} {...selectionProps(selected)}>Profile</Card>,
    (selected?: boolean) => <Card aria-label="Open profile" onActivate={() => {}} {...selectionProps(selected)} actions={<button>More</button>}>Profile</Card>,
    (selected?: boolean) => <ListRow title="Open profile" onClick={() => {}} {...selectionProps(selected)} />,
  ];
  for (const control of controls) {
    const render = (selected?: boolean) => renderToStaticMarkup(<HjmProvider>{control(selected)}</HjmProvider>);
    expect(render()).not.toContain("aria-pressed");
    expect(render(false)).toContain('aria-pressed="false"');
    expect(render(true)).toContain('aria-pressed="true"');
  }
});

describe("whole-card activation", () => {
  it("keeps header commands separate from card activation without a footer action", () => {
    const markup = renderToStaticMarkup(<Card title="Idea" aria-label="Open idea" onActivate={() => {}}
      headerActions={<button aria-label="Report idea">Report</button>} />);
    expect(markup).toMatch(/^<article/u);
    expect(markup).toContain('data-slot="header-actions"');
    expect(markup).toContain('data-activation="overlay"');
    expect(markup.match(/<button/gu)).toHaveLength(2);
    expect(markup).toMatch(/<button aria-label="Report idea">Report<\/button>/u);
    expect(markup).not.toContain("aria-pressed");
  });
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

it("keeps decorative background media out of the action and reading tree", () => {
  const markup = renderToStaticMarkup(<Card backgroundMedia={<span>artwork-only</span>} title="Title"
    badges={<span>Featured</span>} actions={<button>Open</button>} />);
  expect(markup).toContain('data-background-media="true"');
  expect(markup).toMatch(/class="hjm-card__background" aria-hidden="true"/u);
  expect(markup.indexOf('data-slot="badges"')).toBeLessThan(markup.indexOf('data-slot="title"'));
  expect(markup.indexOf('data-slot="title"')).toBeLessThan(markup.indexOf('data-slot="actions"'));
  expect(markup.match(/<button/gu)).toHaveLength(1);
  expect(() => renderToStaticMarkup(<Card backgroundMedia={<span />} media={<span />} />)).toThrow(/backgroundMedia/u);
});

it("rejects ambiguous destination cards and destination renderers without a link", () => {
  expect(() => renderToStaticMarkup(<Card href="/letter" onActivate={() => {}} aria-label="Letter" />)).toThrow(/href/u);
  expect(() => renderToStaticMarkup(<Card href="/letter" />)).toThrow(/aria-label/u);
  expect(() => renderToStaticMarkup(<Card renderLink={props => <a {...props} />} />)).toThrow(/requires href/u);
});


it("keeps a cover gesture target, corner classification and commands as independent siblings", () => {
  const markup = renderToStaticMarkup(<Card backgroundMedia={<span>Art</span>}
    backgroundInteraction={<button aria-label="Play">Play</button>}
    mediaBadges={<span>3D</span>} title="Title" actions={<button>Comment</button>} />);
  expect(markup).toContain('data-slot="background-interaction"');
  expect(markup).toContain('data-slot="media-badges"');
  expect(markup.indexOf('aria-label="Play"')).toBeLessThan(markup.indexOf('data-slot="body"'));
  expect(markup.indexOf('</button>')).toBeLessThan(markup.indexOf('data-slot="actions"'));
  expect(() => renderToStaticMarkup(<Card backgroundInteraction={<span />} />)).toThrow(/require backgroundMedia/);
  expect(() => renderToStaticMarkup(<Card mediaBadges={<span />} />)).toThrow(/require backgroundMedia/);
});
