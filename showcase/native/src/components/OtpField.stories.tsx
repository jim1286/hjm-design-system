import { OtpPreview } from "../otp-preview";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/입력/인증번호 입력", component: NativeComponentPreview, args: { componentId: "otp-field", variant: "default" }, parameters: { hjm: { componentIds: ["otp-field"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", render: () => <OtpPreview/> };
export const Dark: Story = { name: "어두운 테마", render: () => <OtpPreview/>, globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", render: () => <OtpPreview/>, globals: { textScale: "2" } };
