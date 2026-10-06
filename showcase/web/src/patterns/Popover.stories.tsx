import type { Meta, StoryObj } from "@storybook/react-vite";
import { PopoverPreview, ConfirmPopoverPreview } from "./Popover.previews.js";

const meta = { includeStories: ["Default","ReversibleConfirmation","Dark","LargeText"], id: "patterns-popover", title: "배포/컴포넌트/오버레이/팝오버", component: PopoverPreview } satisfies Meta<typeof PopoverPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const ReversibleConfirmation: Story = { name: "취소 가능한 확인", render: () => <ConfirmPopoverPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
