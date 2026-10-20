import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Badge } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("shows opaque status plates and both icons in light and dark themes", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  try {
    for (const theme of ["light", "dark"] as const) {
      await act(async () => root.render(<HjmProvider theme={theme} brandPalette={{ light: { onPrimary: "#102030" }, dark: { onPrimary: "#102030" } }}><div style={{ display: "flex", gap: 8, padding: 24 }}><Badge tone="success" leading={<svg width="14" height="14" aria-hidden="true"><path d="M2 7l3 3 7-7" fill="none" stroke="currentColor" /></svg>} trailing={<svg width="14" height="14" aria-hidden="true" />}>준플레이오프</Badge><Badge>종료</Badge><Badge variant="outline" tone="success">완료</Badge><Badge tone="brand">브랜드</Badge></div></HjmProvider>));
      const plates = [...host.querySelectorAll(".hjm-badge")];
      for (const plate of plates.slice(0, 2)) {
        const css = getComputedStyle(plate);
        expect(css.color).toBe("rgb(255, 255, 255)");
        expect(css.borderTopLeftRadius).toBe("8px");
        expect(css.backgroundColor).not.toMatch(/rgba|transparent/);
        expect(css.fontWeight).toBe("700");
      }
      expect(getComputedStyle(plates[3]!).color).toBe("rgb(16, 32, 48)");
      expect(getComputedStyle(plates[2]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(plates[0]!.querySelectorAll(".hjm-badge__icon")).toHaveLength(2);
    }
  } finally { await act(async () => root.unmount()); host.remove(); }
});
