import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransferListPreview, MentionsPreview } from "./TransferList.previews.js";

const meta = { includeStories: ["Default","MentionsInWriting","Dark","LargeText"], id: "patterns-transferlist", title: "배포/컴포넌트/입력/목록 간 항목 이동", component: TransferListPreview } satisfies Meta<typeof TransferListPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const MentionsInWriting: Story = { name: "작성 중 사용자 언급", render: () => <MentionsPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
