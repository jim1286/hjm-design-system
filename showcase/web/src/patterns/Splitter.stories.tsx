import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Splitter } from "@hjmds/react/splitter";
import { Button } from "@hjmds/react/actions";
import { List, ListRow } from "@hjmds/react/display";
import { Stack, Section } from "@hjmds/react/layout";

const records = [
  { id: "walk", title: "느리게 걸었던 오후", body: "골목을 한 바퀴 돌았어요. 담벼락의 고양이는 오늘도 자고 있었습니다." },
  { id: "meal", title: "함께 먹은 저녁", body: "국이 좀 짰지만 이야기가 길어서 좋았어요." },
  { id: "view", title: "창밖으로 본 풍경", body: "구름이 낮게 지나갔어요. 비는 오지 않았습니다." },
];

export function SplitterPreview() {
  const [selected, setSelected] = useState(records[0]!.id);
  // The product owns both the unit and the persisted value; here it is a
  // percentage of the workspace, saved as the drag or the arrow keys settle.
  const [width, setWidth] = useState(35);
  const [saved, setSaved] = useState(35);
  const record = records.find((entry) => entry.id === selected)!;
  return (
    <Section title="기록 훑어보기" description="목록과 본문의 경계를 원하는 대로 옮겨 보세요.">
      <Stack gap="md">
        <p role="status">저장된 목록 폭 {saved}%</p>
        <Splitter
          label="목록 폭 조절"
          min={20}
          max={60}
          step={5}
          value={width}
          onValueChange={setWidth}
          onValueChangeEnd={setSaved}
          getValueText={(value) => `${value}%`}
          className="hjm-showcase-splitter-stage"
          primaryPane={
            <List label="내 기록">
              {records.map((entry) => (
                <ListRow key={entry.id} title={entry.title}
                  trailing={<Button tone={entry.id === selected ? "primary" : "ghost"} onClick={() => setSelected(entry.id)}>보기</Button>} />
              ))}
            </List>
          }
          secondaryPane={
            <Stack gap="sm" className="hjm-showcase-splitter-pane">
              <h3>{record.title}</h3>
              <p>{record.body}</p>
            </Stack>
          }
        />
      </Stack>
    </Section>
  );
}

export function VerticalSplitterPreview() {
  const [height, setHeight] = useState(50);
  return (
    <Section title="위아래로 나눠 보기" description="세로 축에서는 위/아래 방향키가 크기를 바꿉니다.">
      <Splitter
        label="미리보기 높이 조절"
        axis="vertical"
        min={25}
        max={75}
        step={5}
        value={height}
        onValueChange={setHeight}
        getValueText={(value) => `${value}%`}
        className="hjm-showcase-splitter-stage"
        primaryPane={
          <Stack gap="sm" className="hjm-showcase-splitter-pane">
            <h3>쓰는 곳</h3>
            <p>{records.map((entry) => entry.title).join(" · ")}</p>
          </Stack>
        }
        secondaryPane={
          <Stack gap="sm" className="hjm-showcase-splitter-pane">
            <h3>미리보기</h3>
            <p>{records[0]!.body}</p>
          </Stack>
        }
      />
    </Section>
  );
}

const meta = { title: "Patterns/Splitter", component: SplitterPreview } satisfies Meta<typeof SplitterPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ListAndDetail: Story = {};
export const VerticalAxis: Story = { render: () => <VerticalSplitterPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
