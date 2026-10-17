import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "@hjmds/react/layout";
import { WebNavigationPreview } from "./WebNavigation.previews.js";

const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-webnavigation", title: "배포/구성/탐색과 이동/보관함과 페이지 이동", component: WebNavigationPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof WebNavigationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
