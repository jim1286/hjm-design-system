import type { Meta, StoryObj } from "@storybook/react-native";
import { DataLayoutPreview } from "../data-layout-preview";
const meta = { title: "배포/컴포넌트/레이아웃/높이가 다른 카드 배치", component: DataLayoutPreview, args: { mode: "masonry" }, parameters: { hjm: { componentIds: ["masonry"] }, controls: { exclude: ["mode"] } } } satisfies Meta<typeof DataLayoutPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
