import { useState } from "react";
import { SegmentedControl, IconButton } from "@hjmds/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { SegmentedPillsPreview } from "./component-state-previews";

// Individual SegmentedControl item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-inputs--segmented-control keeps the same preview for old links.
const meta = { id: "components-inputs-segmented-control", title: "배포/컴포넌트/입력/버튼형 선택", component: ContractStory, args: { name: "SegmentedControl" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pills: Story = { name: "알약 모양", render: () => <SegmentedPillsPreview /> };
export const Disabled: Story = { name: "비활성", render: () => <SegmentedPillsPreview disabled /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
// 1.13.1: pills keep their row at large text (wrap here, one line in a rail) instead of stacking a column.
export const PillsLargeText: Story = { ...Pills, name: "알약 모양 · 큰 글자", globals: { textScale: "2" } };

// Unpublished: the rail owns overflow and the action stays outside its radio group.
function ScrollRailPreview() {
  const [items, setItems] = useState(Array.from({length:6}, (_, index) => ({value:String(index),label:`장소 ${index+1}`,accessibilityLabel:`방문 장소 ${index+1}`})));
  const [value, setValue] = useState("0");
  return <div style={{maxWidth:320}}><SegmentedControl label="장소" presentation="pills" overflow="scroll" value={value} onValueChange={setValue} items={items}
    actions={<IconButton label="장소 추가" size="small" shape="circle" onClick={() => {
      const next = String(items.length); setItems(previous => [...previous, {value:next,label:`장소 ${items.length+1}`,accessibilityLabel:`방문 장소 ${items.length+1}`}]); setValue(next);
    }}><span aria-hidden="true">＋</span></IconButton>} /></div>;
}
export const ScrollRail: Story = {name:"가로 필터와 고정 행동 · 미게시", render:() => <ScrollRailPreview />};
