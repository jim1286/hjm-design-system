import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { StatusText } from "../src/status-text.js";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

it("keeps one polite atomic live node while result text changes and forwards Text semantics/ref", () => {
  const ref = createRef<HTMLElement>();
  const render = (text: string) => act(() => root.render(<HjmProvider><StatusText ref={ref} as="p" tone="muted" variant="caption">{text}</StatusText></HjmProvider>));
  render("처음 안내");
  const node = host.querySelector('[role="status"]')!;
  expect(node.getAttribute("aria-live")).toBe("polite");
  expect(node.getAttribute("aria-atomic")).toBe("true");
  expect(node.tagName).toBe("P");
  expect(node.getAttribute("data-tone")).toBe("muted");
  expect(node.getAttribute("data-variant")).toBe("caption");
  expect(ref.current).toBe(node);
  render("저장했어요"); expect(host.querySelector('[role="status"]')).toBe(node);
  expect(node.textContent).toBe("저장했어요");
  render(""); expect(node.textContent).toBe("");
});

it("switches assertive and silent semantics without remounting or hiding visible copy", () => {
  const render = (announcement: "assertive" | "none" | "polite") => act(() => root.render(<HjmProvider><StatusText announcement={announcement}>저장 결과</StatusText></HjmProvider>));
  render("assertive"); const node = host.querySelector('[role="alert"]')!;
  expect(node.getAttribute("aria-live")).toBe("assertive");
  expect(node.getAttribute("aria-atomic")).toBe("true");
  render("none"); expect(node.textContent).toBe("저장 결과");
  expect(node.hasAttribute("role")).toBe(false);
  expect(node.getAttribute("aria-live")).toBe("off");
  expect(node.hasAttribute("aria-atomic")).toBe(false);
  render("polite"); expect(host.querySelector('[role="status"]')).toBe(node);
});
