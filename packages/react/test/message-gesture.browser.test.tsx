import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ChatMessage } from "../src/screens.js";
import "../src/styles.css";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const pointer = (type: string, id: number, x: number) => act(async () => {
  host.querySelector("article")!.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, button: 0, clientX: x, clientY: 10 }));
});
it("does not turn another pointer release into a message reply", async () => {
  const reply = vi.fn();
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="Author" timestamp="Now" replyAction={{label:"Reply",onPress:reply}}>Message</ChatMessage></HjmProvider>));
  await pointer("pointerdown", 1, 10);
  await pointer("pointerup", 2, 100);
  expect(reply).not.toHaveBeenCalled();
  await pointer("pointerup", 1, 100);
  expect(reply).toHaveBeenCalledOnce();
});
it("keeps the original gesture when another pointer starts and cancels", async () => {
  const reply = vi.fn();
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="Author" timestamp="Now" replyAction={{label:"Reply",onPress:reply}}>Message</ChatMessage></HjmProvider>));
  await pointer("pointerdown", 1, 10);
  await pointer("pointerdown", 2, 500);
  await pointer("pointercancel", 2, 500);
  await pointer("pointerup", 1, 100);
  expect(reply).toHaveBeenCalledOnce();
});
