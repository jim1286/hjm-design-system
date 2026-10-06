import type { Meta, StoryObj } from "@storybook/react-vite";
import { UploadRecoveryPreview } from "./reference-adoption-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-uploadrecovery", title: "실험/구성/파일 전송/선택과 오류 복구", component: UploadRecoveryPreview } satisfies Meta<typeof UploadRecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
