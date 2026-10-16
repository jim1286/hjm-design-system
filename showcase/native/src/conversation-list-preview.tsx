import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ban, BellOff, MailOpen, Trash2 } from "lucide-react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Text } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import { ConversationRow } from "@hjmds/react-native/conversation-row";
import { ContextMenu } from "@hjmds/react-native/context-menu";
import { ScreenLayout } from "@hjmds/react-native/screens";

// 2026-10-16 conversation list: long-press opens the action menu measured from Instagram DM
// (mark unread, mute, then block/delete in the danger tone). Tap still opens the conversation.
const photo = (id: string) => ({ uri: `https://images.unsplash.com/${id}?w=96&h=96&fit=crop` });
const rows = [
  { id: "seoyeon", name: "서연", preview: "토요일 2시에 만나요", time: "3분", unread: true, photo: photo("photo-1472396961693-142e6e269027") },
  { id: "walk", name: "산책 모임", preview: "지우: 지난주에 찍은 길이에요", time: "1시간", unread: false, photo: photo("photo-1501785888041-af3ef285b470") },
  { id: "minjun", name: "민준", preview: "사진 고마워요!", time: "어제", unread: false, photo: photo("photo-1441974231531-c6227db76b6e") },
];

export function ConversationListPreview() {
  const { colors } = useHjmNativeTheme();
  const [status, setStatus] = useState("행을 길게 눌러 보세요.");
  return <View style={{ height: 720 }}>
    <ScreenLayout title="메시지" scroll="content" notice={<Text tone="muted">{status}</Text>}>
      <View>{rows.map(row => <ContextMenu key={row.id} accessibilityLabel={`${row.name} 대화 메뉴`}
        items={[
          { id: "unread", label: "읽지 않은 상태로 표시", icon: <MailOpen size={20} color={colors.text} /> },
          { id: "mute", label: "알림 해제", icon: <BellOff size={20} color={colors.text} /> },
          { id: "block", label: "차단", tone: "danger", icon: <Ban size={20} color={colors.danger} /> },
          { id: "delete", label: "삭제", tone: "danger", icon: <Trash2 size={20} color={colors.danger} /> },
        ]}
        onAction={id => setStatus(`${row.name}: ${({ unread: "읽지 않음으로 표시했어요", mute: "알림을 해제했어요", block: "차단했어요", delete: "대화를 삭제했어요" } as Record<string, string>)[id]}`)}>
        <Pressable accessibilityRole="link" accessibilityLabel={`${row.name}, ${row.preview}, ${row.time}${row.unread ? ", 읽지 않음" : ""}`} onPress={() => setStatus(`${row.name} 대화를 열어요.`)}>
          <ConversationRow title={row.name} preview={row.preview} metadata={row.time} unread={row.unread} avatar={<Avatar name={row.name} size={56} decorative source={row.photo} />} />
        </Pressable>
      </ContextMenu>)}</View>
    </ScreenLayout>
  </View>;
}
