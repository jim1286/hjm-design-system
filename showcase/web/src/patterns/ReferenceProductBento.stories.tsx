import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductBentoPreview } from "./reference-adoption-previews";
// ScreenLayout fills its host height and scrolls its body, so the story canvas acts as the route host.
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-productbento", title: "배포/화면/소개/기능 카드와 주 행동", component: ProductBentoPreview, decorators: [(Story) => <div style={{ height: "100dvh" }}><Story /></div>] } satisfies Meta<typeof ProductBentoPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
