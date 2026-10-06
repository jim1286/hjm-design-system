import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingPreview } from "./reference-adoption-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-rating", title: "배포/컴포넌트/입력/별점 선택", component: RatingPreview } satisfies Meta<typeof RatingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
