import type { Meta, StoryObj } from "@storybook/react-native";
import { MediaTransportPreview } from "./media-transport-preview";
import { Container } from "@hjmds/react-native/primitives";
const meta = { title: "실험/구성/직접 조작과 모션/미디어 재생 제어", component: MediaTransportPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof MediaTransportPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
