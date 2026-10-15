import { useRef, useState } from "react";
import { InlineEdit, RepeatableFieldGroup, SelectionActionBar, FilterRecovery, TableColumnSettings } from "@hjmds/react/collection-editing";
import { TextField } from "@hjmds/react/forms";
import { Checkbox } from "@hjmds/react/selection";
import { Stack, Text } from "@hjmds/react/layout";
import { DataTable } from "@hjmds/react/data-table";
import type { ColumnSetting } from "@hjmds/design-contracts/collection-editing";
import type { DataTableColumnDescriptor } from "@hjmds/design-contracts/components/data-table";

export function InlineEditingPreview() {
  const [value, setValue] = useState("봄날의 기록"), [fail, setFail] = useState(false);
  return <Stack gap="md"><InlineEdit id="note-title" label="기록 제목" value={value} editLabel="제목 수정" saveLabel="저장" cancelLabel="취소" errorLabel="저장하지 못했어요. 입력은 유지됩니다."
    validate={draft => draft.trim() ? undefined : "제목을 입력하세요."} onSave={async next => { if (fail) throw new Error("fixture failure"); setValue(next); }} />
    <Checkbox label="저장 실패 상황" checked={fail} onCheckedChange={setFail} /></Stack>;
}

export function RepeatableInputsPreview() {
  const next = useRef(2), [rows, setRows] = useState([{ id: "person-1", value: "서연" }]);
  return <RepeatableFieldGroup descriptor={{ label: "함께하는 사람", fields: rows.map(row => ({ id: row.id, label: "이름" })) }}
    addLabel="사람 추가" removeLabel={id => `${rows.find(row => row.id === id)?.value || "이 사람"} 삭제`} minFields={1} maxFields={4}
    onAdd={() => { const id = `person-${next.current++}`; setRows(previous => [...previous, { id, value: "" }]); return id; }}
    onRemove={id => setRows(previous => previous.filter(row => row.id !== id))}
    renderField={({ id, controlProps, guardChange, focusRef }) => <TextField {...controlProps} ref={focusRef} value={rows.find(row => row.id === id)?.value ?? ""}
      onValueChange={guardChange((value: string) => setRows(previous => previous.map(row => row.id === id ? { ...row, value } : row)))} />} />;
}

const initialRecords = [{ id: "a", title: "산책 기록" }, { id: "b", title: "전시 기록" }, { id: "c", title: "주말 기록" }];
export function BulkSelectionPreview() {
  const [rows, setRows] = useState(initialRecords), [selected, setSelected] = useState<string[]>([]), [undo, setUndo] = useState<readonly string[] | null>(null), [fail, setFail] = useState(false);
  return <Stack gap="md">
    {rows.map(row => <Checkbox key={row.id} label={row.title} checked={selected.includes(row.id)} onCheckedChange={checked => setSelected(previous => checked ? [...previous, row.id] : previous.filter(id => id !== row.id))} />)}
    {!rows.length ? <Text>모든 기록을 보관했어요.</Text> : null}
    <SelectionActionBar selectedIds={selected} selectionLabel={count => `${count}개 선택`} clearLabel="선택 해제" onClear={() => setSelected([])} actions={[{ id: "archive", label: "선택 기록 보관" }]} errorLabel="보관하거나 복구하지 못했어요. 다시 시도하세요."
      onAction={async (_action, ids) => { if (fail) throw new Error("fixture failure"); setRows(previous => previous.filter(row => !ids.includes(row.id))); setUndo(ids); setSelected([]); }}
      {...(undo ? { recovery: { label: `방금 보관한 ${undo.length}개 복구`, onUndo: async () => { if (fail) throw new Error("fixture failure"); const scope = undo; setRows(previous => initialRecords.filter(row => scope.includes(row.id) || previous.some(item => item.id === row.id))); setUndo(null); } } } : {})} />
    <Checkbox label="보관·복구 실패 상황" checked={fail} onCheckedChange={setFail} />
  </Stack>;
}

export function SearchRecoveryPreview() {
  const records = [{ title: "산책", topic: "일상" }, { title: "전시", topic: "문화" }, { title: "독서", topic: "일상" }];
  const [topic, setTopic] = useState<string | null>("여행"), [fail, setFail] = useState(false);
  const shown = records.filter(row => topic === null || row.topic === topic);
  return <Stack gap="md">{shown.length ? shown.map(row => <Text key={row.title}>{row.title}</Text>) : <FilterRecovery title="맞는 기록이 없어요" description="선택한 주제를 해제하면 다른 기록을 볼 수 있어요."
    options={[{ id: "topic", label: "주제 필터 해제", resultCount: records.length }]} optionLabel={option => `${option.label} · ${option.resultCount}개 보기`} errorLabel="검색하지 못했어요. 필터는 유지됩니다."
    onApply={async () => { if (fail) throw new Error("fixture failure"); setTopic(null); }} />}
    <Checkbox label="검색 실패 상황" checked={fail} onCheckedChange={setFail} />
  </Stack>;
}

const sourceColumns: readonly DataTableColumnDescriptor[] = [{ id: "name", header: "이름", pinned: "start", width: 120 }, { id: "count", header: "기록 수", width: 100 }, { id: "year", header: "시작 연도", width: 120 }];
const tableLabels = { table: "기록 요약", selectAll: "전체 선택", selectRow: (id: string) => `${id} 선택`, sortColumn: (header: string) => `${header} 정렬` };
export function ColumnSettingsPreview() {
  const [columns, setColumns] = useState<readonly ColumnSetting[]>(sourceColumns.map(column => ({ id: column.id, label: column.header, visible: true, locked: column.pinned === "start" })));
  return <Stack gap="lg"><TableColumnSettings label="보여 줄 열과 순서" columns={columns} earlierLabel={column => `${column.label} 앞으로`} laterLabel={column => `${column.label} 뒤로`} onColumnsChange={setColumns} />
    <DataTable columns={columns.filter(column => column.visible).map(column => sourceColumns.find(item => item.id === column.id)!)} rows={[{ id: "a" }]} labels={tableLabels}
      renderCell={(_row, column) => column === "name" ? "서연" : column === "count" ? "12" : "2026"} />
  </Stack>;
}
