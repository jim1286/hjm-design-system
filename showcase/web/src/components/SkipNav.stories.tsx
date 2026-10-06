import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual SkipNav item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-infrastructure--skip-nav keeps the same preview for old links.
const meta = { id: "components-infrastructure-skip-nav", title: "배포/컴포넌트/기반 기능/본문 바로가기", component: ContractStory, args: { name: "SkipNav" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
