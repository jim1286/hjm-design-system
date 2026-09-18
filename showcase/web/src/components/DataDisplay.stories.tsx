import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { title: "Components/Data Display", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const UploadItem: Story = componentStory("UploadItem");
export const Avatar: Story = componentStory("Avatar");
export const Badge: Story = componentStory("Badge");
export const CounterBadge: Story = componentStory("CounterBadge");
export const Card: Story = componentStory("Card");
export const List: Story = componentStory("List");
export const ListRow: Story = componentStory("ListRow");
export const VirtualList: Story = componentStory("VirtualList");
// 렌더러를 만들지 않기로 한 행이다 — 토큰 계약만 있고 그리기는 제품 라이브러리 몫이다.
export const Chart: Story = componentStory("Chart");
export const Accordion: Story = componentStory("Accordion");
export const Collapsible: Story = componentStory("Collapsible");
export const Asset: Story = componentStory("Asset");
export const Statistic: Story = componentStory("Statistic");
export const Timeline: Story = componentStory("Timeline");
export const DataTable: Story = componentStory("DataTable");
export const Tree: Story = componentStory("Tree");
export const Calendar: Story = componentStory("Calendar");
export const Carousel: Story = componentStory("Carousel");
export const DescriptionList: Story = componentStory("DescriptionList");
export const Image: Story = componentStory("Image");
export const QRCode: Story = componentStory("QRCode");
export const Tag: Story = componentStory("Tag");
