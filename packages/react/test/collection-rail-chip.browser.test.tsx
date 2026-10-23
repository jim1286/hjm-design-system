import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { spacing } from "@hjmds/design-contracts/foundations";
import { collectionRailRecipe } from "@hjmds/design-contracts/collection-rail";
import { CollectionRail } from "../src/collection-rail.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); host.style.width = "390px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("sizes chip items to the chip step with the xs gap", async () => {
  const items = Array.from({ length: 6 }, (_, index) => ({ id: `g${index}`, label: `경기 ${index}` }));
  await act(async () => root.render(<HjmProvider reducedMotion>
    <CollectionRail density="chip" showNavigation={false} label="오늘 경기" items={items} labels={{ previous: "이전", next: "다음", navigation: "경기 탐색" }}
      renderItem={item => <div>{item.label}</div>} />
  </HjmProvider>));
  await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
  const cells = [...host.querySelectorAll<HTMLElement>("[data-collection-rail-item]")];
  expect(cells[0]!.getBoundingClientRect().width).toBe(collectionRailRecipe.itemMaxWidth.chip);
  expect(cells[1]!.getBoundingClientRect().left - cells[0]!.getBoundingClientRect().right).toBe(spacing.xs);
});
