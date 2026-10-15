import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitActionPreview } from "./TaskControls.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-task-splitaction", title: "실험/구성/입력과 작성/분할 실행", component: SplitActionPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof SplitActionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
