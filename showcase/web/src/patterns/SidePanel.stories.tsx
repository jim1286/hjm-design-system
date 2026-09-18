import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidePanel } from "@hjmds/react/side-panel";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Switch } from "@hjmds/react/selection";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const records = [
  { id: "walk", title: "느리게 걸었던 오후", note: "골목을 한 바퀴 돌았어요" },
  { id: "meal", title: "함께 먹은 저녁", note: "국이 좀 짰지만 좋았어요" },
  { id: "view", title: "창밖으로 본 풍경", note: "구름이 낮게 지나갔어요" },
];

export function SidePanelPreview() {
  const [editing, setEditing] = useState<string | null>(null);
  const [notes, setNotes] = useState(() => new Map(records.map((record) => [record.id, record.note])));
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const current = records.find((record) => record.id === editing);
  const nameField = useRef<HTMLInputElement>(null);
  return (
    <Section title="기록 다듬기" description="목록에서 기록을 고르면 옆에서 바로 고칠 수 있어요.">
      <Stack gap="md">
        {saved ? <Notice tone="success" title="메모를 저장했어요" description={saved} /> : null}
        <List label="내 기록">
          {records.map((record) => (
            <ListRow key={record.id} title={record.title} description={notes.get(record.id)}
              trailing={<Button tone="secondary" onClick={() => { setDraft(notes.get(record.id) ?? ""); setEditing(record.id); }}>고치기</Button>} />
          ))}
        </List>
        <SidePanel
          open={editing !== null}
          onOpenChange={(next) => { if (!next) setEditing(null); }}
          title={current ? current.title : "기록"}
          description="메모만 바꿔요. 날짜와 사진은 그대로 있어요."
          closeLabel="닫기"
          initialFocusRef={nameField}
          footer={
            <>
              <Button tone="secondary" onClick={() => setEditing(null)}>그만두기</Button>
              <Button onClick={() => {
                if (!current) return;
                setNotes((previous) => new Map(previous).set(current.id, draft.trim()));
                setSaved(current.title);
                setEditing(null);
              }}>저장하기</Button>
            </>
          }
        >
          <TextField ref={nameField} label="메모" value={draft} onChange={(event) => setDraft(event.target.value)} />
        </SidePanel>
      </Stack>
    </Section>
  );
}

export function NonModalSidePanelPreview() {
  const [open, setOpen] = useState(true);
  const [compact, setCompact] = useState(false);
  const [checked, setChecked] = useState(0);
  return (
    <Section title="정리하면서 옆을 열어두기" description="비모달 패널은 열린 채로 본문을 계속 쓸 수 있어요.">
      <Stack gap="md">
        <Button tone="secondary" onClick={() => setOpen((previous) => !previous)}>
          {open ? "도움말 닫기" : "도움말 열기"}
        </Button>
        <List label="오늘 할 일">
          {records.map((record) => (
            <ListRow key={record.id} title={record.title} density={compact ? "compact" : "comfortable"}
              trailing={<Button tone="ghost" onClick={() => setChecked((previous) => previous + 1)}>끝냈어요</Button>} />
          ))}
        </List>
        <p role="status">{checked}개를 끝냈어요</p>
        <SidePanel
          open={open}
          onOpenChange={(next) => setOpen(next)}
          // Non-modal: the list beside it stays clickable, so the page keeps its
          // own scroll and focus while the panel is open.
          dismissPolicy={{ modal: false, dismissible: true, dismissWhileBusy: false, escapeDismiss: true }}
          edge="start"
          size="compact"
          title="정리하는 방법"
          closeLabel="닫기"
        >
          <Stack gap="sm">
            <p>끝낸 일은 아래로 내려가고, 남은 일만 위에 남아요.</p>
            <Switch label="목록 좁게 보기" checked={compact} onCheckedChange={setCompact} />
          </Stack>
        </SidePanel>
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/SidePanel", component: SidePanelPreview } satisfies Meta<typeof SidePanelPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ModalEditing: Story = {};
export const NonModalHelper: Story = { render: () => <NonModalSidePanelPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
