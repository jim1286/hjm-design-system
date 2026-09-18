import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Asset, AssetGroup } from "../src/asset.js";
import { ListRow } from "../src/display.js";
import { DataTable } from "../src/data-table.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

it("gives every media kind the same frame box and freezes motion under the preference", async () => {
  const animated: boolean[] = [];
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <AssetGroup label="편지를 나른 동물들" size="medium">
        <Asset descriptor={{ kind: "icon", decorative: true }}><span>◇</span></Asset>
        <Asset descriptor={{ kind: "lottie", accessibilityLabel: "달리는 여우" }}>
          {({ animate }) => { animated.push(animate); return <span>🦊</span>; }}
        </Asset>
      </AssetGroup>
    </HjmProvider>,
  ));
  const frames = [...document.querySelectorAll<HTMLElement>(".hjm-asset__frame")];
  const boxes = frames.map((frame) => frame.getBoundingClientRect());
  // An icon and a Lottie in the same row line up — that mismatch is why this exists.
  expect(boxes[0]!.width).toBe(boxes[1]!.width);
  expect(boxes[0]!.height).toBe(boxes[1]!.height);
  // The frame does not stop anything itself; it hands the product one answer.
  expect(animated).toEqual([false]);
  const decorative = document.querySelector<HTMLElement>('.hjm-asset[data-kind="icon"]')!;
  expect(decorative.getAttribute("role")).toBe("presentation");
  expect(decorative.getAttribute("aria-hidden")).toBe("true");
  expect(document.querySelector<HTMLElement>('.hjm-asset[data-kind="lottie"]')!.getAttribute("aria-label"))
    .toBe("달리는 여우");
});

it("rejects a meaningful asset with no name and a decorative one that carries a name", () => {
  expect(() => act(() => root.render(
    <HjmProvider><Asset descriptor={{ kind: "image" }}><span /></Asset></HjmProvider>,
  ))).toThrow(/accessibilityLabel/);
  expect(() => act(() => root.render(
    <HjmProvider><Asset descriptor={{ kind: "image", decorative: true, accessibilityLabel: "x" }}><span /></Asset></HjmProvider>,
  ))).toThrow(/decorative/);
});

it("lets the provider set one density that a component prop still overrides", async () => {
  await act(async () => root.render(
    <HjmProvider density="compact">
      <ListRow title="첫 줄" />
      <ListRow title="둘째 줄" density="spacious" />
      <DataTable
        columns={[{ id: "title", header: "제목" }]}
        rows={[{ id: "one" }]}
        labels={{ table: "표", selectAll: "모두", selectRow: (id) => id, sortColumn: (h) => h }}
        renderCell={() => "값"}
      />
    </HjmProvider>,
  ));
  const rows = [...document.querySelectorAll<HTMLElement>(".hjm-list-row")];
  expect(rows[0]!.dataset.density).toBe("compact");
  // The global axis is a default, never a rule: the explicit prop wins.
  expect(rows[1]!.dataset.density).toBe("spacious");
  // The table's own vocabulary says "compact", not the row's word.
  expect(document.querySelector<HTMLElement>(".hjm-data-table")!.dataset.density).toBe("compact");
});
