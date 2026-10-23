import type { Meta, StoryObj } from "@storybook/react-native";
import { StepsPresentationPreview } from "./steps-presentation-preview";
import { StepsRevisitPreview } from "../flow-variants";
// 2026-10-23 user-approved promotion: consolidate all presentations under the existing public story id.
const meta = {  title: "배포/컴포넌트/탐색/단계 탐색", component: StepsPresentationPreview,
  args: { presentation: "focus" }, argTypes: { presentation: { control: "select", options: ["focus", "compact", "vertical"] } },
  parameters: { hjm: { componentIds: ["steps"] } } } satisfies Meta<typeof StepsPresentationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Error: Story = { name: "오류", args: { initialError: true } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Compact: Story = { name: "컴팩트 챕터", args: { presentation: "compact" } };
export const Vertical: Story = { name: "펼쳐지는 단계", args: { presentation: "vertical" } };
export const Revisit: Story = { name: "지난 단계로 돌아가기", render: () => <StepsRevisitPreview /> };
