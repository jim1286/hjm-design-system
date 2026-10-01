import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/동작/하단 실행 버튼", component: NativeComponentPreview, args: { componentId: "bottom-cta", variant: "default" }, parameters: { hjm: { componentIds: ["bottom-cta"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
