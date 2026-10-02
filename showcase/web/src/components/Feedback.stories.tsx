import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { componentStory } from "./story-factory";

const meta = { includeStories: ["EmptyState","Notice","Progress","Spinner","Skeleton","Result","BottomInfo","Toast","Watermark","ThinkingOrb"], id: "components-feedback", title: "배포/컴포넌트/상태와 알림", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyState: Story = { ...componentStory("EmptyState"), name: "빈 상태" };
export const Notice: Story = { ...componentStory("Notice"), name: "안내 메시지" };
export const Progress: Story = { ...componentStory("Progress"), name: "진행 표시" };
export const Spinner: Story = { ...componentStory("Spinner"), name: "로딩 표시" };
export const Skeleton: Story = { ...componentStory("Skeleton"), name: "스켈레톤" };
export const Result: Story = { ...componentStory("Result"), name: "결과 안내" };
export const BottomInfo: Story = { ...componentStory("BottomInfo"), name: "하단 안내" };
export const Toast: Story = { ...componentStory("Toast"), name: "토스트" };
export const Watermark: Story = { ...componentStory("Watermark"), name: "워터마크" };

export const ThinkingOrb: Story = { ...componentStory("ThinkingOrb"), name: "생각 중 표시" };
