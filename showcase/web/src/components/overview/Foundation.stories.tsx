// Generated from catalog.ts by pnpm storybook:sync. URL id retained.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "../preview-registry";
import { componentStory } from "../story-factory";
const meta = { includeStories: ["Text","TextFormat","Heading","Icon"], id: "components-foundation", title: "배포/컴포넌트/개요/글자와 아이콘 모아 보기", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Text: Story = { ...componentStory("Text"), name: "본문 글자" };
export const TextFormat: Story = { ...componentStory("TextFormat"), name: "글자 서식" };
export const Heading: Story = { ...componentStory("Heading"), name: "제목" };
export const Icon: Story = { ...componentStory("Icon"), name: "아이콘" };
