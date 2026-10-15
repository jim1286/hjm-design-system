import type { Meta, StoryObj } from "@storybook/react-vite";
import { RepeatableInputsPreview } from "./CollectionEditing.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-collection-repeatableinputs", title: "배포/구성/입력과 작성/반복 입력", component: RepeatableInputsPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof RepeatableInputsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
