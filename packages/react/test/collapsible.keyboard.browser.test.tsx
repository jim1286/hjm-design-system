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
