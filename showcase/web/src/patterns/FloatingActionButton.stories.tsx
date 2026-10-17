import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingActionButton, useFloatingActionButtonScroll, resolveFloatingActionButtonContentClearance } from "@hjmds/react/floating-action-button";
import { ScreenLayout } from "@hjmds/react/screens";
import { Icon, List, ListRow } from "@hjmds/react/display";
import { Dialog } from "@hjmds/react/overlays";
import { TextArea } from "@hjmds/react/forms";
import { Container } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";

export function FloatingNotesPreview() {
  // Pointer activation does not focus buttons in Safari; identify the actual opener explicitly.
  const composerTrigger = useRef<HTMLButtonElement>(null);
  // The shared screen shell scrolls with the document, so the hook follows window scrolling.
  const layoutMode = useFloatingActionButtonScroll();
  const [clearance, setClearance] = useState(resolveFloatingActionButtonContentClearance(0));
  const [notes, setNotes] = useState(Array.from({ length: 18 }, (_, index) => `기억하고 싶은 순간 ${index + 1}`));
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState("");
  // A second queued press can arrive before the closing render commits.
  const savedInSession = useRef(false);
  function start() { savedInSession.current = false; setOpen(true); }
  function save() { if (savedInSession.current || !draft.trim()) return; savedInSession.current = true; setNotes((items) => [draft.trim(), ...items]); setOpen(false); setDraft(""); window.scrollTo({ top: 0 }); }
  return <>
    <ScreenLayout title="나의 기록" contentInset="none">
      {/* The reading Container owns the side gutter, so the shell adds no second body inset. */}
      <Container size="reading" layoutStyle={{ marginBottom: clearance }}><List label="최근 기록">{notes.map((note, index) => <ListRow key={`${index}-${note}`} title={note} description="작은 순간도 모아두면 오래 남아요." />)}</List></Container>
    </ScreenLayout>
    <FloatingActionButton ref={composerTrigger} descriptor={{ label: "새 기록", icon: { name: "add" }, layoutMode }} renderIcon={() => <Icon name="add" tone="inverse" />}
      onContentClearanceChange={setClearance} onClick={start} />
    <Dialog title="어떤 순간을 남길까요?" open={open} onOpenChange={setOpen} closeLabel="닫기" returnFocusRef={composerTrigger}
      footer={<Button disabled={!draft.trim()} onClick={save}>기록 추가</Button>}>
      <TextArea label="나의 기록" value={draft} onChange={(event) => setDraft(event.target.value)} />
    </Dialog>
  </>;
}

const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-floating-action-button", title: "배포/구성/입력과 작성/빠른 메모 작성", component: FloatingNotesPreview, parameters: { layout: "fullscreen", hjm: { edgeToEdge: true } } } satisfies Meta<typeof FloatingNotesPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
