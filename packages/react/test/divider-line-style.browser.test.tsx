import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Divider } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "200px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("paints the recipe dash rhythm for dashed and keeps the 1px solid line by default", async () => {
  await act(async () => root.render(<HjmProvider><Divider /><Divider lineStyle="dashed" /><div style={{ display: "flex", height: 48 }}><Divider orientation="vertical" lineStyle="dashed" /></div></HjmProvider>));
  const [solid, dashed, vertical] = [...host.querySelectorAll<HTMLElement>(".hjm-divider")];
  expect(getComputedStyle(solid!).backgroundImage).toBe("none");
  expect(dashed!.dataset.lineStyle).toBe("dashed");
  expect(dashed!.getAttribute("role")).toBe("separator");
  expect(getComputedStyle(dashed!).backgroundImage).toContain("repeating-linear-gradient");
  expect(getComputedStyle(dashed!).backgroundImage).toMatch(/4px/);
  expect(Math.round(dashed!.getBoundingClientRect().height)).toBe(1);
  expect(getComputedStyle(vertical!).backgroundImage).toContain("repeating-linear-gradient");
  await expect(act(async () => root.render(<Divider lineStyle={"dotted" as "dashed"} />))).rejects.toThrow(/Unsupported Divider lineStyle/);
});
