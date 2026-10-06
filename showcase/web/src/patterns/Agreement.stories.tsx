import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgreementPreview, AgreementLockedPreview, TopPreview, AuthProviderButtonPreview, AuthScreenLayoutPreview } from "./Agreement.previews.js";

const meta = { includeStories: ["Default","ScreenTitle","SocialLogin","SignInScreen","SignInLoading","Disabled","Dark","LargeText"], id: "patterns-agreement", title: "배포/컴포넌트/입력/약관 동의", component: AgreementPreview } satisfies Meta<typeof AgreementPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const ScreenTitle: Story = { name: "화면 제목", render: () => <TopPreview /> };
export const SocialLogin: Story = { name: "소셜 로그인", render: () => <AuthProviderButtonPreview /> };
export const SignInScreen: Story = { name: "로그인 화면", render: () => <AuthScreenLayoutPreview /> };
export const SignInLoading: Story = { name: "로그인 중", render: () => <AuthScreenLayoutPreview loading /> };
export const Disabled: Story = { name: "비활성", render: () => <AgreementLockedPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
