import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { OverlayStackProvider, useDialog, useSheet } from "../src/overlay-stack.js";
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
