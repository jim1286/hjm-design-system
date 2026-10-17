import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { MediaSelectionScreen, type MediaSelectionItem } from "../src/screen-flows.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const props = {
 title: "선택 사진", add: { label: "사진 추가", icon: "+", onAction: vi.fn() }, done: { label: "완료", onAction: vi.fn() },
 labels: { pending: "대기", uploading: "업로드", success: "완료됨", cancel: "업로드 취소", retry: "업로드 재시도" },
 actionLabels: { remove: "제거", moveUp: "앞으로", moveDown: "뒤로" },
 removeLabel: (item: MediaSelectionItem) => `${item.descriptor.id} 제거`, moveUpLabel: (item: MediaSelectionItem) => `${item.descriptor.id} 앞으로`, moveDownLabel: (item: MediaSelectionItem) => `${item.descriptor.id} 뒤로`,
 onRemove: vi.fn(), onMove: vi.fn(), onRetry: vi.fn(), onCancel: vi.fn(),
};
const item = (id: string): MediaSelectionItem => ({ descriptor: { id, name: id + ".jpg", state: { status: "success" } }, preview: <input aria-label={`${id} 설명`} defaultValue="초안" /> });
const button = (name: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
function Example() {
 const [items, setItems] = useState([item("a"), item("b"), item("c")]);
 return <MediaSelectionScreen {...props} items={items} onRemove={id => setItems(current => current.filter(item => item.descriptor.id !== id))} onMove={(id, direction) => setItems(current => {
  const next = [...current], index = next.findIndex(item => item.descriptor.id === id), target = index + direction;
  if (index >= 0 && target >= 0 && target < next.length) [next[index], next[target]] = [next[target]!, next[index]!]; return next;
 })} />;
}
it("keeps removal focus at the adjacent item and finally at add", async () => {
 await act(async () => root.render(<HjmProvider><Example /></HjmProvider>));
 const c = host.querySelector('input[aria-label="c 설명"]');
 button("b 제거").focus(); await act(async () => userEvent.keyboard("{Enter}"));
 expect(document.activeElement).toBe(button("c 제거")); expect(host.querySelector('input[aria-label="c 설명"]')).toBe(c);
 await act(async () => userEvent.keyboard("{Enter}")); expect(document.activeElement).toBe(button("a 제거"));
 await act(async () => userEvent.keyboard("{Enter}")); expect(document.activeElement?.getAttribute("aria-label")).toBe("사진 추가");
});
it("keeps a reordered preview mounted and transfers boundary focus to an enabled action on that item", async () => {
 await act(async () => root.render(<HjmProvider><Example /></HjmProvider>));
 const input = host.querySelector<HTMLInputElement>('input[aria-label="b 설명"]')!; input.value = "유지할 설명";
 button("b 앞으로").focus(); await act(async () => userEvent.keyboard("{Enter}"));
 expect(host.querySelector('input[aria-label="b 설명"]')).toBe(input); expect(input.value).toBe("유지할 설명");
 expect(document.activeElement).toBe(button("b 뒤로")); expect(button("b 앞으로").disabled).toBe(true);
 await act(async () => userEvent.keyboard("{Enter}")); expect(document.activeElement).toBe(button("b 뒤로"));
 await act(async () => userEvent.keyboard("{Enter}")); expect(document.activeElement).toBe(button("b 앞으로"));
});
it("does not steal intentional external focus or apply removal before the owner accepts it", async () => {
 const remove = vi.fn();
 const render = async (ids: string[]) => act(async () => root.render(<HjmProvider><button>밖</button><MediaSelectionScreen {...props} items={ids.map(item)} onRemove={remove} /></HjmProvider>));
 await render(["a", "b"]); button("a 제거").focus(); await act(async () => userEvent.keyboard("{Enter}"));
 expect(remove).toHaveBeenCalledWith("a"); expect(document.activeElement).toBe(button("a 제거"));
 const outside = host.querySelector("button")!; outside.focus(); await render(["b"]); expect(document.activeElement).toBe(outside);
 button("b 제거").focus(); button("b 제거").blur(); await render([]); expect(document.activeElement).toBe(document.body);
});
it("keeps custom library ownership and dispatches upload recovery only for the addressed item", async () => {
 const retry = vi.fn(), cancel = vi.fn();
 const items: MediaSelectionItem[] = [{ descriptor: { id: "a", name: "a.jpg", state: { status: "error", message: "실패" } } }, { descriptor: { id: "b", name: "b.jpg", state: { status: "uploading", progress: 0.5 } } }];
 await act(async () => root.render(<HjmProvider><MediaSelectionScreen {...props} items={items} onRetry={retry} onCancel={cancel} /></HjmProvider>));
 await act(async () => page.getByRole("button", { name: "업로드 재시도", exact: true }).click()); expect(retry).toHaveBeenCalledExactlyOnceWith("a");
 await act(async () => page.getByRole("button", { name: "업로드 취소", exact: true }).click()); expect(cancel).toHaveBeenCalledExactlyOnceWith("b");
 await act(async () => root.render(<HjmProvider><MediaSelectionScreen {...props} items={items} library={<input aria-label="제품 라이브러리" />} /></HjmProvider>));
 expect(host.querySelectorAll('.hjm-upload-item')).toHaveLength(0); expect(host.querySelector('input[aria-label="제품 라이브러리"]')).not.toBeNull();
});

it("uses the current position after external reordering and accepts a delayed removal", async () => {
 const render = async (ids: string[], disabled = false) => act(async () => root.render(<HjmProvider><MediaSelectionScreen {...props} add={{...props.add, disabled}} items={ids.map(item)} /></HjmProvider>));
 await render(["a", "b", "c", "d"]); button("b 제거").focus();
 await render(["a", "c", "b", "d"]); expect(document.activeElement).toBe(button("b 제거"));
 await act(async () => userEvent.keyboard("{Enter}")); expect(document.activeElement).toBe(button("b 제거"));
 await render(["a", "c", "d"]); expect(document.activeElement).toBe(button("d 제거"));
 await render([], true); expect(document.activeElement).toBe(host.querySelector(".hjm-screen__body"));
});
it("returns to add when removing the last item replaces the grid with an empty state", async () => {
 function EmptyExample() {
  const [items, setItems] = useState([item("a")]);
  return <MediaSelectionScreen {...props} items={items} state={items.length ? {kind:"ready"} : {kind:"empty",title:"선택한 사진 없음"}} onRemove={() => setItems([])} />;
 }
 await act(async () => root.render(<HjmProvider><EmptyExample /></HjmProvider>));
 button("a 제거").focus(); await act(async () => userEvent.keyboard("{Enter}"));
 expect(document.activeElement?.getAttribute("aria-label")).toBe("사진 추가");
});
it("keeps a moved action visible within the scrollable body", async () => {
 function LongExample() {
  const [ids, setIds] = useState(["a", "b", "c", "d", "e", "f"]);
  return <MediaSelectionScreen {...props} items={ids.map(id => ({...item(id),preview:<div style={{height:180}}>{id}</div>}))} onMove={(id,direction) => setIds(current => {
   const next = [...current], index = next.indexOf(id), target = index + direction;
   [next[index],next[target]]=[next[target]!,next[index]!]; return next;
  })} />;
 }
 await act(async () => root.render(<HjmProvider reducedMotion><div style={{height:450,width:390}}><LongExample /></div></HjmProvider>));
 button("b 뒤로").focus(); await act(async () => userEvent.keyboard("{Enter}"));
 expect(document.activeElement).toBe(button("b 뒤로"));
 const bounds=button("b 뒤로").getBoundingClientRect(),clip=host.querySelector(".hjm-screen__body")!.getBoundingClientRect();
 expect(bounds.top).toBeGreaterThanOrEqual(clip.top); expect(bounds.bottom).toBeLessThanOrEqual(clip.bottom);
});
