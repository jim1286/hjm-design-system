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

// 2026-10-18 BurnTok share/creation starters: a per-item description line and two-line labels, reserved per group.
it("adds a described status line and two-line labels with one reserved caption height", () => {
  const described = [{ id: "a", label: "서연", description: "보냄", image: <img alt="" /> }, { id: "b", label: "아주 긴 닉네임을 가진 친구", image: <img alt="" /> }];
  const html = renderToStaticMarkup(<HjmProvider><ImageChoiceGroup label="보낼 사람" showItemLabels itemLabelLines={2} selectionMode="multiple" value={[]} onValueChange={() => {}} items={described} /></HjmProvider>);
  expect(html).toContain("--hjm-image-choice-caption-lines:3");
  const [first, second] = html.split("<button").slice(1);
  const describedBy = /aria-describedby="([^"]+)"/.exec(first!)?.[1];
  expect(describedBy).toBeTruthy();
  expect(first).toMatch(new RegExp(`id="${describedBy}"[^>]*hjm-image-choice__item-description[^>]*>보냄<`));
  expect(first).toContain('data-lines="2"');
  // Items without a description still reserve the line so the tiles stay even, but describe nothing.
  expect(second).not.toContain("aria-describedby");
  expect(second).toContain("hjm-image-choice__caption");
  expect(() => renderToStaticMarkup(<ImageChoiceGroup label="x" selectionMode="single" value={null} onValueChange={() => {}} items={[{ id: "a", label: "a", description: " ", image: null }]} />)).toThrow(TypeError);
  expect(() => renderToStaticMarkup(<ImageChoiceGroup label="x" itemLabelLines={3 as 2} selectionMode="single" value={null} onValueChange={() => {}} items={items} />)).toThrow(RangeError);
});

it("server-renders a virtualized group as its named, fixed-height viewport before the width is measured", () => {
  const html = renderToStaticMarkup(<HjmProvider><ImageChoiceGroup label="보낼 사람" virtualized={{ height: 240 }} selectionMode="single" value={null} onValueChange={() => {}} items={items} /></HjmProvider>);
  expect(html).toMatch(/class="hjm-image-choice__viewport" role="radiogroup" aria-label="보낼 사람" style="height:240px"/);
  expect(html).not.toContain("<button");
});
