import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoDialogPreview } from "./video-dialog-preview.js";
const meta = { includeStories: ["Default", "Dark"], id: "compositions-information-video-preview", title: "배포/구성/정보 표시/영상 미리보기", component: VideoDialogPreview } satisfies Meta<typeof VideoDialogPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
