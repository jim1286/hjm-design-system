import type {Meta,StoryObj} from '@storybook/react-vite';import{OtpPreview}from'./otp-preview';
const meta={ includeStories: ["Default","Dark","LargeText"],id: "components-inputs-otpfield", title: "배포/컴포넌트/입력/인증번호 입력",component:OtpPreview}satisfies Meta<typeof OtpPreview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals:{theme:'dark'} };
export const LargeText: Story = { name: "큰 글자", globals:{textScale:'2'} };
