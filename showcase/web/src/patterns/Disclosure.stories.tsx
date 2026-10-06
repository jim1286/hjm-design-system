import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollapsiblePreview, ContextMenuPreview, MenubarPreview } from "./Disclosure.previews.js";

const meta = { includeStories: ["Default","PointerMenu","DesktopMenubar","Dark","LargeText"], id: "patterns-disclosure", title: "배포/구성/탐색과 이동/펼침과 메뉴", component: CollapsiblePreview } satisfies Meta<typeof CollapsiblePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const PointerMenu: Story = { name: "포인터 메뉴", render: () => <ContextMenuPreview /> };
export const DesktopMenubar: Story = { name: "데스크톱 메뉴 막대", render: () => <MenubarPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
