import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangePreview, ImperativeOverlayPreview, FormattersPreview } from "./DateRange.previews.js";

const meta = { includeStories: ["Default","ImperativeOverlays","Formatters","Dark","LargeText"], id: "patterns-daterange", title: "배포/컴포넌트/입력/기간 선택", component: DateRangePreview } satisfies Meta<typeof DateRangePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const ImperativeOverlays: Story = { name: "코드로 여는 팝업", render: () => <ImperativeOverlayPreview /> };
export const Formatters: Story = { name: "서식 변환", render: () => <FormattersPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
