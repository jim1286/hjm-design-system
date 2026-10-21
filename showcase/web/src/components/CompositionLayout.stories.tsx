import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual CompositionLayout item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--composition-layout keeps the same preview for old links.
const meta = { id: "components-layout-composition-layout", title: "배포/컴포넌트/레이아웃/구성 골격", component: ContractStory, args: { name: "CompositionLayout" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { CompositionLayout } from '@hjmds/react/screens';
import { Text } from '@hjmds/react/layout';
import { Badge } from '@hjmds/react/display';
export const SupportingArtwork: Story = { name: '본문 옆 보조 그림', render: () => <CompositionLayout title="보낸 사람" titleSize="compact" description="출발 도시"
  aside={<svg width="72" height="112" viewBox="0 0 72 112" aria-hidden="true"><rect x="8" y="4" width="56" height="64" rx="4" fill="currentColor" opacity="0.1" /></svg>}
  footer={<Text variant="caption">배달 친구 · 어제</Text>} footerAside={<Badge size="small" variant="outline">전달 완료</Badge>}>
  <Text>제목과 본문은 그림 옆의 남은 폭에서 자연스럽게 줄바꿈합니다.</Text>
</CompositionLayout> };
