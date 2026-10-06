import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectionReview } from "./reference-flow-previews";
// New reference-derived compositions remain experimental until explicit user approval.
const meta = { includeStories: ["Default","Dark","LargeText"], id: "reference-review", title: "배포/구성/입력과 작성/선택 내용 검토와 수정", component: SelectionReview } satisfies Meta<typeof SelectionReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
