import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Layout", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Surface: Story = componentStory("Surface");
export const Divider: Story = componentStory("Divider");
export const Section: Story = componentStory("Section");
export const Stack: Story = componentStory("Stack");
export const Container: Story = componentStory("Container");
export const AspectRatio: Story = componentStory("AspectRatio");
export const Grid: Story = componentStory("Grid");
export const Layout: Story = componentStory("Layout");
export const Masonry: Story = componentStory("Masonry");
export const Splitter: Story = componentStory("Splitter");
