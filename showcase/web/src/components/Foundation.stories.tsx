import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { includeStories: ["Text","Heading","TextFormat","Icon"], id: "components-foundation", title: "배포/컴포넌트/글자와 아이콘", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { ...componentStory("Text"), name: "본문 글자" };
export const Heading: Story = { ...componentStory("Heading"), name: "제목" };
export const TextFormat: Story = { ...componentStory("TextFormat"), name: "글자 서식" };
export const Icon: Story = { ...componentStory("Icon"), name: "아이콘" };
