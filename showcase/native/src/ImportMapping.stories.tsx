import type { Meta, StoryObj } from "@storybook/react-native";
import { ImportMappingPreview } from "./data-workflows-preview";
import { Container } from "@hjmds/react-native/primitives";
const meta = { title: "실험/구성/입력과 작성/가져오기 열 연결", component: ImportMappingPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof ImportMappingPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
