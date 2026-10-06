import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdaptiveContentPreview } from "./reference-adoption-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-adaptivecontent", title: "배포/구성/직접 조작과 모션/높이가 이어지는 패널", component: AdaptiveContentPreview } satisfies Meta<typeof AdaptiveContentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
