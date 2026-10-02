import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hjmds/react/actions";
import { AuthProviderButton } from "@hjmds/react/provider-button";

const meta = {
  title: "배포/컴포넌트/동작/로딩 상태",
  component: Button,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonLoading: Story = {
  name: "버튼",
  render: () => <Button loading>저장</Button>,
};

export const ProviderButtonLoading: Story = {
  name: "소셜 로그인 버튼",
  render: () => <AuthProviderButton descriptor={{ provider: "google", label: "Google", busy: true }} logo={<span>G</span>} />,
};
