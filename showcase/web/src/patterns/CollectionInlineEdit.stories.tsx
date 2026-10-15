import type { Meta, StoryObj } from "@storybook/react-vite";
import { InlineEditingPreview } from "./CollectionEditing.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-collection-inlineedit", title: "배포/구성/입력과 작성/제목 바로 편집", component: InlineEditingPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof InlineEditingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
