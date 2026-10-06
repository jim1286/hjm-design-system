import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["Tabs","TopBar","Sidebar","BottomNavigation","Breadcrumb","Pagination","LoadMore","Steps","Menu","ContextMenu","Menubar","Anchor"], id: "components-navigation", title: "배포/컴포넌트/개요/탐색 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tabs: Story = { ...componentStory("Tabs"), name: "탭" };
export const TopBar: Story = { ...componentStory("TopBar"), name: "상단 탐색 막대" };
export const Sidebar: Story = { ...componentStory("Sidebar"), name: "사이드바" };
export const BottomNavigation: Story = { ...componentStory("BottomNavigation"), name: "하단 탐색" };
export const Breadcrumb: Story = { ...componentStory("Breadcrumb"), name: "이동 경로" };
export const Pagination: Story = { ...componentStory("Pagination"), name: "페이지 이동" };
export const LoadMore: Story = { ...componentStory("LoadMore"), name: "더 보기" };
export const Steps: Story = { ...componentStory("Steps"), name: "단계 탐색" };
export const Menu: Story = { ...componentStory("Menu"), name: "메뉴" };
export const ContextMenu: Story = { ...componentStory("ContextMenu"), name: "상황별 메뉴" };
export const Menubar: Story = { ...componentStory("Menubar"), name: "메뉴 막대" };
export const Anchor: Story = { ...componentStory("Anchor"), name: "문서 내 바로가기" };
