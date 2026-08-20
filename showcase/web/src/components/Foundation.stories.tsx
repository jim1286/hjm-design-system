import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Foundation", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = componentStory("Text");
export const Icon: Story = componentStory("Icon");
