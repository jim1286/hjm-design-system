import type { Meta, StoryObj } from "@storybook/react-vite";
import { CorrelationPreview } from "./DataWorkflows.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-data-correlationmatrix", title: "실험/구성/정보 표시/상관 행렬", component: CorrelationPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof CorrelationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
