import type { Meta, StoryObj } from "@storybook/react-vite";
import { FunnelPreview } from "./DataWorkflows.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-data-conversionfunnel", title: "실험/구성/정보 표시/전환 퍼널", component: FunnelPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof FunnelPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
