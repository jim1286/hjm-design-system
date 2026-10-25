import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { Menu } from "@hjmds/react/overlays";

// Individual Menu item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-navigation--menu keeps the same preview for old links.
const meta = { id: "components-navigation-menu", title: "배포/컴포넌트/탐색/메뉴", component: ContractStory, args: { name: "Menu" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
const menuItems = [{ id: "recent", label: "최근 사용" }, { id: "settings", label: "설정" }];
export const Grouped: Story = { name: "그룹형", render: () => <Menu presentation="grouped" label="더보기" dismissLabel="닫기" trigger={<button type="button">더보기</button>} items={menuItems} /> };
export const Anchored: Story = { name: "앵커형", render: () => <Menu presentation="anchored" label="댓글 더보기" trigger={<button type="button">댓글 더보기</button>} items={[{ id: "report", label: "신고" }, { id: "block", label: "차단", tone: "danger" }]} /> };
export const Bottom: Story = { name: "하단형", render: () => <Menu presentation="bottom" title="문서 관리" description="여행 준비물 · v2" dismissPlacement="header" label="사진 작업" dismissLabel="닫기" trigger={<button type="button">사진 작업</button>} items={[{ id: "save", label: "저장" }, { id: "share", label: "공유" }]} /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
