import { useState } from "react";
import { Text } from "@hjmds/react/layout";
import { Avatar } from "@hjmds/react/display";
import { ConversationRow } from "@hjmds/react/conversation-row";
import { ContextMenu } from "@hjmds/react/context-menu";
import { ScreenLayout } from "@hjmds/react/screens";

// 2026-10-16 conversation list: right-click/long-press opens the measured DM action menu
// (mark unread, mute, then block/delete in the danger tone). Click still opens the conversation.
const photo = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&fit=crop`;
const rows = [
  { id: "seoyeon", name: "서연", preview: "토요일 2시에 만나요", time: "3분", unread: true, photo: photo("photo-1472396961693-142e6e269027") },
  { id: "walk", name: "산책 모임", preview: "지우: 지난주에 찍은 길이에요", time: "1시간", unread: false, photo: photo("photo-1501785888041-af3ef285b470") },
  { id: "minjun", name: "민준", preview: "사진 고마워요!", time: "어제", unread: false, photo: photo("photo-1441974231531-c6227db76b6e") },
];
const done: Record<string, string> = { unread: "읽지 않음으로 표시했어요", mute: "알림을 해제했어요", block: "차단했어요", delete: "대화를 삭제했어요" };

export function ConversationListPreview() {
  const [status, setStatus] = useState("행을 길게 누르거나 우클릭해 보세요.");
  return <div style={{ height: 720 }}>
    <ScreenLayout title="메시지" as="section" scroll="content" notice={<Text tone="muted">{status}</Text>}>
      <div>{rows.map(row => <ContextMenu key={row.id} accessibilityLabel={`${row.name} 대화 메뉴`}
        items={[
          { id: "unread", label: "읽지 않은 상태로 표시", textValue: "읽지 않은 상태로 표시" },
          { id: "mute", label: "알림 해제", textValue: "알림 해제" },
          { id: "block", label: "차단", textValue: "차단", tone: "danger" },
          { id: "delete", label: "삭제", textValue: "삭제", tone: "danger" },
        ]}
        onAction={id => setStatus(`${row.name}: ${done[id]}`)}>
        <a href={`#${row.id}`} aria-label={`${row.name}, ${row.preview}, ${row.time}${row.unread ? ", 읽지 않음" : ""}`} onClick={event => { event.preventDefault(); setStatus(`${row.name} 대화를 열어요.`); }} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
          <ConversationRow title={row.name} preview={row.preview} metadata={row.time} unread={row.unread} avatar={<Avatar name={row.name} size="large" src={row.photo} alt="" />} />
        </a>
      </ContextMenu>)}</div>
    </ScreenLayout>
  </div>;
}
