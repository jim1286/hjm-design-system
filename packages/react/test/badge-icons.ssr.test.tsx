import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Badge } from "../src/display.js";

it("renders decorative icons on either side without leaking slot props to the DOM", () => {
  for (const slots of [{ leading: <svg data-icon="left" /> }, { trailing: <svg data-icon="right" /> }, { leading: <svg data-icon="left" />, trailing: <svg data-icon="right" /> }]) {
    const html = renderToStaticMarkup(<Badge {...slots}>완료</Badge>);
    expect(html).not.toMatch(/ (leading|trailing)=/);
    if (slots.leading) expect(html.indexOf('data-icon="left"')).toBeLessThan(html.indexOf('완료'));
    if (slots.trailing) expect(html.indexOf('data-icon="right"')).toBeGreaterThan(html.indexOf('완료'));
    expect((html.match(/aria-hidden="true"/g) ?? []).length).toBe(Object.keys(slots).length);
  }
});

it("provides matching decorative icon metrics through both render slots", () => {
  const html = renderToStaticMarkup(<Badge leading={({ color, size }) => <svg data-color={color} width={size} />}
    trailing={({ color, size }) => <svg data-color={color} width={size} />}>완료</Badge>);
  expect((html.match(/data-color="currentColor"/g) ?? []).length).toBe(2);
  expect((html.match(/width="14"/g) ?? []).length).toBe(2);
  expect((html.match(/aria-hidden="true"/g) ?? []).length).toBe(2);
});
