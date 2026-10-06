import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductBentoPreview } from "./reference-adoption-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-productbento", title: "배포/화면/소개/기능 카드와 주 행동", component: ProductBentoPreview } satisfies Meta<typeof ProductBentoPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
