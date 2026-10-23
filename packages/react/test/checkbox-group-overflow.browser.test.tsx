import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it } from "vitest";
import { spacing } from "@hjmds/design-contracts/foundations";
import { selectionGroupRecipe } from "@hjmds/design-contracts/recipes";
import { CheckboxGroup } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); host.style.width = "320px"; host.style.padding = "16px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const teams = ["LG", "두산", "KT", "NC", "SSG", "롯데", "KIA", "삼성", "키움", "한화"].map(label => ({ id: label, label: `${label} 트윈스` }));

it("keeps multi-select chips on one scrolling line and reveals a focused chip with the inset", async () => {
  await act(async () => root.render(<HjmProvider>
    <CheckboxGroup label="팀" presentation="chips" size="small" overflow="scroll" items={teams} defaultValue={new Set(["KT"])} />
  </HjmProvider>));
  const scroller = host.querySelector<HTMLElement>(".hjm-checkbox-group__scroller")!;
  const chips = [...host.querySelectorAll<HTMLElement>(".hjm-choice")];
  expect(new Set(chips.map(chip => Math.round(chip.getBoundingClientRect().top))).size).toBe(1);
  expect(chips[1]!.getBoundingClientRect().left - chips[0]!.getBoundingClientRect().right).toBe(spacing.xs);
  expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
  // The pulled-back scroller keeps the first chip on the column edge.
  expect(chips[0]!.getBoundingClientRect().left).toBe(host.getBoundingClientRect().left + 16);
  expect(getComputedStyle(scroller).paddingInlineEnd).toBe(`${selectionGroupRecipe.overflow.scrollInset}px`);

  const last = chips.at(-1)!;
  await act(async () => last.querySelector("input")!.focus());
  expect(scroller.scrollLeft).toBeGreaterThan(0);
  expect(last.getBoundingClientRect().right + selectionGroupRecipe.overflow.scrollInset).toBeLessThanOrEqual(scroller.getBoundingClientRect().right + 0.5);
  await act(async () => chips[0]!.querySelector("input")!.focus());
  expect(scroller.scrollLeft).toBe(0);
  // Multi-select semantics are the native checkboxes, unchanged by the rail.
  expect(host.querySelectorAll('input[type="checkbox"]:checked')).toHaveLength(1);
});

it("wraps by default and rejects scroll outside chips", () => {
  expect(renderToString(<CheckboxGroup label="팀" presentation="chips" items={teams} />)).not.toContain("hjm-checkbox-group__scroller");
  expect(() => renderToString(<CheckboxGroup label="팀" overflow="scroll" items={teams} />)).toThrow(TypeError);
});
