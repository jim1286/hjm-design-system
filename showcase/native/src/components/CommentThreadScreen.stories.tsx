import { CommentRepliesPreview } from "./comment-thread-replies-preview";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/댓글 화면", component: NativeComponentPreview, args: { componentId: "comment-thread-screen", variant: "default" }, parameters: { hjm: { componentIds: ["comment-thread-screen"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const RepliesRecovery: Story = { name: "답글 실패와 복구", render: () => <CommentRepliesPreview /> };
