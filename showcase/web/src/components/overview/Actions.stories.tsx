import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["Button","IconButton","Link","BottomCTA","FloatingActionButton","AuthProviderButton"], id: "components-actions", title: "배포/컴포넌트/개요/동작 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = { ...componentStory("Button"), name: "버튼" };
export const IconButton: Story = { ...componentStory("IconButton"), name: "아이콘 버튼" };
export const Link: Story = { ...componentStory("Link"), name: "링크" };
export const BottomCTA: Story = { ...componentStory("BottomCTA"), name: "하단 실행 버튼" };
export const FloatingActionButton: Story = { ...componentStory("FloatingActionButton"), name: "플로팅 실행 버튼" };
export const AuthProviderButton: Story = { ...componentStory("AuthProviderButton"), name: "소셜 로그인 버튼" };
