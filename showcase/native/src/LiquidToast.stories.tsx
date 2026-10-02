import type { Meta, StoryObj } from "@storybook/react-native";
import { ToastPreview } from "./toast-preview";
// Separate discovery entry requested by the user; it still uses the canonical Toast store.
const meta = { title: "배포/컴포넌트/상태와 알림/리퀴드 토스트", component: ToastPreview, args: { enhanced: true }, parameters: { hjm: { extends: "toast", optionalEntry: "toast-liquid" }, controls: { exclude: ["enhanced"] } } } satisfies Meta<typeof ToastPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
