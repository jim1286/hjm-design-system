import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordRulesPreview } from "./TaskControls.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-task-passwordrules", title: "배포/구성/입력과 작성/비밀번호 규칙 확인", component: PasswordRulesPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof PasswordRulesPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
