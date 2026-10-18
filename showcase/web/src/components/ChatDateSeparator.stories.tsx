// Catalog scaffold. Keep custom examples here; metadata is checked against catalog.ts.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
const meta = { id: "components-data-display-chat-date-separator", title: "실험/컴포넌트/데이터 표시/대화 날짜 구분", component: ContractStory, args: { name: "ChatDateSeparator" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
