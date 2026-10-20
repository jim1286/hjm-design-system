import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RadioGroup } from "../src/selection.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const action = vi.fn(), change = vi.fn();
async function render(disabled = false, readOnly = false) {
  action.mockClear(); change.mockClear();
  await act(async () => root.render(<HjmProvider><RadioGroup accessibilityLabel="Handwriting" defaultValue="a"
    disabled={disabled} readOnly={readOnly} onValueChange={change}
    items={[{value:"a", label:"Default"}, {value:"b",label:"Summer",action:{label:"Rename",accessibilityLabel:"Rename Summer",onAction:action}}]}
    renderLabel={item => <span style={{fontFamily:"cursive"}}>Ink preview {item.value}</span>} /></HjmProvider>));
}
it("keeps custom previews named and the sibling action independent from native radio keyboard selection", async () => {
  await render();
  const rename = host.querySelector('button')!;
  expect(rename.closest('label')).toBeNull();
  await act(async () => rename.click());
  expect(action).toHaveBeenCalledOnce(); expect(change).not.toHaveBeenCalled();
  host.querySelector<HTMLInputElement>('input[value="a"]')!.focus();
  await act(async () => userEvent.keyboard("{ArrowDown}"));
  expect(change).toHaveBeenLastCalledWith("b");
  expect(host.querySelector<HTMLInputElement>('input[value="b"]')!.checked).toBe(true);
  expect(host.querySelector('[aria-label="Summer"]')).not.toBeNull();
});
it("disables the sibling action together with a disabled group", async () => {
  await render(true);
  const rename = host.querySelector('button')!;
  expect(rename.matches(":disabled")).toBe(true);
  await act(async () => rename.click()); expect(action).not.toHaveBeenCalled(); expect(change).not.toHaveBeenCalled();
});
it("allows item management while selection is read-only", async () => {
  await render(false,true);
  await act(async () => host.querySelector('button')!.click());
  expect(action).toHaveBeenCalledOnce(); expect(change).not.toHaveBeenCalled();
});
