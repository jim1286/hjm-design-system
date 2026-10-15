import { act, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createActionSession, resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
import { Button } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement; let root: ReturnType<typeof createRoot>;
beforeEach(() => { host = document.createElement("div"); host.style.width = "250px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it.each(["Saved", "Your changes have been saved successfully"])("reserves idle, pending and completion label dimensions: %s", async label => {
  const render = (loading: boolean, confirmed: boolean) => root.render(<HjmProvider><Button loading={loading} completion={{ confirmed, label }}>Save</Button></HjmProvider>);
  await act(async () => render(false, false));
  const button = host.querySelector("button")!, { width, height } = button.getBoundingClientRect();
  await act(async () => render(true, true));
  expect(button.getBoundingClientRect().width).toBeCloseTo(width);
  expect(button.getBoundingClientRect().height).toBeCloseTo(height);
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  await act(async () => render(false, true));
  expect(button.getBoundingClientRect().width).toBeCloseTo(width);
  expect(button.getBoundingClientRect().height).toBeCloseTo(height);
  expect(button.querySelector('span:not([aria-hidden]) > span:last-child')?.textContent).toBe(label);
});
it("requires actual mutation confirmation, preserves edited draft and serializes repeated requests", async () => {
  let resolve!: (value: string) => void, reject!: (reason: Error) => void;
  const request = vi.fn(() => new Promise<string>((yes, no) => { resolve = yes; reject = no; }));
  const session = createActionSession("");
  function Fixture() {
    const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot), [draft, setDraft] = useState("One");
    const feedback = resolveSaveFeedback({ phase: state.status, dirty: draft !== state.value, valid: !!draft, hasSaved: !!state.value });
    return <><input aria-label="Draft" value={draft} onChange={event => setDraft(event.currentTarget.value)} /><Button loading={feedback.pending} completion={{ confirmed: feedback.currentSaved, label: "Saved" }} onClick={() => void session.run(request, { retryable: true })}>Save</Button></>;
  }
  await act(async () => root.render(<HjmProvider><Fixture /></HjmProvider>));
  const click = () => host.querySelector("button")!.click();
  await act(async () => { click(); click(); });
  expect(request).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("offline")));
  expect(host.querySelector("input")!.value).toBe("One");
  expect(host.querySelector("button")!.innerText).toBe("Save");
  await act(async () => click());
  await act(async () => resolve("One"));
  expect(host.querySelector("button")!.innerText).toBe("Saved");
  await act(async () => session.reset(""));
});

it("does not confirm edits made while the submitted snapshot is pending", async () => {
  let resolve!: (value: string) => void;
  const session = createActionSession("");
  function Fixture() {
    const [draft, setDraft] = useState("One");
    const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
    const feedback = resolveSaveFeedback({ phase: state.status, dirty: draft !== state.value, valid: !!draft, hasSaved: !!state.value });
    return <><input aria-label="Draft" value={draft} onChange={event => setDraft(event.currentTarget.value)} /><Button loading={feedback.pending} completion={{ confirmed: feedback.currentSaved, label: "Saved" }} onClick={() => void session.run(() => new Promise<string>(yes => { resolve = yes; }))}>Save</Button></>;
  }
  await act(async () => root.render(<HjmProvider><Fixture /></HjmProvider>));
  await act(async () => host.querySelector("button")!.click());
  await act(async () => page.getByRole("textbox", { name: "Draft" }).fill("Two"));
  await act(async () => resolve("One"));
  expect(host.querySelector("input")!.value).toBe("Two");
  expect(host.querySelector("button")!.innerText).toBe("Save");
});
