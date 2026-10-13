import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { TagsInput } from "../src/tags-input.js";
import { Combobox } from "../src/advanced-forms.js";
import { SearchField } from "../src/forms.js";
import { Select } from "../src/select.js";
import { NumberField } from "../src/number-field.js";
import { Mentions } from "../src/mentions.js";
let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = async (ui: React.ReactNode) => act(async () => root.render(<HjmProvider>{ui}</HjmProvider>));
async function edit(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.setSelectionRange(value.length, value.length);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const key = async (input: HTMLElement, key: string, options: KeyboardEventInit = {}) => act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...options })));
it("keeps composed tag drafts and gives repeated field labels unique ids", async () => {
  const changed = vi.fn();
  await render(<><TagsInput label="Tags" composeRemoveLabel={s => s} onTagsChange={changed} /><TagsInput label="Tags" composeRemoveLabel={s => s} /></>);
  const [input, other] = [...host.querySelectorAll("input")];
  expect(input!.id).not.toBe(other!.id);
  await edit(input!, "서울");
  await key(input!, "Enter", { isComposing: true });
  await key(input!, "Enter", { keyCode: 229 });
  expect(changed).not.toHaveBeenCalled();
  expect(input!.value).toBe("서울");
  await key(input!, "Enter");
  expect(changed).toHaveBeenLastCalledWith(["서울"]);
  expect(input!.value).toBe("");
});
it("blocks suggestion pointer commits after TagsInput becomes disabled", async () => {
  const changed = vi.fn();
  const ui = (disabled: boolean) => <TagsInput label="Tags" composeRemoveLabel={s => s} disabled={disabled} suggestions={[{id:"s",label:"Seoul"}]} onTagsChange={changed} />;
  await render(ui(false)); await edit(host.querySelector("input")!, "S"); await render(ui(true));
  await act(async () => host.querySelector('[role="option"]')!.dispatchEvent(new MouseEvent("mousedown", {bubbles:true,cancelable:true})));
  expect(changed).not.toHaveBeenCalled();
});
const combo = (extra: Partial<React.ComponentProps<typeof Combobox>> = {}) => <Combobox label="City" items={[{value:"seoul",label:"Seoul"}]} emptyMessage="Empty" loadingMessage="Loading" selectionRequiredMessage="Choose" {...extra} />;
it("does not select a combobox result with IME confirmation or while readOnly", async () => {
  const changed = vi.fn();
  await render(combo({onValueChange:changed})); const input = host.querySelector("input")!;
  await key(input,"ArrowDown"); await key(input,"Enter",{isComposing:true}); expect(changed).not.toHaveBeenCalled();
  await render(combo({onValueChange:changed,readOnly:true}));
  await act(async () => document.querySelector('[role="option"]')!.dispatchEvent(new MouseEvent("click",{bubbles:true})));
  expect(changed).not.toHaveBeenCalled();
});
it("does not clear readOnly search values or busy Select selection", async () => {
  const changed = vi.fn();
  await render(<SearchField label="Search" defaultValue="saved" readOnly clearLabel="Clear" onValueChange={changed} />);
  expect(host.querySelector('button[aria-label="Clear"]')).toBeNull();
  await render(<Select label="Select" items={[{id:"a",label:"A",textValue:"A"}]} selectedKey="a" onSelectionChange={changed} placeholder="Choose" emptySelectionLabel="Clear selection" defaultOpen busy />);
  await act(async () => document.querySelector('.hjm-select__option--empty')!.dispatchEvent(new MouseEvent("click",{bubbles:true})));
  expect(changed).not.toHaveBeenCalled();
});
function MentionFixture({readOnly = false}: {readOnly?:boolean}) {
  const [value,setValue]=useState("");
  return <Mentions label="Message" value={value} onValueChange={setValue} triggers={[{id:"people",trigger:"@"}]} candidates={[{id:"s",label:"Seoul"}]} emptyMessage="Empty" listLabel="Candidates" readOnly={readOnly} />;
}
it("keeps Mention IME text and keeps Escape closed through keyup", async () => {
  await render(<MentionFixture />); const input=host.querySelector("textarea")!;
  await edit(input,"@서"); await key(input,"Enter",{isComposing:true});
  expect(input.value).toBe("@서"); await key(input,"Escape");
  await act(async () => input.dispatchEvent(new KeyboardEvent("keyup",{key:"Escape",bubbles:true})));
  expect(document.querySelector('[role="listbox"]')).toBeNull();
  await render(<MentionFixture readOnly />);
  await act(async () => input.dispatchEvent(new MouseEvent("click",{bubbles:true})));
  expect(document.querySelector('[role="listbox"]')).toBeNull();
});


it("keeps NumberField composition drafts and does not commit after readOnly changes", async () => {
  const changed = vi.fn();
  const ui = (readOnly: boolean) => <NumberField label="Amount" defaultValue={1} min={0} max={10} incrementLabel="More" decrementLabel="Less" readOnly={readOnly} onValueChange={changed} />;
  await render(ui(false)); const input = host.querySelector("input")!;
  await edit(input, "2"); await key(input, "Enter", {isComposing:true});
  expect(changed).not.toHaveBeenCalled(); expect(input.value).toBe("2");
  await render(ui(true));
  await act(async () => input.dispatchEvent(new FocusEvent("focusout", {bubbles:true})));
  expect(changed).not.toHaveBeenCalled();
});

it("dismisses TagsInput suggestions with Escape without losing the draft", async () => {
  await render(<TagsInput label="Tags" composeRemoveLabel={s => s} suggestions={[{id:"s",label:"Seoul"}]} />);
  const input = host.querySelector("input")!;
  await edit(input, "S");
  expect(host.querySelector('[role="listbox"]')).not.toBeNull();
  await key(input, "Escape");
  expect(host.querySelector('[role="listbox"]')).toBeNull();
  expect(input.value).toBe("S");
  expect(input.getAttribute("aria-expanded")).toBe("false");
  await key(input, "ArrowDown");
  expect(host.querySelector('[role="listbox"]')).not.toBeNull();
  await key(input, "Escape");
  await edit(input, "Se");
  expect(host.querySelector('[role="listbox"]')).not.toBeNull();
});
