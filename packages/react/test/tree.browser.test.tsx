import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { resolveTreeCheckedStates, toggleTreeCheckedSelection } from "@hjmds/design-contracts/components/tree-select";
import { Tree } from "../src/tree.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const nodes = [
  {
    id: "2026", label: "2026년", textValue: "2026년",
    children: [
      { id: "september", label: "9월", textValue: "9월", children: [
        { id: "walk", label: "느리게 걸었던 오후", textValue: "느리게 걸었던 오후" },
        { id: "meal", label: "함께 먹은 저녁", textValue: "함께 먹은 저녁", disabled: true },
      ] },
      { id: "october", label: "10월", textValue: "10월" },
    ],
  },
  { id: "archive", label: "보관함", textValue: "보관함" },
] as const;

const item = (label: string) => [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')]
  .find((node) => node.querySelector(".hjm-tree__label")?.textContent === label)!;
const items = () => [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')].map((node) => node.getAttribute("data-hjm-tree-node"));
const key = async (value: string) => act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));

function Fixture({ direction = "ltr", onSelect }: { direction?: "ltr" | "rtl"; onSelect?: (id: string | null) => void }) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(["2026"]));
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <HjmProvider reducedMotion direction={direction}>
      <Tree
        label="기록 폴더"
        nodes={[...nodes]}
        expandedKeys={expanded}
        onExpandedKeysChange={setExpanded}
        selection={{ mode: "single", selectedKey: selected, onSelectionChange: (id) => { setSelected(id); onSelect?.(id); } }}
        composeAccessibleName={({ depth, position, siblingCount, label, hasChildren, expanded: open }) =>
          `${depth}단계 ${siblingCount}개 중 ${position}번째, ${label}${hasChildren ? (open ? ", 펼쳐짐" : ", 접힘") : ""}`}
      />
      <button type="button">다음 버튼</button>
    </HjmProvider>
  );
}

it("announces depth and sibling position instead of relying on the visual indent", async () => {
  await act(async () => root.render(<Fixture />));
  const september = item("9월");
  expect(september.getAttribute("aria-level")).toBe("2");
  expect(september.getAttribute("aria-posinset")).toBe("1");
  expect(september.getAttribute("aria-setsize")).toBe("2");
  expect(september.getAttribute("aria-label")).toBe("2단계 2개 중 1번째, 9월, 접힘");
  expect(item("보관함").hasAttribute("aria-expanded")).toBe(false);
  // The indent is decoration; the depth is carried by aria-level.
  expect(september.querySelector(".hjm-tree__indent")!.getAttribute("aria-hidden")).toBe("true");
});

it("keeps one tab stop for the whole tree and moves it with the roving focus", async () => {
  await act(async () => root.render(<Fixture />));
  const tabbable = () => [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter((node) => node.tabIndex === 0);
  expect(tabbable()).toHaveLength(1);
  await act(async () => item("2026년").focus());
  await key("ArrowDown");
  expect(document.activeElement).toBe(item("9월"));
  expect(tabbable()).toEqual([item("9월")]);
  // The glyph is decorative, so a row has no nested control to tab into.
  expect(item("9월").querySelectorAll("button")).toHaveLength(0);
});

it("expands into the first child and collapses back to the parent, skipping collapsed subtrees", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => item("9월").focus());
  await key("ArrowRight");
  expect(item("9월").getAttribute("aria-expanded")).toBe("true");
  await key("ArrowRight");
  expect(document.activeElement).toBe(item("느리게 걸었던 오후"));
  await key("ArrowLeft");
  expect(document.activeElement).toBe(item("9월"));
  await key("ArrowLeft");
  expect(item("9월").getAttribute("aria-expanded")).toBe("false");
  // With September collapsed, Down goes straight to the next sibling.
  await key("ArrowDown");
  expect(document.activeElement).toBe(item("10월"));
  expect(items()).toEqual(["2026", "september", "october", "archive"]);
  await key("End");
  expect(document.activeElement).toBe(item("보관함"));
});

it("mirrors the expand and collapse arrows in RTL", async () => {
  await act(async () => root.render(<Fixture direction="rtl" />));
  await act(async () => item("9월").focus());
  await key("ArrowLeft");
  expect(item("9월").getAttribute("aria-expanded")).toBe("true");
  await key("ArrowRight");
  expect(item("9월").getAttribute("aria-expanded")).toBe("false");
});

it("gates selection on disabled while leaving expansion and typeahead alone", async () => {
  const onSelect = vi.fn();
  await act(async () => root.render(<Fixture onSelect={onSelect} />));
  await act(async () => item("9월").focus());
  await key("ArrowRight");
  await act(async () => item("함께 먹은 저녁").focus());
  await key("Enter");
  expect(onSelect).not.toHaveBeenCalled();
  expect(item("함께 먹은 저녁").getAttribute("aria-selected")).toBe("false");
  await key("Enter");
  await act(async () => item("느리게 걸었던 오후").focus());
  await key("Enter");
  expect(onSelect.mock.calls).toEqual([["walk"]]);
  expect(item("느리게 걸었던 오후").getAttribute("aria-selected")).toBe("true");
  // Typeahead only reaches nodes that are currently visible.
  await act(async () => item("2026년").focus());
  await key("보");
  expect(document.activeElement).toBe(item("보관함"));
});

it("carries tri-state checks on the node itself and cascades to enabled leaves", async () => {
  function CheckedFixture() {
    const [checked, setChecked] = useState<ReadonlySet<string>>(new Set(["walk"]));
    const states = resolveTreeCheckedStates([...nodes], checked);
    return (
      <HjmProvider reducedMotion>
        <Tree
          label="기록 폴더"
          nodes={[...nodes]}
          defaultExpandedKeys={new Set(["2026", "september"])}
          checkedStates={states}
          onCheckedToggle={(id) => setChecked(toggleTreeCheckedSelection([...nodes], checked, id))}
          composeAccessibleName={({ label }) => label}
        />
      </HjmProvider>
    );
  }
  await act(async () => root.render(<CheckedFixture />));
  // September's only *enabled* leaf is checked, so it derives as fully checked —
  // the disabled sibling is excluded from the coverage the contract counts.
  expect(item("9월").getAttribute("aria-checked")).toBe("true");
  expect(item("함께 먹은 저녁").getAttribute("aria-checked")).toBe("false");
  // Its parent still mixes, because October is an unchecked enabled leaf.
  expect(item("2026년").getAttribute("aria-checked")).toBe("mixed");
  expect(item("느리게 걸었던 오후").getAttribute("aria-checked")).toBe("true");
  // No nested control: the check mark is decoration on a single tab stop.
  expect(item("9월").querySelectorAll("input,button")).toHaveLength(0);
  await act(async () => item("2026년").focus());
  await key(" ");
  // Checking a mixed parent checks every enabled descendant leaf, never the disabled one.
  expect(item("2026년").getAttribute("aria-checked")).toBe("true");
  expect(item("10월").getAttribute("aria-checked")).toBe("true");
  expect(item("함께 먹은 저녁").getAttribute("aria-checked")).toBe("false");
  await key(" ");
  expect(item("느리게 걸었던 오후").getAttribute("aria-checked")).toBe("false");
  expect(item("2026년").getAttribute("aria-checked")).toBe("false");
});
