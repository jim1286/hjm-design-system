import type { Meta, StoryObj } from "@storybook/react-native";
import { NavigationBehaviorPreview } from "./reference-navigation-bars";
const meta = { title: "배포/컴포넌트/탐색/내비게이션 바/탐색 옆에서 작업 실행", component: NavigationBehaviorPreview, parameters: { controls: { disable: true } }, args: { behavior: "separate" } } satisfies Meta<typeof NavigationBehaviorPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
