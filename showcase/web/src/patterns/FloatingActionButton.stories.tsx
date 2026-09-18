import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "@hjmds/react/floating-action-button";
import { TopBar } from "@hjmds/react/top-bar";
import { List, ListRow } from "@hjmds/react/display";
import { Dialog } from "@hjmds/react/overlays";
import { TextArea } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";

export function FloatingNotesPreview() {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const layoutMode = useFloatingActionButtonScroll(target);
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(0));
  const [notes, setNotes] = useState(Array.from({ length: 18 }, (_, index) => `기억하고 싶은 순간 ${index + 1}`));
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState("");
  function save() { if (!draft.trim()) return; setNotes((items) => [draft.trim(), ...items]); setOpen(false); setDraft(""); target?.scrollTo({ top: 0 }); }
  return <>
    <div ref={setTarget} style={{ blockSize: "100dvh", overflowY: "auto" }}>
      <div style={{ paddingBottom: clearance }}>
        <TopBar title="나의 기록" />
        <List label="최근 기록">{notes.map((note, index) => <ListRow key={`${index}-${note}`} title={note} description="작은 순간도 모아두면 오래 남아요." />)}</List>
      </div>
    </div>
    <FloatingActionButton descriptor={{ label: "새 기록", icon: { name: "add" }, layoutMode }} renderIcon={() => <span>＋</span>}
      onContentClearanceChange={setClearance} onClick={() => setOpen(true)} />
    <Dialog title="어떤 순간을 남길까요?" open={open} onOpenChange={setOpen} closeLabel="닫기"
      footer={<Button disabled={!draft.trim()} onClick={save}>기록 추가</Button>}>
      <TextArea label="나의 기록" value={draft} onChange={(event) => setDraft(event.target.value)} />
    </Dialog>
  </>;
}

const meta = { title: "Patterns/Floating action button", component: FloatingNotesPreview, parameters: { layout: "fullscreen", hjm: { edgeToEdge: true } } } satisfies Meta<typeof FloatingNotesPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Notes: Story = {};
export const LargeText: Story = { globals: { textScale: "2" } };
