import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { AuthScreenLayoutPreview } from "../patterns/Agreement.previews.js";

// Individual AuthScreenLayout item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--auth-screen-layout keeps the same preview for old links.
const meta = { id: "components-layout-auth-screen-layout", title: "배포/컴포넌트/레이아웃/로그인 화면", component: ContractStory, args: { name: "AuthScreenLayout" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", render: () => <AuthScreenLayoutPreview loading /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
