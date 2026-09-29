import { act, createRef, StrictMode, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { SortableCollection } from "../src/sortable.js";
import { SwipeActions } from "../src/swipe-actions.js";
import { ContentTransition, TextTransition } from "../src/content-transition.js";
import { CarouselMotion } from "../src/carousel-motion.js";
import { Celebration } from "../src/celebration.js";
const items = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }];
const labels = { instructions: "이동 안내", dragStart: (i: { label: string }) => `${i.label} 이동 시작`, dragCancel: "이동 취소", handle: (i: { label: string }) => `Move ${i.label}`, previous: () => "Previous", next: () => "Next", position: (i: { label: string }, p: number) => `${i.label} ${p}` };
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined; let host: HTMLDivElement;
afterEach(async () => { if (root) await act(() => root!.unmount()); root = undefined; host?.remove(); vi.restoreAllMocks(); });
async function render(child: ReactNode, reduced = true) {
  if (!root) { host = document.createElement("div"); document.body.append(host); root = createRoot(host); }
  await act(() => root!.render(<StrictMode><HjmProvider reducedMotion={reduced}>{child}</HjmProvider></StrictMode>));
}
it("reorders via visible buttons and keeps ID order controlled", async () => {
  function Demo() {
    const [data, setData] = useState(items);
    return <SortableCollection items={data} label="Items" labels={labels} renderItem={i => i.label}
      onCommit={e => setData(e.orderedIds.map(id => items.find(i => i.id === id)!))} />;
  }
  await render(<Demo />);
  await act(() => [...host.querySelectorAll("button")].find(b => b.textContent === "Next")!.click());
  expect([...host.querySelectorAll("li")].map(li => li.dataset.itemId)).toEqual(["b", "a"]);
  expect(host.querySelector('[role="status"]')?.textContent).toBe("Alpha 2");
});
it("prevents duplicate pending row actions and reports rejection", async () => {
  let reject!: (e: Error) => void;
  const action = vi.fn(() => new Promise<void>((_resolve, no) => { reject = no; })); const error = vi.fn();
  await render(<SwipeActions label="Row" actions={[{ id: "save", label: "Save" }, { id: "delete", label: "Delete", disabled: true }]} onAction={action} onError={error}>Record</SwipeActions>);
  await act(() => { host.querySelector("button")!.click(); host.querySelector("button")!.click(); });
  expect(action).toHaveBeenCalledExactlyOnceWith("save");
  expect(host.querySelectorAll("button")[1]!.disabled).toBe(true);
  await act(async () => { reject(new Error("offline")); });
  expect(error).toHaveBeenCalledOnce();
});
it("renders only the current interactive panel and preserves whole graphemes", async () => {
  await render(<ContentTransition stateKey="a"><input aria-label="Old" /></ContentTransition>, false);
  await render(<ContentTransition stateKey="b"><input aria-label="New" /></ContentTransition>, false);
  expect(host.querySelectorAll("input")).toHaveLength(1);
  expect(host.querySelector("input")!.getAttribute("aria-label")).toBe("New");
  await render(<TextTransition text="가족 👨‍👩‍👧‍👦 é" />);
  expect(host.textContent).toBe("가족 👨‍👩‍👧‍👦 é");
});
it("restores focus to the host destination when replacing focused content", async () => {
  const destination = createRef<HTMLHeadingElement>();
  await render(<ContentTransition stateKey="a" focusTarget={destination}><input aria-label="Draft" /></ContentTransition>);
  host.querySelector("input")!.focus();
  await render(<ContentTransition stateKey="b" focusTarget={destination}><h2 ref={destination} tabIndex={-1}>Saved</h2></ContentTransition>);
  expect(document.activeElement).toBe(destination.current);
});
it("keeps carousel navigation explicit and inactive slides inert", async () => {
  function Demo() {
    const [key, setKey] = useState("a");
    return <CarouselMotion slides={items} currentKey={key} onCurrentKeyChange={setKey} label="Places" previousLabel="Previous" nextLabel="Next" renderSlide={i => <button>{i.label}</button>} />;
  }
  await render(<Demo />);
  expect(host.querySelector('[aria-label="Beta"]')?.hasAttribute("inert")).toBe(true);
  await act(() => [...host.querySelectorAll("button")].find(b => b.textContent === "Next")!.click());
  expect(host.querySelector('[aria-label="Alpha"]')?.hasAttribute("inert")).toBe(true);
  expect([...host.querySelectorAll("button")].find(b => b.textContent === "Next")!.disabled).toBe(true);
});
it("consumes reduced-motion events once even under Strict Mode and rerenders", async () => {
  const complete = vi.fn();
  await render(<Celebration eventId="one" onComplete={complete} />);
  expect(complete).toHaveBeenCalledOnce();
  await render(<Celebration eventId="one" preset="milestone" onComplete={complete} />);
  expect(complete).toHaveBeenCalledOnce();
  await render(<Celebration eventId="two" onComplete={complete} />);
  expect(complete).toHaveBeenCalledTimes(2);
});
