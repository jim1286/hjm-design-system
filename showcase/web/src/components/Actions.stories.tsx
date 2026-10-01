import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { includeStories: ["Button","IconButton","Link","BottomCTA","FloatingActionButton","AuthProviderButton"], id: "components-actions", title: "배포/컴포넌트/동작", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = { ...componentStory("Button"), name: "버튼" };
export const IconButton: Story = { ...componentStory("IconButton"), name: "아이콘 버튼" };
export const Link: Story = { ...componentStory("Link"), name: "링크" };
export const BottomCTA: Story = { ...componentStory("BottomCTA"), name: "하단 실행 버튼" };
export const FloatingActionButton: Story = { ...componentStory("FloatingActionButton"), name: "플로팅 실행 버튼" };
export const AuthProviderButton: Story = { ...componentStory("AuthProviderButton"), name: "소셜 로그인 버튼" };
