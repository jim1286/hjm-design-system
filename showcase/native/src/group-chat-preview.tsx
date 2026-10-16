import { useState } from "react";
import { FlatList, Image, View } from "react-native";
import { ArrowUp } from "lucide-react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Text } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import { KeyboardAvoiding } from "@hjmds/react-native/keyboard";
import { ChatMessage, ChatScreen, MessageComposer } from "@hjmds/react-native/screens";
import { resolveChatMessageGroups } from "@hjmds/design-contracts/screen-patterns";

// 2026-10-16 group-room example: several members, one avatar/name per run, quote, photo and hold menu.
// Neutral landscape crops stand in for member photos so no real person is depicted.
const photo = (id: string) => ({ uri: `https://images.unsplash.com/${id}?w=96&h=96&fit=crop` });
const members: Record<string, { name: string; photo: { uri: string } }> = {
  seoyeon: { name: "서연", photo: photo("photo-1472396961693-142e6e269027") },
  minjun: { name: "민준", photo: photo("photo-1501785888041-af3ef285b470") },
  jiwoo: { name: "지우", photo: photo("photo-1441974231531-c6227db76b6e") },
};
type GroupMessage = { id: string; authorId: string; timestamp: string; text: string; photos?: number; replyTo?: { author: string; text: string } };
const initial: GroupMessage[] = [
  { id: "g1", authorId: "seoyeon", timestamp: "오후 3:01", text: "토요일 산책 모임 몇 시가 좋아요?" },
  { id: "g2", authorId: "seoyeon", timestamp: "오후 3:01", text: "공원 입구에서 만나요" },
  { id: "g3", authorId: "minjun", timestamp: "오후 3:02", text: "저는 2시 괜찮아요" },
  { id: "g4", authorId: "jiwoo", timestamp: "오후 3:02", text: "", photos: 1 },
  { id: "g5", authorId: "jiwoo", timestamp: "오후 3:02", text: "지난주에 찍은 길이에요" },
  { id: "g6", authorId: "me", timestamp: "오후 3:04", text: "2시 좋아요!", replyTo: { author: "민준", text: "저는 2시 괜찮아요" } },
  { id: "g7", authorId: "me", timestamp: "오후 3:04", text: "간식은 제가 챙길게요" },
];

export function GroupChatPreview() {
  const { colors } = useHjmNativeTheme();
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<GroupMessage | null>(null);
  const [reactions, setReactions] = useState<Record<string, string | null>>({});
  const [status, setStatus] = useState("");
  const positions = resolveChatMessageGroups(messages);
  const nameOf = (message: GroupMessage) => message.authorId === "me" ? "나" : members[message.authorId]!.name;
  const send = (value: string) => {
    setMessages(current => [...current, { id: `sent-${current.length}`, authorId: "me", timestamp: "지금", text: value, ...(replyTarget ? { replyTo: { author: nameOf(replyTarget), text: replyTarget.text || "사진" } } : {}) }]);
    setDraft(""); setReplyTarget(null);
  };
  return <KeyboardAvoiding style={{ height: 720 }}>
    <ChatScreen title="산책 모임" titleBadge={<Text tone="muted">4</Text>} exit={{ kind: "back", label: "뒤로", onPress: () => setStatus("목록으로 돌아가요.") }}
      avatar={<Avatar name="산책 모임" size={32} decorative source={members.seoyeon!.photo} />}
      notice={status ? <Text tone="muted">{status}</Text> : null}
      composer={<MessageComposer value={draft} onValueChange={setDraft} label="메시지 보내기" sendLabel="전송" onSend={send} sendPresentation="circle" sendIcon={<ArrowUp size={20} strokeWidth={2} color={colors.onPrimary} />}
        {...(replyTarget ? { replyTo: { author: `${nameOf(replyTarget)}에게 답장`, excerpt: replyTarget.text || "사진", cancelLabel: "답장 취소", onCancel: () => setReplyTarget(null) } } : {})} />}>
      <FlatList data={messages} keyExtractor={message => message.id} keyboardShouldPersistTaps="handled"
        renderItem={({ item: message }) => {
          const member = members[message.authorId];
          return <ChatMessage direction={member ? "incoming" : "outgoing"} author={member?.name ?? ""} timestamp={message.timestamp} groupPosition={positions.get(message.id) ?? "single"}
            {...(member ? { avatar: <Avatar name={member.name} size={36} decorative source={member.photo} /> } : {})}
            replyAction={{ label: "답장", onPress: () => setReplyTarget(message) }}
            {...(message.replyTo ? { replyQuote: { title: `${message.replyTo.author}에게 답장`, excerpt: message.replyTo.text } } : {})}
            {...(message.photos ? { media: Array.from({ length: message.photos }, (_, index) => ({ id: `${message.id}-${index}`, label: "산책길 사진", aspectRatio: 4 / 3, preview: <Image source={require("../../shared/photos/river.jpg")} style={{ width: "100%", height: "100%" }} /> })) } : {})}
            reactions={{ label: "메시지에 반응", closeLabel: "닫기", value: reactions[message.id] ?? null, onValueChange: value => setReactions(current => ({ ...current, [message.id]: value })),
              options: [{ id: "heart", emoji: "❤️", label: "하트" }, { id: "laugh", emoji: "😂", label: "웃겨요" }, { id: "wow", emoji: "😮", label: "놀라워요" }, { id: "sad", emoji: "😢", label: "슬퍼요" }, { id: "thumbs", emoji: "👍", label: "최고예요" }],
              ...(member ? { reportAction: { label: "신고", onPress: () => setStatus(`${member.name}님의 메시지 신고를 접수했어요.`) } } : {}) }}
            actions={reactions[message.id] ? <Text>{({ heart: "❤️", laugh: "😂", wow: "😮", sad: "😢", thumbs: "👍" } as Record<string, string>)[reactions[message.id]!]}</Text> : null}>
            {message.text ? <Text>{message.text}</Text> : null}
          </ChatMessage>;
        }}
        ListFooterComponent={<View style={{ height: 8 }} />} />
    </ChatScreen>
  </KeyboardAvoiding>;
}
