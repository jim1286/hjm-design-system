import { useState } from "react";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { IconButton } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
import { CategoryFilterPreview } from "../category-filter-preview";
const meta = { title: "배포/컴포넌트/입력/버튼형 선택", component: NativeComponentPreview, args: { componentId: "segmented-control", variant: "default" }, parameters: { hjm: { componentIds: ["segmented-control"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// 2026-10-06: the experimental 카테고리 필터 item was the same SegmentedControl with presentation="pills",
// so it became these two stories instead of a separate menu item (FINAL_MAPPING §2).
export const Pills: Story = { name: "알약 모양", render: () => <CategoryFilterPreview /> };
export const Disabled: Story = { name: "비활성", render: () => <CategoryFilterPreview disabled /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// 1.13.1: pills keep their row at large text (wrap here, one line in a rail) instead of stacking a column.
export const PillsLargeText: Story = { ...Pills, name: "알약 모양 · 큰 글자", globals: { textScale: "2" } };

// Unpublished: the rail owns overflow and the action stays outside its radio group.
function ScrollRailPreview() {
  const [items, setItems] = useState(Array.from({length:6}, (_, index) => ({value:String(index),label:`장소 ${index+1}`,accessibilityLabel:`방문 장소 ${index+1}`})));
  const [value, setValue] = useState("0");
  return <View style={{maxWidth:320}}><SegmentedControl label="장소" presentation="pills" overflow="scroll" value={value} onValueChange={setValue} items={items}
    actions={<IconButton label="장소 추가" size="small" shape="circle" onPress={() => {
      const next = String(items.length); setItems(previous => [...previous, {value:next,label:`장소 ${items.length+1}`,accessibilityLabel:`방문 장소 ${items.length+1}`}]); setValue(next);
    }}><Text>＋</Text></IconButton>} /></View>;
}
export const ScrollRail: Story = {name:"가로 필터와 고정 행동 · 미게시", render:() => <ScrollRailPreview />};
