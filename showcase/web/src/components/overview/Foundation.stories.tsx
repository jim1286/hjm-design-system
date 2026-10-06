import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";

// Role overview page: canonical components of one role on one page (Web only). Moved under 개요 on 2026-10-06 with its
// id kept so the old 배포/컴포넌트/<역할> URLs still open; each component also has its own item now (docs/STORYBOOK_NAVIGATION.md §1.2).
const meta = { includeStories: ["Text","Heading","TextFormat","Icon"], id: "components-foundation", title: "배포/컴포넌트/개요/글자와 아이콘 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { ...componentStory("Text"), name: "본문 글자" };
export const Heading: Story = { ...componentStory("Heading"), name: "제목" };
export const TextFormat: Story = { ...componentStory("TextFormat"), name: "글자 서식" };
export const Icon: Story = { ...componentStory("Icon"), name: "아이콘" };
