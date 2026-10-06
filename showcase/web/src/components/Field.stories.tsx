import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { FieldStatePreview } from "./component-state-previews";

// Individual Field item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-inputs--field keeps the same preview for old links.
const meta = { id: "components-inputs-field", title: "배포/컴포넌트/입력/입력 필드", component: ContractStory, args: { name: "Field" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Error: Story = { name: "오류", render: () => <FieldStatePreview state="error" /> };
export const Disabled: Story = { name: "비활성", render: () => <FieldStatePreview state="disabled" /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
