import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AlertDialog } from "../src/overlays.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("confirms an AlertDialog mounted open under StrictMode", async () => {
  const change = vi.fn();
  await act(async () => root.render(<StrictMode><HjmProvider><AlertDialog open onOpenChange={change}
    request={{ mode: "confirm", title: "삭제할까요?", description: "되돌릴 수 없어요.", confirmLabel: "삭제", cancelLabel: "취소" }} /></HjmProvider></StrictMode>));
  const confirm = [...document.querySelectorAll<HTMLButtonElement>(".hjm-alert-dialog button")].find((button) => button.textContent === "삭제")!;
  await act(async () => confirm.click());
  expect(change).toHaveBeenCalledWith(false, { reason: "confirm" });
});
