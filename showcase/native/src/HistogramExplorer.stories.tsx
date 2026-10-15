import type { Meta, StoryObj } from "@storybook/react-native";
import { HistogramPreview } from "./data-workflows-preview";
import { Container } from "@hjmds/react-native/primitives";
const meta = { title: "배포/구성/정보 표시/분포 구간 탐색", component: HistogramPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof HistogramPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
