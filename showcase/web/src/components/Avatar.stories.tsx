import { Avatar } from "@hjmds/react/display";
import { Stack } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Avatar item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--avatar keeps the same preview for old links.
const meta = { id: "components-data-display-avatar", title: "배포/컴포넌트/데이터 표시/아바타", component: ContractStory, args: { name: "Avatar" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// 2026-10-23: small steps (22·28), the 44 touch step, rounded shape, frame "none" and a corner accessory.
const teamMark = <span aria-hidden="true" style={{ display: "block", inlineSize: 14, blockSize: 14, borderRadius: 999, background: "var(--hjm-color-content-brand)" }} />;
export const Presentation: Story = { name: "크기·모양·모서리 표식 · 미게시", render: () => <Stack axis="inline" gap="sm" align="center">
  <Avatar decorative size="xxsmall" name="Kim Min" />
  <Avatar decorative size="xsmall" name="Kim Min" />
  <Avatar name="Kim Min" size="small" />
  <Avatar name="Lee Ha" size="touch" frame="surface" />
  <Avatar name="Park Jun" size="large" shape="rounded" accessory={teamMark} />
  <Avatar decorative size="touch" frame="none" fallback="⚡" />
  <Avatar decorative name="전체 그림" size="xlarge" imageFit="contain" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" />
</Stack> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
