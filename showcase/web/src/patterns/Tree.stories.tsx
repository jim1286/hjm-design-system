import type { Meta, StoryObj } from "@storybook/react-vite";
import { TreePreview, TreeSelectPreview, CascaderPreview } from "./Tree.previews.js";

const meta = { includeStories: ["Default","TreeSelectComposition","CascaderComposition","Dark","LargeText"], id: "patterns-tree", title: "배포/컴포넌트/데이터 표시/트리 목록", component: TreePreview } satisfies Meta<typeof TreePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const TreeSelectComposition: Story = { name: "트리 선택 조합", render: () => <TreeSelectPreview /> };
export const CascaderComposition: Story = { name: "단계별 선택 조합", render: () => <CascaderPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
