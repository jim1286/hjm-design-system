import type { Meta, StoryObj } from "@storybook/react-native";
import { OverviewPreview } from "./design-profile-preview";
const meta = { title: "실험/컴포넌트/레이아웃/목록 화면 골격", component: OverviewPreview, parameters: { hjm: { optionalEntry: "design-profile" } } } satisfies Meta<typeof OverviewPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
