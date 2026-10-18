import { useState } from "react";
import { View } from "react-native";
import { ImageChoiceGroup } from "@hjmds/react-native/image-choice";
import { Stack, Text, useHjmNativeTheme } from "@hjmds/react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/입력/이미지 선택", component: NativeComponentPreview, args: { componentId: "image-choice-group", variant: "default" }, parameters: { hjm: { componentIds: ["image-choice-group"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};

// Initial-letter face so the example needs no photo assets; products pass their own avatar or image.
function Face({ name }: { name: string }) {
  const { colors } = useHjmNativeTheme();
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceAlt }}><Text variant="title">{name.slice(0, 1)}</Text></View>;
}

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
  // The group is its own FlatList, so the story frame must not wrap it in a ScrollView.
  return <Stack gap="sm">
    <ImageChoiceGroup label="보낼 사람" showItemLabels virtualized={{ height: 320 }} selectionMode="multiple" value={value} onValueChange={setValue}
      items={people.map(person => ({ id: person.id, label: person.label, image: <Face name={person.label} /> }))} />
    <Text tone="muted" accessibilityLiveRegion="polite">{`${value.length}명 선택`}</Text>
  </Stack>;
}
export const LongList: Story = { name: "긴 목록", render: () => <LongListPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
