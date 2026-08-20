import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Actions", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = componentStory("Button");
export const IconButton: Story = componentStory("IconButton");
export const Link: Story = componentStory("Link");
export const BottomCTA: Story = componentStory("BottomCTA");
export const FloatingActionButton: Story = componentStory("FloatingActionButton");
