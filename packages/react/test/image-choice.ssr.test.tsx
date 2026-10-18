import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ImageChoiceGroup } from "../src/image-choice.js";

// 2026-10-18 BurnTok share recipients: names show under the faces without changing the tile's accessible name.
const items = [{ id: "a", label: "서연", image: <img alt="" /> }, { id: "b", label: "민준", image: <img alt="" /> }];

it("shows item labels inside each tile only when asked, hidden from assistive tech", () => {
  const plain = renderToStaticMarkup(<HjmProvider><ImageChoiceGroup label="보낼 사람" selectionMode="multiple" value={[]} onValueChange={() => {}} items={items} /></HjmProvider>);
  expect(plain).not.toContain("hjm-image-choice__item-label");
  const labeled = renderToStaticMarkup(<HjmProvider><ImageChoiceGroup label="보낼 사람" showItemLabels selectionMode="multiple" value={["a"]} onValueChange={() => {}} items={items} /></HjmProvider>);
  const tiles = labeled.split("<button").slice(1);
  expect(tiles).toHaveLength(2);
  expect(tiles[0]).toContain('aria-label="서연"');
  expect(tiles[0]).toMatch(/<span aria-hidden="true" class="[^"]*hjm-image-choice__item-label[^>]*>서연</);
  expect(tiles[1]).toContain(">민준<");
});
