import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { MediaSelectionJobPreview } from "../patterns/media-selection-job.previews.js";

// Individual MediaSelectionScreen item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--media-selection-screen keeps the same preview for old links.
const meta = { id: "components-layout-media-selection-screen", title: "배포/컴포넌트/레이아웃/미디어 선택 화면", component: ContractStory, args: { name: "MediaSelectionScreen" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// HJM 1.32 `disabled`: held in the running state, where the host job locks move/rotate/remove and the primary action is pending.
export const Pending: Story = { name: "처리 중", render: () => <MediaSelectionJobPreview running /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
