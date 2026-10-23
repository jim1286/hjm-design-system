import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { IconButton } from "../src/actions.js";
import { Surface } from "../src/layout.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>{node}</HjmProvider>));
const shadow = (selector: string) => getComputedStyle(host.querySelector(selector)!).boxShadow;
const token = (name: string) => getComputedStyle(host.querySelector(".hjm-root") ?? document.documentElement).getPropertyValue(`--hjm-shadow-${name}`).trim();

it("lifts Surface by shadow step, lets `none` drop the raised tone shadow, and keeps the tone default", async () => {
  await render(<><Surface data-s="default">a</Surface><Surface data-s="floating" elevation="floating">b</Surface>
    <Surface data-s="flat" tone="raised" elevation="none">c</Surface><Surface data-s="raised" tone="raised">d</Surface></>);
  expect(shadow('[data-s="default"]')).toBe("none");
  expect(shadow('[data-s="floating"]')).not.toBe("none");
  expect(shadow('[data-s="floating"]')).not.toBe(shadow('[data-s="raised"]'));
  expect(shadow('[data-s="flat"]')).toBe("none");
  expect(shadow('[data-s="raised"]')).not.toBe("none");
  expect(token("floating")).not.toBe("");
});

it("lifts a filled IconButton and rejects an elevated ghost", async () => {
  await render(<><IconButton label="번뚝" tone="primary" elevation="floating">⚡</IconButton><IconButton label="닫기" tone="primary">×</IconButton></>);
  const [lifted, flat] = [...host.querySelectorAll("button")];
  expect(getComputedStyle(lifted!).boxShadow).not.toBe("none");
  expect(getComputedStyle(flat!).boxShadow).toBe("none");
  expect(() => act(() => root.render(<IconButton label="x" elevation="raised">x</IconButton>))).toThrow(TypeError);
});
