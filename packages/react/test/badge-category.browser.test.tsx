import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Badge } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "360px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(node));

it("paints a product category color with an AA label per theme and rejects tone + category", async () => {
  for (const theme of ["light", "dark"] as const) {
    await render(<HjmProvider theme={theme}><Badge categoryColor={{ light: "#C2185B", dark: "#C2185B" }}>시범</Badge>
      <Badge categoryColor={{ light: "#1762A0", dark: "#7FB8F0" }} variant="outline">포스트</Badge></HjmProvider>);
    const [filled, outline] = [...host.querySelectorAll<HTMLElement>(".hjm-badge")];
    expect(filled!.dataset.tone).toBe("category");
    expect(getComputedStyle(filled!).backgroundColor).toBe("rgb(194, 24, 91)");
    expect(getComputedStyle(filled!).color).toBe("rgb(255, 255, 255)");
    expect(getComputedStyle(outline!).color).toBe(theme === "light" ? "rgb(23, 98, 160)" : "rgb(127, 184, 240)");
    expect(getComputedStyle(outline!).borderTopColor).toBe(getComputedStyle(outline!).color);
    expect(getComputedStyle(outline!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  }
  expect(() => (Badge as unknown as { render: (props: object, ref: null) => unknown }).render({ tone: "brand", categoryColor: { light: "#C2185B", dark: "#C2185B" } }, null)).toThrow(TypeError);
});

it("hands adornment callbacks the Icon stroke width", async () => {
  await render(<Badge leading={({ strokeWidth, size }) => <svg data-stroke={strokeWidth} width={size} />}>공개</Badge>);
  expect(host.querySelector("svg")!.getAttribute("data-stroke")).toBe("2");
});
