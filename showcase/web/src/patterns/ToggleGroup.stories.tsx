import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroupPreview, TagsInputPreview } from "./ToggleGroup.previews.js";

const meta = { includeStories: ["Default","Tags","Dark","LargeText"], id: "patterns-togglegroup", title: "배포/컴포넌트/입력/토글 그룹", component: ToggleGroupPreview } satisfies Meta<typeof ToggleGroupPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Tags: Story = { name: "태그 모음", render: () => <TagsInputPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
