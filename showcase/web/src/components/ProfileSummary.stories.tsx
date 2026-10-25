import { useState } from "react";
import { ProfileSummary } from "@hjmds/react/screen-flows";
import { Button } from "@hjmds/react/actions";
import { Text } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual ProfileSummary item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--profile-summary keeps the same preview for old links.
const meta = { id: "components-data-display-profile-summary", title: "배포/컴포넌트/데이터 표시/프로필 요약", component: ContractStory, args: { name: "ProfileSummary" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본", render: () => <StackedActionsPreview /> };
export const EqualActions: Story = { name: "같은 폭의 가로 행동", render: () => <StackedActionsPreview layout="equal" /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function StackedActionsPreview({ layout = "stacked" }: { layout?: "stacked" | "equal" }) {
  const [action, setAction] = useState("");
  return <ProfileSummary name="예시 번뚝이" avatar={"🌼"} actionsLayout={layout}
    stats={[{id:"drops",value:"12",label:"작품"},{id:"followers",value:"7",label:"팔로워"}]}
    actions={<><Button fullWidth onClick={() => setAction("팔로우를 눌렀어요")}>팔로우</Button>
      <Button fullWidth tone="secondary" onClick={() => setAction("메시지를 눌렀어요")}>메시지 보내기</Button></>}>
    {action ? <Text>{action}</Text> : null}
  </ProfileSummary>;
}
