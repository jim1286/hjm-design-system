import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColumnSettingsPreview } from "./CollectionEditing.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-collection-columnsettings", title: "실험/구성/선택과 필터/표 열 설정", component: ColumnSettingsPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof ColumnSettingsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
