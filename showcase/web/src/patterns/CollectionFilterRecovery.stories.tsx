import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchRecoveryPreview } from "./CollectionEditing.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-collection-filterrecovery", title: "실험/구성/피드백과 복구/검색 필터 완화", component: SearchRecoveryPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof SearchRecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
