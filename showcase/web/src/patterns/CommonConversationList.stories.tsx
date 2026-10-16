import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConversationListPreview } from "./conversation-list-preview";
const meta = { id: "common-screen-conversation-list", title: "실험/화면/소통/대화 목록", component: ConversationListPreview } satisfies Meta<typeof ConversationListPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
