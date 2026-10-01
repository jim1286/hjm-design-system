import type { Meta, StoryObj } from "@storybook/react-native";
import { Duration } from "./compound-previews";
const meta = { title: "배포/컴포넌트/입력/소요 시간 입력", component: Duration, parameters: { hjm: { optionalEntry: "duration-field" } } } satisfies Meta<typeof Duration>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
