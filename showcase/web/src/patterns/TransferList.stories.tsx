import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransferList } from "@hjmds/react/transfer-list";
import { Mentions, type MentionCandidate } from "@hjmds/react/mentions";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const records = [
  { id: "walk", label: "느리게 걸었던 오후", textValue: "느리게 걸었던 오후" },
  { id: "meal", label: "함께 먹은 저녁", textValue: "함께 먹은 저녁" },
  { id: "view", label: "창밖으로 본 풍경", textValue: "창밖으로 본 풍경" },
  { id: "rain", label: "비 오던 아침", textValue: "비 오던 아침" },
  { id: "locked", label: "잠긴 기록", textValue: "잠긴 기록", disabled: true },
];

export function TransferListPreview() {
  const [target, setTarget] = useState<ReadonlySet<string>>(new Set(["view"]));
  const [announcement, setAnnouncement] = useState("");
  const labelOf = (id: string) => records.find((record) => record.id === id)?.label ?? id;
  return (
    <Section title="모아볼 기록 고르기" description="담고 싶은 기록을 오른쪽으로 옮겨요.">
      <Stack gap="md">
        <TransferList
          items={records}
          targetKeys={target}
          onTargetKeysChange={setTarget}
          onMove={(ids, direction) => setAnnouncement(
            `${ids.map(labelOf).join(", ")}${direction === "toTarget" ? "을(를) 담았어요" : "을(를) 뺐어요"}`,
          )}
          labels={{
            source: "전체 기록", target: "모아둔 기록",
            toTarget: "담기 →", toSource: "← 빼기",
            selectAll: "모두 선택", empty: "여기에는 아직 없어요",
          }}
        />
        {/* The product owns the sentence; the renderer only reports which ids moved. */}
        <p role="status">{announcement}</p>
      </Stack>
    </Section>
  );
}

const people: readonly MentionCandidate[] = [
  { id: "mina", label: "미나", description: "같이 걷는 사람" },
  { id: "minsu", label: "민수", description: "저녁을 차린 사람" },
  { id: "jun", label: "준", description: "사진을 찍는 사람" },
];

export function MentionsPreview() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const candidates = query === null ? [] : people.filter((person) => person.label.startsWith(query));
  return (
    <Section title="함께한 사람을 적어요" description="@를 입력하면 이름을 골라 넣을 수 있어요.">
      <Stack gap="md">
        <Mentions
          label="오늘의 기록"
          description="이름 앞에 @를 붙이면 후보가 나와요."
          value={text}
          onValueChange={setText}
          triggers={[{ id: "person", trigger: "@" }]}
          candidates={candidates}
          onMentionQueryChange={(match) => setQuery(match?.query ?? null)}
          emptyMessage="찾는 사람이 없어요"
          listLabel="사람 후보"
        />
        <Button onClick={() => setSaved(text.trim())} disabled={text.trim().length === 0}>기록 저장하기</Button>
        {saved ? (
          <List label="저장한 기록"><ListRow title={saved} /></List>
        ) : <Notice title="아직 저장한 기록이 없어요" description="적고 나서 저장하면 여기에 남아요." />}
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/TransferList", component: TransferListPreview } satisfies Meta<typeof TransferListPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MovingRecords: Story = {};
export const MentionsInWriting: Story = { render: () => <MentionsPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
