import type { Meta, StoryObj } from "@storybook/react-native";
import { DesignProfileComparison } from "./design-profile-preview";
const meta = { title: "실험/구성/비교와 검증/테마 조합", component: DesignProfileComparison } satisfies Meta<typeof DesignProfileComparison>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
