import { act, StrictMode, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { TextField, TextArea } from "../src/forms.js";
import { Checkbox } from "../src/selection.js";
import { Dialog } from "../src/overlays.js";
import { Button } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const describedText = (control: Element) => (control.getAttribute("aria-describedby") ?? "")
  .split(" ")
  .filter(Boolean)
  .map((id) => document.getElementById(id)?.textContent)
  .join(" | ");

it("keeps support text described alongside the error and the consumer's own description", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <TextField label="제목" description="20자까지 쓸 수 있어요" error="제목을 입력해 주세요" aria-describedby="own-help" />
      <TextArea label="내용" description="줄바꿈도 그대로 남아요" error="내용이 너무 길어요" />
      <p id="own-help">저장하면 바로 반영돼요</p>
    </HjmProvider>,
  ));
  const input = document.querySelector("input")!;
  // Own description first, then support text, then the error — DOM reading order.
  expect(describedText(input)).toBe("저장하면 바로 반영돼요 | 20자까지 쓸 수 있어요 | 제목을 입력해 주세요");
  expect(describedText(document.querySelector("textarea")!)).toBe("줄바꿈도 그대로 남아요 | 내용이 너무 길어요");
});

it("hands the checkbox input to a ref so a product never queries the DOM for focus", async () => {
  function Fixture() {
    const box = useRef<HTMLInputElement>(null);
    return (
      <HjmProvider reducedMotion>
        <Checkbox ref={box} label="동의합니다" />
        <Button onClick={() => box.current?.focus()}>동의 항목으로</Button>
      </HjmProvider>
    );
  }
  await act(async () => root.render(<Fixture />));
  await act(async () => [...document.querySelectorAll("button")].find((node) => node.textContent === "동의 항목으로")!.click());
  expect(document.activeElement).toBe(document.querySelector('input[type="checkbox"]'));
});

it("settles a dismissed dialog once, after the portal and focus cleanup finish", async () => {
  const complete = vi.fn();
  function Fixture() {
    const [open, setOpen] = useState(false);
    return (
      <HjmProvider reducedMotion>
        <Dialog
          open={open}
          onOpenChange={(next) => setOpen(next)}
          onDismissComplete={(detail) => complete({
            reason: detail.reason,
            dialogStillMounted: document.querySelector(".hjm-dialog") !== null,
            focusRestored: document.activeElement?.textContent === "상세 열기",
          })}
          trigger={<Button>상세 열기</Button>}
          title="기록 상세"
          closeLabel="닫기"
        >
          <p>본문</p>
        </Dialog>
      </HjmProvider>
    );
  }
  await act(async () => root.render(<Fixture />));
  await act(async () => [...document.querySelectorAll("button")].find((node) => node.textContent === "상세 열기")!.click());
  await act(async () => document.querySelector<HTMLElement>(".hjm-dialog__close")!.click());
  await act(async () => undefined);
  expect(complete.mock.calls).toEqual([[{ reason: "close-action", dialogStillMounted: false, focusRestored: true }]]);
});

it("settles exactly once under StrictMode and on an unmount that closes an open dialog", async () => {
  const complete = vi.fn();
  await act(async () => root.render(
    <StrictMode>
      <HjmProvider reducedMotion>
        <Dialog defaultOpen trigger={<Button>열기</Button>} title="기록" closeLabel="닫기"
          onDismissComplete={(detail) => complete(detail.reason)}>
          <p>본문</p>
        </Dialog>
      </HjmProvider>
    </StrictMode>,
  ));
  // StrictMode's probe mount/unmount must not look like a dismissal.
  expect(complete).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  await act(async () => undefined);
  expect(complete.mock.calls).toEqual([["programmatic"]]);
  root = createRoot(host);
});
