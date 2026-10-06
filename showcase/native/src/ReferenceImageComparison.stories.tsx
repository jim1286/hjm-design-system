import type { Meta, StoryObj } from "@storybook/react-native";
import { ImageComparisonPreview } from "./reference-adoption-previews";
const meta = { title: "배포/컴포넌트/데이터 표시/이미지 전후 비교", component: ImageComparisonPreview } satisfies Meta<typeof ImageComparisonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
