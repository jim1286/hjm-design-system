import type { Meta, StoryObj } from "@storybook/react-native";
import { AccountSwitcherPreview } from "./task-controls-preview";
import { Container } from "@hjmds/react-native/primitives";
const meta = { title: "배포/구성/탐색과 이동/계정 전환", component: AccountSwitcherPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof AccountSwitcherPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
