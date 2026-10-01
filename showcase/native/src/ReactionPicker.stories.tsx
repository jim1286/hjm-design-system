import type { Meta, StoryObj } from "@storybook/react-native";
import { Reactions } from "./compound-previews";
const meta = { title: "배포/컴포넌트/동작/반응 선택", component: Reactions, parameters: { hjm: { optionalEntry: "reaction-picker" } } } satisfies Meta<typeof Reactions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
