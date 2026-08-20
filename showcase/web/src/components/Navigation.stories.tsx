import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Navigation", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tabs: Story = componentStory("Tabs");
export const TopBar: Story = componentStory("TopBar");
export const BottomNavigation: Story = componentStory("BottomNavigation");
export const Breadcrumb: Story = componentStory("Breadcrumb");
export const Pagination: Story = componentStory("Pagination");
export const LoadMore: Story = componentStory("LoadMore");
export const Steps: Story = componentStory("Steps");
export const Menu: Story = componentStory("Menu");
export const Anchor: Story = componentStory("Anchor");
