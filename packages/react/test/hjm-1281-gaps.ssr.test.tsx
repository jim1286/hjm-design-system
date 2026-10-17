import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { AuthScreenFooter } from "../src/auth-screen.js";
import { Skeleton } from "../src/feedback.js";
import { CollectionRail } from "../src/collection-rail.js";
import { useScreenBodyScrollRoom } from "../src/screens.js";

const css = readFileSync(fileURLToPath(new URL("../src/styles.css", import.meta.url)), "utf8");

// 2026-10-17 diairy web: policy links that open beside the app lost target=_blank when they moved to AuthScreenFooter.
it("renders policy link targets, safe rel defaults and hints", () => {
  const html = renderToStaticMarkup(<AuthScreenFooter links={[
    { label: "Privacy", href: "/privacy", target: "_blank", accessibilityHint: "Opens in a new tab" },
    { label: "Terms", href: "/terms" },
    { label: "Rules", onClick: () => {}, accessibilityHint: "Opens a sheet" },
  ]} />);
  expect(html).toMatch(/<a [^>]*href="\/privacy"[^>]*target="_blank"[^>]*rel="noreferrer noopener"[^>]*aria-describedby="([^"]+)"/u);
  const id = /aria-describedby="([^"]+)"/u.exec(html)![1];
  expect(html).toContain(`<span id="${id}" class="hjm-visually-hidden">Opens in a new tab</span>`);
  expect(html).toMatch(/<a [^>]*href="\/terms"(?![^>]*target)(?![^>]*rel)[^>]*>/u);
  expect(html).toMatch(/<button [^>]*aria-describedby=/u);
  expect(() => renderToStaticMarkup(<AuthScreenFooter links={[{ label: "Privacy", href: "/p", accessibilityHint: " " }]} />)).toThrow(/accessibilityHint/u);
});

it("draws a pill button placeholder from the Button shape axis", () => {
  expect(renderToStaticMarkup(<Skeleton shape="button" buttonShape="pill" />)).toContain('data-button-shape="pill"');
  expect(renderToStaticMarkup(<Skeleton shape="button" />)).toContain('data-button-shape="rounded"');
  expect(renderToStaticMarkup(<Skeleton shape="block" buttonShape="pill" />)).not.toContain("data-button-shape");
  expect(css).toContain('.hjm-skeleton[data-button-shape="pill"] { border-radius: var(--hjm-radius-full); }');
});

it("bleeds the rail over the screen body gutter variable and keeps safe-area parity for the auth layout", () => {
  const html = renderToStaticMarkup(<CollectionRail bleed label="More" items={[{ id: "a", label: "A" }]} renderItem={item => item.label}
    labels={{ previous: "Previous", next: "Next", navigation: "More navigation" }} />);
  expect(html).toContain('data-bleed="true"');
  expect(css).toMatch(/\.hjm-collection-rail__viewport\[data-bleed\] \{ --b: var\(--hjm-screen-body-inline, 0px\); margin-inline: calc\(-1 \* var\(--b\)\); padding-inline: var\(--b\);/u);
  expect(css).toMatch(/\.hjm-screen\[data-content-inset="body-edge"\] > \.hjm-screen__body \{ --hjm-screen-body-inline: 0px; \}/u);
  expect(css).toContain("padding-block-end: max(var(--hjm-auth-screen-padding-block), env(safe-area-inset-bottom, 0px));");
});

it("gives a content scroller the same body-gutter room", () => {
  expect(useScreenBodyScrollRoom().style).toEqual({ marginInline: "calc(-1 * var(--hjm-screen-body-inline, 0px))", paddingInline: "var(--hjm-screen-body-inline, 0px)" });
});
