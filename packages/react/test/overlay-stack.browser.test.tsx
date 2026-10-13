import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { OverlayStackProvider, useDialog, useSheet, type OverlayStackApi, type OverlayHandle } from "../src/overlay-stack.js";
import { Button } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const order: string[] = [];
function Fixture() {
  const openDialog = useDialog();
  const openSheet = useSheet();
  return (
    <>
      <Button
        onClick={async () => {
          const handle = openDialog({ title: "정말 지울까요", closeLabel: "닫기", children: <p>되돌릴 수 없어요</p> });
          await handle.closed;
          order.push(`dialog-closed:${document.querySelector(".hjm-dialog") === null ? "gone" : "still-there"}`);
          // The contracted order: open the next surface only after the first is gone.
          openSheet({ title: "다음 단계", closeLabel: "닫기", children: <p>시트 본문</p> });
        }}
      >
        지우기
      </Button>
    </>
  );
}

it("opens a dialog imperatively and resolves only after it is gone", async () => {
  order.length = 0;
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <OverlayStackProvider><Fixture /></OverlayStackProvider>
    </HjmProvider>,
  ));
  await act(async () => [...document.querySelectorAll("button")].find((node) => node.textContent === "지우기")!.click());
  expect(document.querySelector(".hjm-dialog")).not.toBeNull();
  expect(document.querySelector(".hjm-dialog")!.textContent).toContain("되돌릴 수 없어요");

  await act(async () => document.querySelector<HTMLElement>(".hjm-dialog__close")!.click());
  await act(async () => undefined);
  await act(async () => undefined);
  expect(order).toEqual(["dialog-closed:gone"]);
  // The follow-up sheet opened after the dialog's own completion signal.
  await expect.poll(() => document.querySelector(".hjm-sheet")).not.toBeNull();
});

it("closes from the returned handle without the call site owning open state", async () => {
  let close: (() => void) | null = null;
  function HandleFixture() {
    const openDialog = useDialog();
    return (
      <Button onClick={() => { close = openDialog({ title: "잠깐만요", closeLabel: "닫기" }).close; }}>
        열기
      </Button>
    );
  }
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <OverlayStackProvider><HandleFixture /></OverlayStackProvider>
    </HjmProvider>,
  ));
  await act(async () => [...document.querySelectorAll("button")].find((node) => node.textContent === "열기")!.click());
  expect(document.querySelector(".hjm-dialog")).not.toBeNull();
  // The call site never held open state; it only kept the handle.
  await act(async () => close?.());
  expect(document.querySelector(".hjm-dialog")).toBeNull();
});

it("refuses to be used outside its provider instead of silently doing nothing", async () => {
  function Bare() { useDialog(); return null; }
  const errors: string[] = [];
  const originalError = console.error;
  console.error = () => {};
  try {
    await act(async () => {
      try { root.render(<Bare />); } catch (error) { errors.push(String(error)); }
    });
  } catch (error) { errors.push(String(error)); }
  console.error = originalError;
  expect(errors.join(" ")).toContain("OverlayStackProvider");
});


it("retains handle ownership and forwards the renderer completion callback", async () => {
  let api!: OverlayStackApi;
  function Capture() { api = { openDialog: useDialog(), openSheet: useSheet() }; return null; }
  await act(async () => root.render(<HjmProvider reducedMotion><OverlayStackProvider><Capture /></OverlayStackProvider></HjmProvider>));
  const complete = vi.fn();
  let first!: OverlayHandle;
  await act(async () => { first = api.openDialog({ title: "첫째", closeLabel: "닫기", onDismissComplete: complete }); });
  await act(async () => first.close());
  await first.closed;
  expect(complete).toHaveBeenCalledOnce();
  await act(async () => { api.openDialog({ title: "둘째", closeLabel: "닫기" }); });
  await act(async () => first.close());
  expect(document.querySelector(".hjm-dialog")?.textContent).toContain("둘째");
});

it("rejects overlapping imperative requests without replacing the active session", async () => {
  let api!: OverlayStackApi;
  function Capture() { api = { openDialog: useDialog(), openSheet: useSheet() }; return null; }
  await act(async () => root.render(<HjmProvider reducedMotion><OverlayStackProvider><Capture /></OverlayStackProvider></HjmProvider>));
  await act(async () => {
    api.openDialog({ title: "첫째", closeLabel: "닫기" });
    expect(() => api.openSheet({ title: "겹침", closeLabel: "닫기" })).toThrow(/closed/);
  });
  expect(document.querySelector(".hjm-dialog")?.textContent).toContain("첫째");
});
