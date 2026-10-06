import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["Tour","Dialog","AlertDialog","Sheet","SidePanel","Popover","Tooltip","CommandPalette"], id: "components-overlays", title: "배포/컴포넌트/개요/오버레이 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tour: Story = { ...componentStory("Tour"), name: "사용 안내 둘러보기" };
export const Dialog: Story = { ...componentStory("Dialog"), name: "대화상자" };
export const AlertDialog: Story = { ...componentStory("AlertDialog"), name: "확인 대화상자" };
export const Sheet: Story = { ...componentStory("Sheet"), name: "시트" };
export const SidePanel: Story = { ...componentStory("SidePanel"), name: "측면 패널" };
export const Popover: Story = { ...componentStory("Popover"), name: "팝오버" };
export const Tooltip: Story = { ...componentStory("Tooltip"), name: "툴팁" };
// Catalog category overlay is the Storybook role too (2026-10-06 follow-up reverted the same-day move to 탐색).
export const CommandPalette: Story = { ...componentStory("CommandPalette"), name: "명령 검색" };
