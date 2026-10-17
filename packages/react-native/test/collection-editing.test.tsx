import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { TextInput } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { InlineEdit, RepeatableFieldGroup, SelectionActionBar, FilterRecovery, TableColumnSettings } from "../src/collection-editing.js";
import { Button, IconButton } from "../src/actions.js";
import { TextField, Checkbox } from "../src/inputs.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
// Row tools (edit, remove) are IconButtons named by their label.
const button = (label: string) => tree!.root.findAll(node => (node.type === Button && node.props.children === label) || (node.type === IconButton && node.props.label === label))[0]!;
const copy = { label: "제목", editLabel: "수정", saveLabel: "저장", cancelLabel: "취소", errorLabel: "저장 실패" };

it("keeps a failed native draft and blocks duplicate save events", async () => {
  let reject!: (error: Error) => void;
  const save = vi.fn(() => new Promise<void>((_resolve, fail) => { reject = fail; }));
  act(() => { tree = create(<HjmNativeProvider><InlineEdit id="a" value="기존" {...copy} onSave={save} /></HjmNativeProvider>); });
  act(() => button("수정").props.onPress());
  act(() => tree!.root.findByType(TextInput).props.onChangeText("초안"));
  act(() => { button("저장").props.onPress(); button("저장").props.onPress(); });
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("offline")));
  expect(tree!.root.findByType(TextInput).props.value).toBe("초안");
  expect(tree!.root.findAll(node => node.props.accessibilityRole === "alert").length).toBeGreaterThan(0);
});

it("sends only the captured selection and delegates undo to the confirmed product operation", async () => {
  const ids = ["a"], mutate = vi.fn(), undo = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><SelectionActionBar selectedIds={ids} selectionLabel={n => `${n}개`} clearLabel="해제" onClear={vi.fn()} actions={[{ id: "archive", label: "보관" }]} onAction={mutate} errorLabel="실패" recovery={{ label: "되돌리기", onUndo: undo }} /></HjmNativeProvider>); });
  await act(async () => button("보관").props.onPress());
  ids.push("b"); expect(mutate.mock.calls[0]![1]).toEqual(["a"]);
  await act(async () => button("되돌리기").props.onPress());
  expect(undo).toHaveBeenCalledOnce();
});

it("rejects a removed repeatable row's retained action and preserves the remaining input host", () => {
  const remove = vi.fn(), add = vi.fn(() => undefined);
  const render = (ids: string[], minFields = 0, disabled = false) => <HjmNativeProvider><RepeatableFieldGroup descriptor={{ label: "참여자", fields: ids.map(id => ({ id, label: id })), disabled }} minFields={minFields} addLabel="추가" removeLabel={id => `${id} 삭제`} onAdd={add} onRemove={remove}
    renderField={({ controlProps, focusRef }) => <TextField {...controlProps} ref={focusRef} />} /></HjmNativeProvider>;
  act(() => { tree = create(render(["a", "b"])); });
  const retained = button("a 삭제").props.onPress, other = tree!.root.findAllByType(TextInput)[1];
  act(() => tree!.update(render(["b"])));
  act(() => retained());
  expect(remove).not.toHaveBeenCalled();
  expect(tree!.root.findByType(TextInput)).toBe(other);
  const removeB = button("b 삭제").props.onPress, addRow = button("추가").props.onPress;
  act(() => tree!.update(render(["b"], 1, true)));
  act(() => { removeB(); addRow(); });
  expect(remove).not.toHaveBeenCalled(); expect(add).not.toHaveBeenCalled();
  act(() => tree!.unmount()); tree = undefined;
  act(() => addRow()); expect(add).not.toHaveBeenCalled();
});

it("uses real positive recovery counts and respects locked column boundaries", async () => {
  const apply = vi.fn(), change = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><FilterRecovery title="결과 없음" errorLabel="실패" options={[{ id: "empty", label: "기간", resultCount: 0 }, { id: "topic", label: "주제", resultCount: 2 }]} optionLabel={o => `${o.label} ${o.resultCount}건`} onApply={apply} />
    <TableColumnSettings label="열" columns={[{ id: "a", label: "이름", visible: true, locked: true }, { id: "b", label: "점수", visible: true }]} earlierLabel={c => `${c.label} 앞으로`} laterLabel={c => `${c.label} 뒤로`} onColumnsChange={change} /></HjmNativeProvider>); });
  expect(button("기간 0건")).toBeUndefined();
  expect(apply).not.toHaveBeenCalled();
  await act(async () => button("주제 2건").props.onPress()); expect(apply).toHaveBeenCalledWith("topic");
  expect(tree!.root.findAllByType(IconButton).find(node => node.props.label === "점수 앞으로")!.props.disabled).toBe(true);
  act(() => tree!.root.findAllByType(Checkbox)[0]!.props.onCheckedChange(false));
  expect(change).not.toHaveBeenCalled();
});

it("blocks retained native actions after a product lock and unmount", () => {
  const mutate = vi.fn();
  const render = (disabled: boolean) => <HjmNativeProvider><SelectionActionBar selectedIds={["a"]} selectionLabel={n => `${n}개`} clearLabel="해제" onClear={vi.fn()}
    actions={[{ id: "archive", label: "보관" }]} onAction={mutate} errorLabel="실패" disabled={disabled} /></HjmNativeProvider>;
  act(() => { tree = create(render(false)); });
  const retained = button("보관").props.onPress;
  act(() => tree!.update(render(true)));
  act(() => retained()); expect(mutate).not.toHaveBeenCalled();
  act(() => tree!.update(render(false)));
  act(() => tree!.unmount()); tree = undefined;
  act(() => retained()); expect(mutate).not.toHaveBeenCalled();
});
