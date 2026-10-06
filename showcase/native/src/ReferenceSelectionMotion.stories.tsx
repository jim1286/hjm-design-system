import type { Meta, StoryObj } from "@storybook/react-native";
import { SelectionMotionPreview } from "./reference-adoption-previews";
const meta = { title: "실험/구성/직접 조작과 모션/선택 배경 이동", component: SelectionMotionPreview } satisfies Meta<typeof SelectionMotionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
