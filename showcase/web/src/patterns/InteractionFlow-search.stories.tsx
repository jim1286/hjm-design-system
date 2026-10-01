import type { Meta, StoryObj } from "@storybook/react-vite";
import { LatestSearchWins } from "./interaction-flow-previews";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "experimental-interaction-search", title: "실험/구성/상호작용 예제/늦은 응답보다 최신 검색 유지", component: LatestSearchWins } satisfies Meta<typeof LatestSearchWins>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
