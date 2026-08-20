import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Infrastructure", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Affix: Story = componentStory("Affix");
export const AppProvider: Story = componentStory("AppProvider");
export const BorderBeam: Story = componentStory("BorderBeam");
export const DesignSystemProvider: Story = componentStory("DesignSystemProvider");
export const Utility: Story = componentStory("Utility");
