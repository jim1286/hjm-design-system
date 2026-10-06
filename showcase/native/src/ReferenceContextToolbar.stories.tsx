import type { Meta, StoryObj } from "@storybook/react-native";
import { ContextToolbarPreview } from "./reference-adoption-previews";
const meta = { title: "실험/구성/편집/입력을 유지하는 도구", component: ContextToolbarPreview } satisfies Meta<typeof ContextToolbarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
