import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Feedback", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyState: Story = componentStory("EmptyState");
export const Notice: Story = componentStory("Notice");
export const Progress: Story = componentStory("Progress");
export const Spinner: Story = componentStory("Spinner");
export const Skeleton: Story = componentStory("Skeleton");
export const Result: Story = componentStory("Result");
export const Toast: Story = componentStory("Toast");
export const Watermark: Story = componentStory("Watermark");
