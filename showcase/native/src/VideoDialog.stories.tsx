import type { Meta, StoryObj } from "@storybook/react-native";
import { VideoDialogPreview } from "./video-dialog-preview";
const meta = { includeStories: ["Default", "Dark", "LargeText"], title: "실험/구성/정보 표시/영상 미리보기", component: VideoDialogPreview } satisfies Meta<typeof VideoDialogPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
