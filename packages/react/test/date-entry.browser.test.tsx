import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { DateEntry } from "../src/date-entry.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
import { parseExampleDate } from "../../../showcase/shared/date-entry-example.js";
let host: HTMLDivElement, root: Root;
const labels = { label: "기록 날짜", year: "연도", month: "월", day: "일" };
beforeEach(() => { (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); host.style.width = "320px"; document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
function Demo({ readOnly = false }: { readOnly?: boolean }) {
  const [value, setValue] = useState({ year: "20", month: "Feb", day: "29" });
  return <HjmProvider><DateEntry value={value} onValueChange={setValue} order={["year", "month", "day"]}
    labels={labels} description="그레고리력 날짜" purpose="birthdate" readOnly={readOnly} showErrors
    parse={draft => draft.year.length === 4 ? { status: "valid", value: `${draft.year}-02-29` } : { status: "incomplete", code: "year", fields: ["year"] }}
    formatIssue={() => "연도는 네 자리로 입력해 주세요."} /></HjmProvider>;
}
it("preserves partial drafts, connects affected errors and leaves Tab under user control", async () => {
  await act(async () => root.render(<Demo />));
  const year = page.getByRole("textbox", { name: "연도", exact: true });
  expect(host.querySelector('[autocomplete="bday-year"]')).not.toBeNull();
  expect(host.querySelectorAll('[aria-invalid="true"]')).toHaveLength(1);
  expect(host.querySelectorAll('[data-state="invalid"]')).toHaveLength(1);
  expect(host.querySelectorAll('[role="alert"]')).toHaveLength(1);
  await act(async () => year.fill("2024"));
  expect((document.activeElement as HTMLInputElement).value).toBe("2024");
  expect(host.querySelector('[aria-invalid="true"]')).toBeNull();
  await act(async () => userEvent.keyboard("{Tab}"));
  expect((document.activeElement as HTMLInputElement).value).toBe("Feb");
  expect(host.scrollWidth).toBeLessThanOrEqual(320);
});
it("keeps the native browser read-only contract", async () => {
  await act(async () => root.render(<Demo readOnly />));
  const inputs = [...host.querySelectorAll("input")];
  expect(inputs.every(input => input.readOnly)).toBe(true);
  expect(inputs.map(input => input.value)).toEqual(["20", "Feb", "29"]);
});

it("uses a strict Gregorian demo adapter without accepting date overflow", () => {
  expect(parseExampleDate({year:"2024",month:"Feb",day:"29"})).toEqual({status:"valid",value:"2024-02-29"});
  expect(parseExampleDate({year:"２０２４",month:"０２",day:"２９"})).toEqual({status:"valid",value:"2024-02-29"});
  expect(parseExampleDate({year:"2023",month:"Feb",day:"29"}).status).toBe("invalid");
  expect(parseExampleDate({year:"0000",month:"1",day:"1"}).status).toBe("invalid");
  expect(parseExampleDate({year:"20",month:"Feb",day:"29"}).status).toBe("incomplete");
});

it("keeps one group error and stable editable nodes at 200% in narrow LTR/RTL themes", async () => {
  for (const theme of ["light", "dark"] as const) for (const direction of ["ltr", "rtl"] as const) {
    const value = { year: "", month: "", day: "" };
    const render = (order: readonly ["year", "month", "day"] | readonly ["day", "month", "year"]) =>
      <HjmProvider theme={theme} direction={direction} textScale={2}>
        <DateEntry value={value} onValueChange={() => undefined} order={order} labels={labels}
          required showErrors parse={() => ({ status: "valid", value: "unused" })}
          formatIssue={() => "날짜의 비어 있는 연도·월·일을 입력해 주세요."} />
      </HjmProvider>;
    await act(async () => root.render(render(["year", "month", "day"])));
    expect(host.querySelectorAll('[role="alert"]')).toHaveLength(1);
    expect(host.querySelectorAll('[data-state="invalid"]')).toHaveLength(3);
    expect(host.scrollWidth).toBeLessThanOrEqual(320);
    const inputs = [...host.querySelectorAll("input")];
    const year = inputs[0]!;
    for (const input of inputs) {
      const ids = input.getAttribute("aria-describedby")!.split(" ");
      expect(ids.every(id => document.getElementById(id))).toBe(true);
      expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    await act(async () => year.focus());
    await act(async () => root.render(render(["day", "month", "year"])));
    expect(host.querySelectorAll("input")[2]).toBe(year);
    expect(document.activeElement).toBe(year);
  }
});
