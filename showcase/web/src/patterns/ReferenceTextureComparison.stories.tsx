import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "@hjmds/react/layout";
import { TextureComparisonPreview } from "./texture-comparison-preview";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-texturecomparison", title: "배포/구성/정보 표시/질감 비교", component: TextureComparisonPreview, parameters: { hjm: { optionalEntry: "effect-surface" } }, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof TextureComparisonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
