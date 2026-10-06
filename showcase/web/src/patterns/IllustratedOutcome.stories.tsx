import type { Meta, StoryObj } from "@storybook/react-vite";
import { IllustratedOutcomePreview } from "./illustrated-outcome-preview";
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "compositions-feedback-illustrated-outcome", title: "배포/구성/피드백과 복구/그림과 시작 안내", component: IllustratedOutcomePreview } satisfies Meta<typeof IllustratedOutcomePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
