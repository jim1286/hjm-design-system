import type { Meta, StoryObj } from "@storybook/react-native";
import { BulkSelectionPreview } from "./collection-editing-preview";
import { Container } from "@hjmds/react-native/primitives";
const meta = { title: "실험/구성/선택과 필터/선택 항목 묶음 작업", component: BulkSelectionPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof BulkSelectionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
