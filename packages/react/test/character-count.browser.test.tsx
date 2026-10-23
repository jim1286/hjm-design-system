import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it } from "vitest";
import { spacing } from "@hjmds/design-contracts/foundations";
import type { CharacterCountOptions } from "@hjmds/design-contracts/character-count";
import { TextArea, TextField } from "../src/forms.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const options: CharacterCountOptions = {
  min: 2, max: 10, nearLimit: 3, overflow: "allow", locale: "ko-KR",
  messages: {
    range: ({ min, max }) => `${min}–${max}자`,
    remaining: ({ count }) => `${count}자 남음`,
    needed: ({ count }) => `${count}자 더`,
    over: ({ count }) => `${count}자 초과`,
  },
};

function Controlled({ initial }: Readonly<{ initial: string }>) {
  const [value, setValue] = useState(initial);
  return <TextArea label="본문" value={value} onChange={event => setValue(event.currentTarget.value)} characterCount={options} />;
}

it("draws the counter and sentence, links them to the control and marks overflow invalid", async () => {
  await act(async () => root.render(<HjmProvider><Controlled initial="" /></HjmProvider>));
  const area = host.querySelector("textarea")!;
  const row = host.querySelector<HTMLElement>(".hjm-field__count")!;
  expect(row.textContent).toBe("2–10자0/10");
  expect(area.getAttribute("aria-describedby")!.split(" ")).toContain(row.id);
  expect(area.hasAttribute("maxlength")).toBe(false);
  expect(getComputedStyle(row).columnGap).toBe(`${spacing.sm}px`);

  const live = host.querySelector<HTMLElement>("[data-hjm-field-count-announcement]")!;
  const type = async (text: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
    setter.call(area, text);
    area.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await type("가");
  expect(row.dataset.status).toBe("short");
  expect(row.hasAttribute("data-invalid")).toBe(true);
  expect(live.textContent).toBe("1자 더");
  await type("가나다");
  expect(live.textContent).toBe("1자 더");
  await type("가".repeat(8));
  expect(live.textContent).toBe("2자 남음");
  await type("가".repeat(9));
  // Inside one status the counter changes without a new announcement.
  expect(live.textContent).toBe("2자 남음");
  expect(row.textContent).toBe("1자 남음9/10");
  await type("가".repeat(12));
  expect(row.textContent).toBe("2자 초과12/10");
  expect(live.textContent).toBe("2자 초과");
  expect(area.getAttribute("aria-invalid")).toBe("true");
  expect(host.querySelector(".hjm-field")!.getAttribute("data-state")).toBe("invalid");
});

it("counts an uncontrolled TextField and blocks typing at max by default", async () => {
  await act(async () => root.render(<HjmProvider>
    <TextField label="닉네임" defaultValue="하늘" characterCount={{ max: 12, locale: "ko-KR" }} />
  </HjmProvider>));
  const input = host.querySelector("input")!;
  expect(input.maxLength).toBe(12);
  expect(host.querySelector(".hjm-field__counter")!.textContent).toBe("2/12");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "하늘바다");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(host.querySelector(".hjm-field__counter")!.textContent).toBe("4/12");
  expect(host.querySelector(".hjm-field__count-message")).toBeNull();
});

it("rejects a second limit passed as maxLength", () => {
  expect(() => renderToString(<TextField label="닉네임" maxLength={5} characterCount={{ max: 12, locale: "ko-KR" }} />)).toThrow(TypeError);
});
