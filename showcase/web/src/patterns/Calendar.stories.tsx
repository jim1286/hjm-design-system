import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarPreview } from "./Calendar.previews.js";

const meta = { includeStories: ["Default","Records","Dark","LargeText"], id: "patterns-calendar", title: "배포/컴포넌트/데이터 표시/달력", component: CalendarPreview, parameters: { hjm: { edgeToEdge: true } } } satisfies Meta<typeof CalendarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Records: Story = { name: "기록",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
