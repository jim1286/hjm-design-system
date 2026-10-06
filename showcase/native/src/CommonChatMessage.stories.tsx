import type { Meta, StoryObj } from "@storybook/react-native";
import { ChatMessagePreview } from "./conversation-previews";
const meta = { title: "배포/구성/정보 표시/대화 메시지", component: ChatMessagePreview } satisfies Meta<typeof ChatMessagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
