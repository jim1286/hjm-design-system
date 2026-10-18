import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { ModerationFormPreview, ModerationReviewPreview } from "../patterns/flow-variants.previews.js";

// Individual ModerationScreen item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--moderation-screen keeps the same preview for old links.
const meta = { id: "components-layout-moderation-screen", title: "배포/컴포넌트/레이아웃/신고 화면", component: ContractStory, args: { name: "ModerationScreen" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Review: Story = { name: "운영자 검토", render: () => <ModerationReviewPreview /> };
export const Inline: Story = { name: "편지 안 신고", render: () => <ModerationFormPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
