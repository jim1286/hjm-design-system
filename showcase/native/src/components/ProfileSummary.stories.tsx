import { useState } from "react";
import { ProfileSummary } from "@hjmds/react-native/screen-flows";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/프로필 요약", component: NativeComponentPreview, args: { componentId: "profile-summary", variant: "default" }, parameters: { hjm: { componentIds: ["profile-summary"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", render: () => <StackedActionsPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function StackedActionsPreview() {
  const [action, setAction] = useState("");
  return <ProfileSummary name="예시 번뚝이" avatar={<Avatar name="예시" size={72} decorative />} actionsLayout="stacked"
    stats={[{id:"drops",value:"12",label:"작품"},{id:"followers",value:"7",label:"팔로워"}]}
    actions={<><Button fullWidth onPress={() => setAction("팔로우를 눌렀어요")}>팔로우</Button>
      <Button fullWidth tone="secondary" onPress={() => setAction("메시지를 눌렀어요")}>메시지 보내기</Button></>}>
    {action ? <Text>{action}</Text> : null}
  </ProfileSummary>;
}
