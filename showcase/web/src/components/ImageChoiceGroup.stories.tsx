import { useState } from "react";
import { ImageChoiceGroup } from "@hjmds/react/image-choice";
import { Stack, Text } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual ImageChoiceGroup item (2026-10-17): registered in the catalog as a beta input with its own radio/checkbox semantics.
const meta = { id: "components-inputs-imagechoicegroup", title: "배포/컴포넌트/입력/이미지 선택", component: ContractStory, args: { name: "ImageChoiceGroup" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };

// Initial-letter face so the example needs no photo assets; products pass their own avatar or image.
const Face = ({ name }: { name: string }) => <span style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", background: "var(--hjm-color-surface-alt)" }}><Text variant="title">{name.slice(0, 1)}</Text></span>;

function DescriptionPreview() {
  const sent = new Set(["seoyeon"]);
  const people = [{ id: "seoyeon", label: "서연" }, { id: "minjun", label: "아주 긴 닉네임을 쓰는 민준" }, { id: "jiwoo", label: "지우" }];
  const [value, setValue] = useState<string[]>(["seoyeon"]);
  // Sent recipients stay checked and locked; the status is the description line, not text appended to the name.
  return <ImageChoiceGroup label="보낼 사람" showLabel showItemLabels itemLabelLines={2} selectionMode="multiple" value={value}
    onValueChange={next => setValue([...sent, ...next.filter(id => !sent.has(id))])}
    items={people.map(person => ({ id: person.id, label: person.label, image: <Face name={person.label} />, ...(sent.has(person.id) ? { description: "보냄", disabled: true } : {}) }))} />;
}
export const DescriptionAndTwoLines: Story = { name: "설명 줄과 두 줄 이름", render: () => <DescriptionPreview /> };

function LongListPreview() {
  const people = Array.from({ length: 300 }, (_, index) => ({ id: `friend-${index}`, label: `친구 ${index + 1}` }));
  const [value, setValue] = useState<string[]>([]);
  return <Stack gap="sm">
    <ImageChoiceGroup label="보낼 사람" showItemLabels virtualized={{ height: 320 }} selectionMode="multiple" value={value} onValueChange={setValue}
      items={people.map(person => ({ id: person.id, label: person.label, image: <Face name={person.label} /> }))} />
    <Text role="status" tone="muted">{`${value.length}명 선택`}</Text>
  </Stack>;
}
export const LongList: Story = { name: "긴 목록", render: () => <LongListPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
