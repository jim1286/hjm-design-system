// Catalog scaffold. Keep custom examples here; metadata is checked against catalog.ts.
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "실험/컴포넌트/상태와 알림/입력 중 표시", component: NativeComponentPreview, args: { componentId: "typing-indicator", variant: "default" }, parameters: { hjm: { componentIds: ["typing-indicator"] }, controls: { disable: true } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
