import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Overlays", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tour: Story = componentStory("Tour");
export const Dialog: Story = componentStory("Dialog");
export const AlertDialog: Story = componentStory("AlertDialog");
export const Sheet: Story = componentStory("Sheet");
export const SidePanel: Story = componentStory("SidePanel");
export const Popover: Story = componentStory("Popover");
export const ConfirmPopover: Story = componentStory("ConfirmPopover");
export const Tooltip: Story = componentStory("Tooltip");
export const CommandPalette: Story = componentStory("CommandPalette");
