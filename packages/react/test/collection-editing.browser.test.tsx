import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { InlineEdit, RepeatableFieldGroup, SelectionActionBar, FilterRecovery, TableColumnSettings } from "../src/collection-editing.js";
import { TextField } from "../src/forms.js";
import { HjmProvider } from "../src/provider.js";
import type { ColumnSetting } from "@hjmds/design-contracts/collection-editing";
import { compositionBrandFixtures } from "../../../showcase/shared/composition-brand-fixtures.js";
import "../src/styles.css";
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); host.style.width = "375px"; document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const copy = { label: "제목", editLabel: "수정", saveLabel: "저장", cancelLabel: "취소", errorLabel: "저장 실패" };

it("preserves a failed draft, suppresses IME submits and retries with the same input", async () => {
  const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
  await act(async () => root.render(<HjmProvider><InlineEdit id="a" value="기존" {...copy} onSave={save} /></HjmProvider>));
  await act(async () => page.getByRole("button", { name: "수정", exact: true }).click());
  await act(async () => page.getByRole("textbox", { name: "제목", exact: true }).fill("새 제목"));
  await act(async () => host.querySelector("input")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true })));
  expect(save).not.toHaveBeenCalled();
  await act(async () => page.getByRole("button", { name: "저장", exact: true }).click());
  expect(host.querySelector("input")!.value).toBe("새 제목");
  expect(host.querySelector('[role="alert"]')?.textContent).toBe("저장 실패");
  await act(async () => page.getByRole("button", { name: "저장", exact: true }).click());
  expect(save.mock.calls.map(call => call[0])).toEqual(["새 제목", "새 제목"]);
  expect(host.querySelector("input")).toBeNull();
});

it("blocks repeated saves and ignores a previous entity's late completion", async () => {
  let finish!: () => void;
  const save = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const render = (id: string) => <HjmProvider><InlineEdit id={id} value={id} {...copy} onSave={save} /></HjmProvider>;
  await act(async () => root.render(render("a")));
  await act(async () => page.getByRole("button", { name: "수정", exact: true }).click());
  const button = [...host.querySelectorAll("button")].find(node => node.textContent === "저장")!;
  await act(async () => { button.click(); button.click(); });
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => root.render(render("b")));
  await act(async () => page.getByRole("button", { name: "수정", exact: true }).click());
  await act(async () => page.getByRole("textbox", { name: "제목", exact: true }).fill("B 초안"));
  await act(async () => finish());
  expect(host.querySelector("input")!.value).toBe("B 초안");
});

it("keeps stable row drafts through reorder and moves focus to a surviving row after removal", async () => {
  function Demo() {
    const [ids, setIds] = useState(["a", "b"]);
    return <><button onClick={() => setIds(previous => [...previous].reverse())}>순서 변경</button>
      <RepeatableFieldGroup descriptor={{ label: "참여자", fields: ids.map(id => ({ id, label: id })) }}
        addLabel="추가" removeLabel={id => `${id} 삭제`} maxFields={3} onAdd={() => { setIds(previous => [...previous, "c"]); return "c"; }} onRemove={id => setIds(previous => previous.filter(value => value !== id))}
        renderField={({ controlProps, focusRef }) => <TextField {...controlProps} ref={focusRef} defaultValue="" />} /></>;
  }
  await act(async () => root.render(<HjmProvider><Demo /></HjmProvider>));
  await act(async () => page.getByRole("textbox", { name: "a", exact: true }).fill("A 초안"));
  const first = host.querySelector("input");
  await act(async () => page.getByRole("button", { name: "순서 변경", exact: true }).click());
  expect(host.querySelectorAll("input")[1]).toBe(first);
  expect(first!.value).toBe("A 초안");
  await act(async () => page.getByRole("button", { name: "b 삭제", exact: true }).click());
  expect(document.activeElement).toBe(first);
  await act(async () => page.getByRole("button", { name: "추가", exact: true }).click());
  expect(document.activeElement).toBe(host.querySelectorAll("input")[1]);
});

it("freezes the selected operation scope and preserves failures for retry", async () => {
  let reject!: (reason: Error) => void;
  const mutation = vi.fn((_id: string, _scope: readonly string[]) => new Promise<void>((_resolve, fail) => { reject = fail; }));
  const props = { selectionLabel: (n: number) => `${n}개 선택`, clearLabel: "해제", onClear: vi.fn(), actions: [{ id: "archive", label: "보관" }], onAction: mutation, errorLabel: "보관 실패" };
  const selected = ["a"];
  await act(async () => root.render(<HjmProvider><SelectionActionBar {...props} selectedIds={selected} /></HjmProvider>));
  await act(async () => { const button = host.querySelector("button")!; button.click(); button.click(); });
  selected.push("b");
  expect(mutation).toHaveBeenCalledTimes(1);
  expect(mutation.mock.calls[0]![1]).toEqual(["a"]);
  await act(async () => reject(new Error("offline")));
  expect(host.querySelector('[role="alert"]')?.textContent).toBe("보관 실패");
  expect(props.onClear).not.toHaveBeenCalled();
});

it("does not offer a zero-result recovery or apply filters before the user acts", async () => {
  const apply = vi.fn();
  await act(async () => root.render(<HjmProvider><FilterRecovery title="결과 없음" errorLabel="실패" options={[{ id: "zero", label: "기간", resultCount: 0 }, { id: "topic", label: "주제", resultCount: 4 }]}
    optionLabel={option => `${option.label} 해제 · ${option.resultCount}건`} onApply={apply} /></HjmProvider>));
  expect(host.querySelectorAll("button")).toHaveLength(1);
  expect(apply).not.toHaveBeenCalled();
  await act(async () => page.getByRole("button", { name: "주제 해제 · 4건", exact: true }).click());
  expect(apply).toHaveBeenCalledWith("topic");
});

it("reorders existing columns and keeps the final visible column available", async () => {
  function Demo() {
    const [columns, setColumns] = useState<readonly ColumnSetting[]>([{ id: "a", label: "이름", visible: true }, { id: "b", label: "점수", visible: false }]);
    return <TableColumnSettings label="열 설정" columns={columns} earlierLabel={c => `${c.label} 앞으로`} laterLabel={c => `${c.label} 뒤로`} onColumnsChange={setColumns} />;
  }
  await act(async () => root.render(<HjmProvider><Demo /></HjmProvider>));
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.disabled).toBe(true);
  await act(async () => page.getByRole("button", { name: "점수 앞으로", exact: true }).click());
  expect([...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].map(input => input.checked)).toEqual([false, true]);
});

it("keeps all five compositions within a narrow host and inherits two brands in light and dark", async () => {
  // A real host insets its content (screen gutter 16). Row-end tools overhang into that inset by design (IconButton
  // edge="end", 2026-10-17 audit), so the narrow-host check models the gutter instead of a zero-padding box.
  host.style.boxSizing = "border-box";
  host.style.paddingInline = "16px";
  for (const [brand, palette] of Object.entries(compositionBrandFixtures)) for (const theme of ["light", "dark"] as const) {
    await act(async () => root.render(<HjmProvider theme={theme} brandPalette={palette}>
      <InlineEdit id={`${brand}-${theme}`} value="제목" {...copy} onSave={() => undefined} />
      <RepeatableFieldGroup descriptor={{ label: "추가 항목", fields: [{ id: "alias", label: "별칭" }] }} addLabel="추가" removeLabel={() => "삭제"} onAdd={() => undefined} onRemove={() => undefined}
        renderField={({ controlProps, focusRef }) => <TextField {...controlProps} ref={focusRef} />} />
      <SelectionActionBar selectedIds={["a"]} selectionLabel={n => `${n}개 선택`} clearLabel="해제" onClear={() => undefined} actions={[{ id: "archive", label: "보관" }]} onAction={() => undefined} errorLabel="실패" />
      <FilterRecovery title="결과 없음" options={[{ id: "topic", label: "주제 해제", resultCount: 3 }]} optionLabel={o => `${o.label} · ${o.resultCount}개`} onApply={() => undefined} errorLabel="실패" />
      <TableColumnSettings label="열 설정" columns={[{ id: "name", label: "이름", visible: true }, { id: "count", label: "개수", visible: true }]} earlierLabel={c => `${c.label} 앞으로`} laterLabel={c => `${c.label} 뒤로`} onColumnsChange={() => undefined} />
    </HjmProvider>));
    await act(async () => page.getByRole("button", { name: "수정", exact: true }).click());
    const save = [...host.querySelectorAll("button")].find(node => node.textContent === "저장")!;
    const hex = palette[theme].primary;
    const rgb = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
    expect(getComputedStyle(save).backgroundColor).toBe(`rgb(${rgb.join(", ")})`);
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
  }
});

it("keeps a referenced row editable while its removal is disabled", async () => {
  const remove = vi.fn(), edit = vi.fn();
  const render = (locked: boolean) => <HjmProvider><RepeatableFieldGroup
    descriptor={{ label: "참여자", fields: [{ id: "a", label: "이름" }, { id: "b", label: "다른 이름" }] }}
    addLabel="추가" removeLabel={id => `${id} 삭제`} isRemoveDisabled={id => locked && id === "a"}
    onAdd={() => undefined} onRemove={remove}
    renderField={({ controlProps, guardChange, focusRef }) => <TextField {...controlProps} ref={focusRef} onValueChange={guardChange(edit)} />}
  /></HjmProvider>;
  await act(async () => root.render(render(true)));
  expect((host.querySelector('[aria-label="a 삭제"]') as HTMLButtonElement).disabled).toBe(true);
  const input = host.querySelector('input')!;
  expect(input.disabled).toBe(false);
  await page.getByRole('textbox', { name: '이름', exact: true }).fill('새 이름');
  expect(edit).toHaveBeenCalledWith('새 이름');
  await act(async () => root.render(render(false)));
  await page.getByRole('button', { name: 'a 삭제', exact: true }).click();
  expect(remove).toHaveBeenCalledWith('a');
});
