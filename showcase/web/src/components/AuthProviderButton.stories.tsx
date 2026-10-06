import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { AuthProviderButtonPendingPreview } from "./component-state-previews";

// Individual AuthProviderButton item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-actions--auth-provider-button keeps the same preview for old links.
const meta = { id: "components-actions-auth-provider-button", title: "배포/컴포넌트/동작/소셜 로그인 버튼", component: ContractStory, args: { name: "AuthProviderButton" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Pending: Story = { name: "처리 중", render: () => <AuthProviderButtonPendingPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
