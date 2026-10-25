import { MemberProfilePreview } from "../member-profile-preview";
import { Avatar } from "@hjmds/react-native/data-display";
import { useState } from "react";
import { NotificationRow } from "@hjmds/react-native/screens";
import { Stack, Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/알림 미리보기 행", component: NativeComponentPreview, args: { componentId: "notification-row", variant: "default" }, parameters: { hjm: { componentIds: ["notification-row"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
function ActionPreview() {
  const [member,setMember]=useState<string|null>(null);
  const [opened, setOpened] = useState(false);
  if(member)return <MemberProfilePreview name={member} avatar={<Avatar name={member} size="xlarge" decorative/>} onBack={()=>setMember(null)}/>;
  return <Stack gap="md">
    <NotificationRow avatarAction={{label:"서연 프로필 보기",onPress:()=>setMember("서연")}} avatar={<Text>🌱</Text>} preview="친구가 새 뚝을 올렸어요" metadata="1분 전" unread
      action={{ label: "친구가 새 뚝을 올렸어요. 1분 전", onActivate: () => setOpened(true) }} />
    <NotificationRow avatarAction={{label:"민준 프로필 보기",onPress:()=>setMember("민준")}} avatar={<Text>🌼</Text>} preview="삭제된 뚝의 알림이에요" metadata="어제" separator
      action={{ label: "삭제된 뚝의 알림이에요. 어제", disabled: true, onActivate: () => setOpened(true) }} />
    <Text accessibilityLiveRegion="polite">{opened ? "알림을 열었어요" : "첫 알림을 눌러 보세요"}</Text>
  </Stack>;
}
export const Default: Story = { name: "기본", render: () => <ActionPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
