// Catalog scaffold. Keep custom examples here; metadata is checked against catalog.ts.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
const meta = { id: "components-feedback-typing-indicator", title: "배포/컴포넌트/상태와 알림/입력 중 표시", component: ContractStory, args: { name: "TypingIndicator" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
