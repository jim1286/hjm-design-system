import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { Pagination } from "../src/pagination.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;

/** Literal case id links this focused interaction to the renderer evidence registry. */
export const paginationKeyboardCases = [{ componentId: "pagination" }] as const;

const labels = { previous: "이전 페이지", next: "다음 페이지" };
const composeAccessibleName = ({ page, totalPages }: { page: number; totalPages: number }) =>
  `${totalPages}페이지 중 ${page}페이지`;

function Fixture({ onPageChange }: { onPageChange: (page: number, reason: string) => void }) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <HjmProvider>
      <Pagination
        label="기록 페이지"
        descriptor={{ currentPage, totalPages: 3 }}
        labels={labels}
        composeAccessibleName={composeAccessibleName}
        onPageChange={(page, reason) => {
          onPageChange(page, reason);
          setCurrentPage(page);
        }}
      />
    </HjmProvider>
  );
}

const currentPageButton = () =>
  host.querySelector<HTMLButtonElement>('[aria-current="page"]')!;
const buttonNamed = (name: string) =>
  host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

it("moves pages with Tab and Space/Enter, announces the current page, and retains focus at boundaries", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/pagination.keyboard.browser.test.tsx")?.scenarios.map(({ id }) => id)).toContain("keyboard");
  const onPageChange = vi.fn();
  await act(async () => root.render(<Fixture onPageChange={onPageChange} />));

  const previous = buttonNamed("이전 페이지");
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(previous);
  expect(previous.getAttribute("aria-disabled")).toBe("true");
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(document.activeElement).toBe(previous);
  expect(onPageChange).not.toHaveBeenCalled();
  expect(currentPageButton().getAttribute("aria-label")).toBe("3페이지 중 1페이지");

  await act(async () => userEvent.tab()); // page 1
  await act(async () => userEvent.tab()); // page 2
  expect(document.activeElement).toBe(buttonNamed("3페이지 중 2페이지"));
  await act(async () => userEvent.keyboard("{Space}"));
  expect(currentPageButton().getAttribute("aria-label")).toBe("3페이지 중 2페이지");
  expect(currentPageButton().getAttribute("aria-current")).toBe("page");
  expect(host.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  expect(onPageChange).toHaveBeenLastCalledWith(2, "page");

  await act(async () => userEvent.tab()); // page 3
  expect(document.activeElement).toBe(buttonNamed("3페이지 중 3페이지"));
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(currentPageButton().getAttribute("aria-label")).toBe("3페이지 중 3페이지");
  expect(onPageChange).toHaveBeenLastCalledWith(3, "page");

  const next = buttonNamed("다음 페이지");
  await act(async () => userEvent.tab());
  expect(document.activeElement).toBe(next);
  expect(next.getAttribute("aria-disabled")).toBe("true");
  await act(async () => userEvent.keyboard("{Enter}"));
  expect(document.activeElement).toBe(next);
  expect(onPageChange).toHaveBeenCalledTimes(2);
  expect(currentPageButton().getAttribute("aria-label")).toBe("3페이지 중 3페이지");
});
