import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";

import { Collapsible } from "../src/collapsible.js";
import { HjmProvider } from "../src/provider.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import "../src/styles.css";

export const collapsibleKeyboardCases = [{ componentId: "collapsible" }] as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

it("names an artwork disclosure and opens its details with the keyboard", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion>
    <Collapsible trigger={<span aria-hidden="true">Artwork</span>} triggerLabel="Show proportions" marker="none">
      <p>Blue 66.7%</p>
    </Collapsible>
  </HjmProvider>));
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  expect(trigger.getAttribute("aria-label")).toBe("Show proportions");
  expect(host.querySelector(".hjm-collapsible__marker")).toBeNull();
  await act(async () => userEvent.tab());
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(host.querySelector('[role="region"]')?.textContent).toBe("Blue 66.7%");
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("toggles the lone disclosure with Tab, Enter, and Space while matching its region", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/collapsible.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Collapsible trigger="배송 안내">
        <p>영업일 기준 이틀 안에 도착합니다.</p>
      </Collapsible>
    </HjmProvider>,
  ));

  const trigger = host.querySelector<HTMLButtonElement>(".hjm-collapsible__trigger")!;
  expect(trigger.type).toBe("button");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(host.querySelector(".hjm-collapsible__content")).toBeNull();

  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(trigger);
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const region = host.querySelector<HTMLElement>(".hjm-collapsible__content")!;
  expect(region.getAttribute("role")).toBe("region");
  expect(trigger.getAttribute("aria-controls")).toBe(region.id);
  expect(region.textContent).toContain("영업일 기준 이틀 안에 도착합니다.");

  await act(async () => userEvent.keyboard("{Space}"));
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(host.querySelector(".hjm-collapsible__content")).toBeNull();
});
it.each([false,true])('restores focus after external collapse with keepMounted=%s without losing retained drafts',async keepMounted=>{
 const render=(open:boolean)=>act(async()=>root.render(<HjmProvider><Collapsible trigger="Details" open={open} onOpenChange={()=>{}} keepMounted={keepMounted}><input defaultValue="Draft"/></Collapsible></HjmProvider>));
 await render(true);const input=host.querySelector('input')!;await act(async()=>input.focus());await render(false);expect(document.activeElement).toBe(host.querySelector('button'));await render(true);if(keepMounted)expect(host.querySelector('input')).toBe(input);
});
it('does not steal an external focus on collapse and refuses disabled activation',async()=>{
 let calls=0;const render=(open:boolean,disabled=false)=>act(async()=>root.render(<HjmProvider><button id="external">Outside</button><Collapsible trigger="Details" open={open} onOpenChange={()=>calls++} disabled={disabled}><input/></Collapsible></HjmProvider>));
 await render(true);await act(async()=>host.querySelector<HTMLButtonElement>('#external')!.focus());await render(false,true);expect(document.activeElement?.id).toBe('external');await act(async()=>host.querySelector<HTMLButtonElement>('.hjm-collapsible__trigger')!.click());expect(calls).toBe(0);
});

it("keeps a separate title while pending content becomes a closed ready disclosure", async () => {
  const render = (pending: boolean) => act(async () => root.render(<HjmProvider><Collapsible
    title={<h3>評価</h3>} trigger="Open" {...(pending ? { pendingLabel: "Measuring" } : {})}
  ><p>Scores</p></Collapsible></HjmProvider>));
  await render(true);
  expect(host.querySelector("h3")!.textContent).toBe("評価");
  expect(host.querySelector("button")).toBeNull();
  expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Measuring"]')).not.toBeNull();
  expect(host.textContent).not.toContain("Scores");
  await render(false);
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  expect(trigger.textContent).toContain("Open");
  expect(trigger.textContent).not.toContain("評価");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  await act(async () => trigger.click());
  expect(host.querySelector('[role="region"]')!.textContent).toBe("Scores");
});
it("recovers focused content to the host when preparation removes its trigger", async () => {
  const render = (pending: boolean) => act(async () => root.render(<HjmProvider><Collapsible
    title={<h3>Details</h3>} trigger="Open" open onOpenChange={() => {}} keepMounted {...(pending ? { pendingLabel: "Measuring" } : {})}
  ><input defaultValue="Draft" /></Collapsible></HjmProvider>));
  await render(false);
  const draft = host.querySelector("input")!;
  await act(async () => draft.focus());
  await render(true);
  expect(document.activeElement).toBe(host.querySelector(".hjm-collapsible"));
  expect(host.querySelector("input")).toBe(draft);
  expect(host.querySelector<HTMLElement>('[role="region"]')!.hidden).toBe(true);
  await render(false);
  expect(host.querySelector("input")).toBe(draft);
  expect(draft.value).toBe("Draft");
});
