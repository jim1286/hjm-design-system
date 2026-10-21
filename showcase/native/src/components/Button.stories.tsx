import { Button } from "@hjmds/react-native/actions";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Stack } from "@hjmds/react-native/primitives";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/동작/버튼", component: NativeComponentPreview, args: { componentId: "button", variant: "default" }, argTypes: { variant: { control: "select", options: ["default", "disabled", "loading"] } }, parameters: { hjm: { componentIds: ["button"] }, controls: { exclude: ["componentId"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Pending: Story = { name: "처리 중", args: { variant: "loading" } };
export const Disabled: Story = { name: "비활성", args: { variant: "disabled" } };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

const raisedProfile = defineHjmDesignProfile({ controls: { button: { appearance: "raised", shape: "pill" } } });
export const Raised: Story = { name: "입체 버튼 · 제품 기본값 · 미게시", render: () => <HjmNativeProvider designProfile={raisedProfile}><Stack gap="xs">
  <Button>계속하기</Button><Button tone="secondary">돌아가기</Button><Button loading>저장하기</Button><Button tone="ghost">조용한 행동</Button>
</Stack></HjmNativeProvider> };
