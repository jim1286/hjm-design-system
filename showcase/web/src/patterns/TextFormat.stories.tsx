import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextFormatPreview, ClipboardPreview, AvatarGroupPreview } from "./TextFormat.previews.js";

const meta = { includeStories: ["Default","Clipboard","GroupedAvatars","Dark","LargeText"], id: "patterns-textformat", title: "배포/컴포넌트/글자와 아이콘/글자 서식", component: TextFormatPreview } satisfies Meta<typeof TextFormatPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Clipboard: Story = { name: "클립보드", render: () => <ClipboardPreview /> };
export const GroupedAvatars: Story = { name: "아바타 그룹", render: () => <AvatarGroupPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
