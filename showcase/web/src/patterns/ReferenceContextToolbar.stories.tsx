import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "@hjmds/react/layout";
import { ContextToolbarPreview } from "./reference-adoption-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "reference-adoption-contexttoolbar", title: "배포/구성/입력과 작성/입력을 유지하는 도구", component: ContextToolbarPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof ContextToolbarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
