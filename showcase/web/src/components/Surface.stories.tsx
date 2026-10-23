import { IconButton } from "@hjmds/react/actions";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Surface item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--surface keeps the same preview for old links.
const meta = { id: "components-layout-surface", title: "배포/컴포넌트/레이아웃/배경 영역", component: ContractStory, args: { name: "Surface" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// elevation (2026-10-23): shadow token steps on Surface and on a filled floating IconButton.
export const Elevation: Story = { name: "높임 단계 · 미게시", render: () => <Stack axis="inline" gap="lg" align="center" wrap>
  {(["none", "raised", "floating", "overlay"] as const).map(step => <Surface key={step} elevation={step} padding="md"><Text>{step}</Text></Surface>)}
  <IconButton label="번뚝" tone="primary" size="large" shape="circle" elevation="floating">⚡</IconButton>
</Stack> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
