import "../src/styles.css";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { DescriptionList } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";

it("preserves authored line breaks in a read-only value", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div");
  host.style.width = "320px";
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<HjmProvider><DescriptionList columns={1}
      items={[{ id: "idea", label: "Idea", value: "First line\nSecond line" }]} /></HjmProvider>));
    const value = host.querySelector("dd")!;
    expect(value.textContent).toBe("First line\nSecond line");
    expect(value.getBoundingClientRect().height).toBeGreaterThanOrEqual(2 * Number.parseFloat(getComputedStyle(value).lineHeight));
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
