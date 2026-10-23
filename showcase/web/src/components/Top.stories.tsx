import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual Top item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--top keeps the same preview for old links.
const meta = { id: "components-layout-top", title: "배포/컴포넌트/레이아웃/화면 제목과 설명", component: ContractStory, args: { name: "Top" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Top } from '@hjmds/react/top';
// titleLineBreaks="preserve" (2026-10-23): an intended hero break; the heading name stays one sentence (portfolio site).
export const PreservedLineBreak: Story = { name: '의도한 줄바꿈', render: () => <Top descriptor={{ eyebrow: '제품 개발자', title: '아이디어를 제품으로,\n제품을 오래 쓰이는 구조로.', titleLineBreaks: 'preserve' }} /> };
