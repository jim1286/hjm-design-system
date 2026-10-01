import { ToastPreview } from "../toast-preview";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/상태와 알림/토스트", component: NativeComponentPreview, args: { componentId: "toast", variant: "default" }, parameters: { hjm: { componentIds: ["toast"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", render: () => <ToastPreview/> };
export const Dark: Story = { name: "어두운 테마", render: () => <ToastPreview/>, globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", render: () => <ToastPreview/>, globals: { textScale: "2" } };
