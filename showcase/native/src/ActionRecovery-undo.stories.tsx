import type { Meta, StoryObj } from "@storybook/react-native";
import { UndoRecoveryPreview } from "./action-recovery-previews";
const meta = { title: "배포/구성/피드백과 복구/보관과 실행 취소", component: UndoRecoveryPreview } satisfies Meta<typeof UndoRecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
