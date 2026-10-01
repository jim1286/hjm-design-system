import type { Meta, StoryObj } from "@storybook/react-native";
import { DataLayoutPreview } from "../data-layout-preview";
const meta = { title: "배포/컴포넌트/데이터 표시/가상 목록", component: DataLayoutPreview, args: { mode: "virtual" }, parameters: { hjm: { componentIds: ["virtual-list"] }, controls: { exclude: ["mode"] } } } satisfies Meta<typeof DataLayoutPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
