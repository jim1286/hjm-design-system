import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "@hjmds/react/popover";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Switch } from "@hjmds/react/selection";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const records = [
  { id: "walk", title: "느리게 걸었던 오후", favorite: true },
  { id: "meal", title: "함께 먹은 저녁", favorite: false },
  { id: "view", title: "창밖으로 본 풍경", favorite: true },
];
export function PopoverPreview() {
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState(""); const [favorite, setFavorite] = useState(false);
  const [applied, setApplied] = useState({ query: "", favorite: false });
  const visible = records.filter((record) => record.title.includes(applied.query) && (!applied.favorite || record.favorite));
  return <Section title="다시 보고 싶은 순간" description="제목과 즐겨찾기로 기록을 찾아보세요."><Stack gap="md">
    <Popover open={open} onOpenChange={(next) => { if (next) { setDraft(applied.query); setFavorite(applied.favorite); } setOpen(next); }} title="기록을 골라봐요" closeLabel="닫기" trigger={<Button tone="secondary">필터</Button>}>
      {({ close }) => <form onSubmit={(event) => { event.preventDefault(); setApplied({ query: draft.trim(), favorite }); close(); }}><Stack gap="md">
        <TextField label="제목에 들어간 말" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Switch label="즐겨찾기만 보기" checked={favorite} onCheckedChange={setFavorite} />
        <Button type="submit">적용하기</Button>
      </Stack></form>}
    </Popover>
    <p role="status">기록 {visible.length}개</p>
    {visible.length ? <List label="찾은 기록">{visible.map((record) => <ListRow key={record.id} title={record.title} description={record.favorite ? "즐겨찾기한 기록" : "일상의 기록"} />)}</List> : <Notice title="조건에 맞는 기록이 없어요" description="검색어를 줄이거나 즐겨찾기 조건을 바꿔보세요." />}
    <Button tone="ghost" onClick={() => setApplied({ query: "", favorite: false })}>필터 초기화</Button>
  </Stack></Section>;
}
export function ConfirmPopoverPreview() {
  const [archived, setArchived] = useState(false); const cancel = useRef<HTMLButtonElement>(null);
  const archiveButton = useRef<HTMLButtonElement>(null); const undoButton = useRef<HTMLButtonElement>(null); const previous = useRef(archived);
  useEffect(() => {
    // Archiving replaces the trigger; the product sends focus to the available undo action.
    if (previous.current !== archived) (archived ? undoButton : archiveButton).current?.focus();
    previous.current = archived;
  }, [archived]);
  return <Section title="기록을 정리해요" description="자주 보지 않는 기록은 잠시 보관할 수 있어요."><Stack gap="md">
    <List label="내 기록"><ListRow title="느리게 걸었던 오후" description={archived ? "보관함에 있어요" : "일상의 기록"} /></List>
    {archived ? <><Notice tone="success" title="보관함으로 옮겼어요" /><Button ref={undoButton} tone="secondary" onClick={() => setArchived(false)}>보관 취소</Button></> :
      <Popover title="이 기록을 보관할까요?" description="보관을 취소하면 다시 꺼낼 수 있어요." closeLabel="닫기" trigger={<Button ref={archiveButton} tone="secondary">기록 보관하기</Button>} initialFocusRef={cancel}>
        {({ close }) => <Stack gap="sm"><Button ref={cancel} tone="secondary" onClick={close}>계속 보기</Button><Button onClick={() => { close(); setArchived(true); }}>보관하기</Button></Stack>}
      </Popover>}
  </Stack></Section>;
}
const meta = { title: "Patterns/Popover", component: PopoverPreview } satisfies Meta<typeof PopoverPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Filters: Story = {};
export const ReversibleConfirmation: Story = { render: () => <ConfirmPopoverPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
