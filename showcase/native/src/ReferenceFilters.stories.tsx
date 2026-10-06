import type { Meta, StoryObj } from "@storybook/react-native";
import { FilterSearch } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { title: "실험/구성/검색/여러 조건 적용과 초기화", component: FilterSearch } satisfies Meta<typeof FilterSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
