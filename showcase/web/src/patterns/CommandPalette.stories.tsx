import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DataTableSortState } from "@hjmds/design-contracts/components/data-table";
import { CommandPalette } from "@hjmds/react/command-palette";
import { DataTable } from "@hjmds/react/data-table";
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const commands = [
  { id: "write", label: "새 기록 쓰기", textValue: "새 기록 쓰기", description: "오늘 있었던 일을 남겨요", shortcut: "N" },
  { id: "search", label: "기록 찾기", textValue: "기록 찾기", description: "제목으로 찾아봐요" },
  { id: "archive", label: "보관함 열기", textValue: "보관함 열기" },
  { id: "delete", label: "기록 지우기", textValue: "기록 지우기", description: "되돌릴 수 없어요", tone: "danger" as const },
];

export function CommandPalettePreview() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const items = commands.filter((command) => command.label.includes(query.trim()));
  return (
    <Section title="빠르게 실행하기" description="원하는 일을 검색해 바로 실행해요.">
      <Stack gap="md">
        {/*
          The palette does not own its opening shortcut: which key combination
          opens it is a product decision, so the showcase opens it with a button.
        */}
        <CommandPalette
          open={open}
          onOpenChange={(next) => { setOpen(next); if (next) setQuery(""); }}
          trigger={<Button tone="secondary">명령 열기</Button>}
          descriptor={{ accessibilityLabel: "명령 팔레트", searchPlaceholder: "무엇을 할까요" }}
          source={{ items }}
          query={query}
          onQueryChange={setQuery}
          onActivate={(id) => setDone(commands.find((command) => command.id === id)?.label ?? id)}
          {...(items.length === 0 ? { queryState: { asyncState: { status: "empty" as const, message: "찾는 명령이 없어요" } } } : {})}
        />
        {done ? <Notice tone="success" title={`${done}을(를) 실행했어요`} /> : null}
      </Stack>
    </Section>
  );
}

const records = [
  { id: "walk", title: "느리게 걸었던 오후", day: "9월 12일", place: "골목" },
  { id: "meal", title: "함께 먹은 저녁", day: "9월 14일", place: "집" },
  { id: "view", title: "창밖으로 본 풍경", day: "9월 15일", place: "사무실" },
];

export function DataTablePreview() {
  const [sortState, setSortState] = useState<DataTableSortState<string>>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  // The product sorts its own data; the table only judges the next sort intent.
  const sorted = sortState === null ? records : [...records].sort((left, right) => {
    const key = sortState.columnId as "title" | "day" | "place";
    const compared = left[key].localeCompare(right[key], "ko");
    return sortState.direction === "ascending" ? compared : -compared;
  });
  return (
    <Section title="기록 한눈에 보기" description="정렬하고 골라서 한 번에 정리해요.">
      <Stack gap="md">
        <DataTable
          columns={[
            { id: "title", header: "제목", sortable: true },
            { id: "day", header: "날짜", sortable: true },
            { id: "place", header: "장소" },
          ]}
          rows={sorted.map((record) => ({ id: record.id }))}
          labels={{
            table: "내 기록 표",
            selectAll: "모든 기록 선택",
            selectRow: (id) => `${records.find((record) => record.id === id)?.title ?? id} 선택`,
            sortColumn: (headerText, direction) =>
              `${headerText} 정렬${direction ? (direction.direction === "ascending" ? ", 오름차순" : ", 내림차순") : ""}`,
          }}
          renderCell={(rowId, columnId) => records.find((record) => record.id === rowId)?.[columnId as "title" | "day" | "place"]}
          sortState={sortState}
          onSortChange={setSortState}
          selection={{ mode: "multiple", selectedKeys: selected, onSelectionChange: setSelected }}
          footer={<p role="status">{selected.size ? `${selected.size}개 골랐어요` : "고른 기록이 없어요"}</p>}
        />
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/CommandPalette", component: CommandPalettePreview } satisfies Meta<typeof CommandPalettePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const QuickActions: Story = {};
export const RecordTable: Story = { render: () => <DataTablePreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
