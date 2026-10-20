import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { List, ListSeparator } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

describe.each(["ltr", "rtl"] as const)("shared list separators (%s)", direction => {
  it("keeps virtual separators decorative and distinguishes content, surface and text edges", async () => {
    await act(async () => root.render(<HjmProvider direction={direction}><div style={{ width: 300, padding: 20, boxSizing: "border-box" }}>
      <ListSeparator /><ListSeparator separator="full" /><ListSeparator separator="indented" leading /><ListSeparator separator="none" />
      <List label="설정" separator="content"><button>첫 행</button><button>다음 행</button></List>
    </div></HjmProvider>));
    const lines = [...host.querySelectorAll(".hjm-list-separator")];
    expect(lines).toHaveLength(3);
    const [content, surface, text] = lines.map(line => line.getBoundingClientRect());
    expect(content!.width).toBe(260);
    expect(surface!.width).toBe(276);
    expect(text!.width).toBe(208);
    expect(direction === "ltr" ? text!.left - content!.left : content!.right - text!.right).toBe(52);
    for (const line of lines) {
      expect(line.getAttribute("aria-hidden")).toBe("true");
      expect(line.getAttribute("role")).toBe("presentation");
      expect(getComputedStyle(line).pointerEvents).toBe("none");
    }
    expect(host.querySelectorAll("button")).toHaveLength(2);
    const second = host.querySelectorAll(".hjm-list__item")[1]!;
    expect(getComputedStyle(second, "::before").insetInlineStart).toBe("0px");
    expect(getComputedStyle(second, "::before").insetInlineEnd).toBe("0px");
  });
});
