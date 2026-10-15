import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShortcutRecorderPreview } from "./AuthoringTools.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-shortcut-recorder", title: "배포/구성/직접 조작과 모션/단축키 조합 기록", component: ShortcutRecorderPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof ShortcutRecorderPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
