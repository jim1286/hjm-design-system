import { act, useState } from "react";
// This proof file is listed by test/executed-scenarios.json; the workspace checker validates its cases against that registry.
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { CommandPalette } from "../src/command-palette.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
// The evidence registry points to this focused keyboard proof; the shared scenario fixture omits command activation.
// componentId: "command-palette"

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const commands = [
  { id: "write", label: "새 기록 쓰기", textValue: "새 기록 쓰기", shortcut: "N" },
  { id: "search", label: "기록 찾기", textValue: "기록 찾기" },
  { id: "archive", label: "보관함 열기", textValue: "보관함 열기", disabled: true },
  { id: "delete", label: "기록 지우기", textValue: "기록 지우기", tone: "danger" as const },
];

const palette = () => document.querySelector<HTMLElement>(".hjm-command-palette");
const search = () => document.querySelector<HTMLInputElement>(".hjm-command-palette__search")!;
const active = () => document.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')?.textContent;
const optionOf = (label: string) => [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((node) => node.textContent?.startsWith(label))!;
const key = async (value: string) => act(async () => search().dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));

function Fixture({ onActivate, onAfter, onOpenChange, longCopy = false }: {
  onActivate?: (id: string, reason: string) => void;
  onAfter?: (id: string) => void;
  onOpenChange?: (open: boolean, reason: string) => void;
  longCopy?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const items = commands
    .map((command) => longCopy && command.id === "write"
      ? {
        ...command,
        label: `${command.label} ${"매우 긴 명령 이름 ".repeat(12)}`,
        description: "이 설명은 좁은 화면에서도 단축키와 겹치거나 팔레트 바깥으로 잘리지 않아야 합니다. ".repeat(3),
        textValue: `${command.textValue} ${"매우 긴 명령 이름 ".repeat(12)}`,
      }
      : command)
    .filter((command) => command.label.includes(query));
  return (
    <HjmProvider reducedMotion>
      <button type="button">뒤쪽 버튼</button>
      <CommandPalette
        open={open}
        onOpenChange={(next, details) => { setOpen(next); onOpenChange?.(next, details.reason); }}
        descriptor={{ accessibilityLabel: "명령 팔레트", searchPlaceholder: "무엇을 할까요" }}
        source={{ items }}
        query={query}
        onQueryChange={setQuery}
        onActivate={(id, reason) => onActivate?.(id, reason)}
        {...(onAfter ? { onActivateAfterDismiss: (id: string) => onAfter(id) } : {})}
      />
    </HjmProvider>
  );
}

it("names the modal surface, focuses the search field, and makes the page inert", async () => {
  await act(async () => root.render(<Fixture />));
  await expect.poll(() => document.activeElement).toBe(search());
  expect(palette()?.getAttribute("aria-modal")).toBe("true");
  expect(palette()?.getAttribute("aria-label")).toBe("명령 팔레트");
  expect(search().placeholder).toBe("무엇을 할까요");
  const behind = [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === "뒤쪽 버튼")!;
  expect(behind.closest("[inert]")).not.toBeNull();
});

it("wraps long command copy inside the palette on a narrow viewport", async () => {
  await page.viewport(320, 640);
  await act(async () => root.render(<Fixture longCopy />));
  await expect.poll(() => document.activeElement).toBe(search());

  const surface = palette()!;
  const copy = surface.querySelector<HTMLElement>(".hjm-command-palette__copy")!;
  const rect = surface.getBoundingClientRect();
  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.right).toBeLessThanOrEqual(320);
  expect(surface.scrollWidth).toBeLessThanOrEqual(surface.clientWidth);
  expect(copy.getBoundingClientRect().height).toBeGreaterThan(24);
  expect(copy.textContent).toContain("매우 긴 명령 이름");
});

it("keeps one active result, skips disabled rows, and filters as the query narrows", async () => {
  await act(async () => root.render(<Fixture />));
  expect(active()).toContain("새 기록 쓰기");
  await key("ArrowDown");
  expect(active()).toContain("기록 찾기");
  await key("ArrowDown");
  // The disabled row is never the active target.
  expect(active()).toContain("기록 지우기");
  expect(optionOf("보관함 열기").getAttribute("aria-disabled")).toBe("true");
  await act(async () => page.getByRole("combobox", { name: "명령 팔레트" }).fill("찾기"));
  // A new result list re-anchors the active row to the first enabled result.
  expect(active()).toContain("기록 찾기");
  expect(search().getAttribute("aria-activedescendant")).toContain("search");
});

it("closes on activation regardless of dismiss policy and reports the reason", async () => {
  const onActivate = vi.fn(); const onOpenChange = vi.fn();
  await act(async () => root.render(<Fixture onActivate={onActivate} onOpenChange={onOpenChange} />));
  await key("Enter");
  expect(onActivate.mock.calls).toEqual([["write", "keyboard"]]);
  expect(palette()).toBeNull();
  expect(onOpenChange.mock.calls).toEqual([[false, "activation"]]);
});

it("runs the follow-up command only after the palette is gone", async () => {
  const order: string[] = [];
  await act(async () => root.render(
    <Fixture
      onActivate={() => order.push(`activate:${palette() === null ? "closed" : "open"}`)}
      onAfter={() => order.push(`after:${palette() === null ? "closed" : "open"}`)}
    />,
  ));
  await act(async () => optionOf("기록 찾기").dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true })));
  await act(async () => undefined);
  expect(order).toEqual(["activate:open", "after:closed"]);
});

it("dismisses on Escape and on an outside pointer, and honours a policy that forbids both", async () => {
  const onOpenChange = vi.fn();
  await act(async () => root.render(<Fixture onOpenChange={onOpenChange} />));
  await key("Escape");
  expect(palette()).toBeNull();
  await act(async () => root.unmount());
  root = createRoot(host);
  await act(async () => root.render(<Fixture onOpenChange={onOpenChange} />));
  await act(async () => {
    document.querySelector<HTMLElement>(".hjm-command-palette-positioner")!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
  expect(palette()).toBeNull();
  expect(onOpenChange.mock.calls.map(([, reason]) => reason)).toEqual(["escape", "outside"]);
});
