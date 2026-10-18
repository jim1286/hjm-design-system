// Catalog scaffold. Keep custom examples here; metadata is checked against catalog.ts.
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/대화 날짜 구분", component: NativeComponentPreview, args: { componentId: "chat-date-separator", variant: "default" }, parameters: { hjm: { componentIds: ["chat-date-separator"] }, controls: { disable: true } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
