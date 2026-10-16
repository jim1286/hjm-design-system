// Item-level conversation compositions: composer, message bubble and notification row.
// The full chat/inbox screens (common-screen-previews) own screen states; these previews
// show the item interactions those screens repeat, so the two stories no longer duplicate.
import { useEffect, useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { ArrowUp, Plus } from "lucide-react-native";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { Container, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import { ChatMessage, MessageComposer, NotificationItem } from "@hjmds/react-native/screens";
import { resolveChatMessageGroups } from "@hjmds/design-contracts/screen-patterns";
import { compositionBrandFixtures } from "../../shared/composition-brand-fixtures";
import { useDemoAction } from "./action-recovery-previews";
import { PatternStatus } from "./pattern-status";
import { PreviewPhoto } from "./reference-screen-parts";
import { PreviewToolButton, PreviewTools } from "./preview-tools";

// Failure arming is a demo-only tool: it sits in PreviewTools after each composition (SELECTION.md 조립 규칙).
// The product screen owns the outer frame; the preview shows it so the example matches the usage guide.
function Frame({ children }: { children: ReactNode }) {
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.md }}><Container gutter="compact"><Stack gap="lg">{children}</Stack></Container></ScrollView>;
}

// Purpose copy is a table like the product's purpose→i18n-key table; comment and message differ only here and in slots.
const composerCopy = {
  comment: { title: "댓글 작성", label: "댓글을 남겨 주세요", send: "등록", reply: "답글 대상 선택", replyCancel: "답글 취소" },
  message: { title: "메시지 작성", label: "메시지 입력", send: "전송", reply: "답장할 메시지 선택", replyCancel: "답장 취소" },
} as const;
export type ComposerPurpose = keyof typeof composerCopy;
type ComposerOptions = { purpose?: ComposerPurpose; initialState?: "idle" | "pending" | "error"; initialPhotos?: number };

function ComposerContents({ purpose = "comment", initialState = "idle", initialPhotos = 0 }: ComposerOptions) {
  const { colors } = useHjmNativeTheme();
  const copy = composerCopy[purpose];
  const [value, setValue] = useState(initialState === "idle" ? "" : "내용을 확인해 주세요.");
  const [demoPending, setDemoPending] = useState(initialState === "pending");
  const [initialError, setInitialError] = useState(initialState === "error");
  const [reply, setReply] = useState(false);
  // Only messages take photos (several at once); comments keep the reply target instead.
  const [photos, setPhotos] = useState<number[]>(() => purpose === "message" ? Array.from({ length: initialPhotos }, (_, index) => index) : []);
  const [sent, setSent] = useState<string[]>([]);
  // Reuse the action contract for duplicate/stale requests instead of a second send state machine.
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction("");
  useEffect(() => () => session.reset(""), [session]);
  const pending = demoPending || busy, error = initialError || state.status === "error";
  const send = async (text: string) => {
    if (pending) return;
    setInitialError(false);
    const outcome = await session.run(() => request(text), { retryable: true });
    // The draft, photos and reply target are cleared only after the server confirms.
    if (outcome.status === "success") { setSent(items => [...items, text || `사진 ${photos.length}장`]); setValue(""); setReply(false); setPhotos([]); }
  };
  return <Frame>
    <Surface padding="lg"><Stack gap="md">
      <Heading level="level5">{copy.title}</Heading>
      <MessageComposer label={copy.label} sendLabel={copy.send} value={value} onValueChange={setValue} pending={pending} onSend={send}
        sendIcon={<ArrowUp size={20} color={colors.onPrimary} />} sendPresentation="circle"
        context={error ? <PatternStatus announceOnMount tone="danger">전송하지 못했어요. 초안은 그대로예요. 다시 전송해 주세요.</PatternStatus> : null}
        {...(reply ? { replyTo: { author: "서연", excerpt: "오늘 어떤 하루였나요?", cancelLabel: copy.replyCancel, onCancel: () => setReply(false) } } : {})}
        {...(purpose === "message" ? {
          attachmentAction: { label: "사진 추가", icon: <Plus size={20} color={colors.text} />, onPress: () => setPhotos(current => [...current, (current.at(-1) ?? -1) + 1]) },
          attachments: photos.map((id, index) => ({ id: String(id), removeLabel: `사진 ${index + 1} 삭제`, preview: <PreviewPhoto index={id} square label={`선택한 사진 ${index + 1}`} /> })),
          onRemoveAttachment: (id: string) => setPhotos(current => current.filter(photo => String(photo) !== id)),
        } : {})} />
      {sent.map((text, index) => <Text key={index}>{text}</Text>)}
      <PatternStatus>{sent.length ? `전송한 항목 ${sent.length}개` : ""}</PatternStatus>
    </Stack></Surface>
    <Stack axis="inline" wrap gap="sm">
      <Button tone="secondary" disabled={pending} onPress={() => setReply(true)}>{copy.reply}</Button>
      {demoPending ? <Button tone="ghost" onPress={() => setDemoPending(false)}>대기 예제 종료</Button> : null}
    </Stack>
    <Text variant="caption" tone="muted">예제 전송은 서버에 저장하지 않습니다. 줄바꿈은 입력에 남고, 성공한 뒤에만 초안을 지웁니다.</Text>
    <PreviewTools><PreviewToolButton disabled={pending} selected={failureArmed} onPress={toggleFailure}>다음 전송 실패시키기</PreviewToolButton></PreviewTools>
  </Frame>;
}

// The same composition receives a palette; no product-specific layout or behavioral fork.
export function ComposerPreview({ brand = "default", ...props }: ComposerOptions & { brand?: "default" | keyof typeof compositionBrandFixtures }) {
  return brand === "default" ? <ComposerContents {...props} /> : <HjmNativeProvider brandPalette={compositionBrandFixtures[brand]}><ComposerContents {...props} /></HjmNativeProvider>;
}

const reactionOptions = [{ id: "heart", emoji: "❤️", label: "좋아요" }, { id: "laugh", emoji: "😂", label: "웃겨요" }, { id: "wow", emoji: "😮", label: "놀라워요" }, { id: "sad", emoji: "😢", label: "슬퍼요" }, { id: "fire", emoji: "🔥", label: "멋져요" }];
// Delivery ids map to copy through a table; the product supplies its own localized receipts.
const deliveryCopy = { failed: "전송 실패", pending: "보내는 중", sent: "전송됨" } as const;

// 2026-10-16 timeline standard: runs break on author or displayed minute (resolveChatMessageGroups).
const groupedMessages = [
  { id: "g1", authorId: "seoyeon", timestamp: "오후 3:01", text: "오늘 공원 갔다 왔어요" },
  { id: "g2", authorId: "seoyeon", timestamp: "오후 3:01", text: "벚꽃이 벌써 다 폈더라고요" },
  { id: "g3", authorId: "seoyeon", timestamp: "오후 3:01", text: "사진 보내 드릴게요" },
  { id: "g4", authorId: "me", timestamp: "오후 3:02", text: "와 부러워요" },
  { id: "g5", authorId: "me", timestamp: "오후 3:02", text: "주말에 같이 가요!" },
  { id: "g6", authorId: "seoyeon", timestamp: "오후 3:04", text: "좋아요" },
];
const groupPositions = resolveChatMessageGroups(groupedMessages);
// Neutral landscape sample: shows photo avatars without depicting a real person.
const SEOYEON_PHOTO = "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=96&h=96&fit=crop";

export function ChatMessagePreview() {
  const { colors } = useHjmNativeTheme();
  const [reaction, setReaction] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [status, setStatus] = useState("말풍선을 길게 눌러 반응을 남겨 보세요.");
  // The failed message starts in error; resending reuses the demo action session (action-session.md).
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
  useEffect(() => () => session.reset(false), [session]);
  const resend = () => { void session.run(async () => {
    const result = await request(true);
    if (session.getSnapshot().status === "pending") {
      setStatus("메시지를 전송했어요.");
    }
    return result;
  }, { retryable: true }); };
  useEffect(() => { if (!highlight) return; const timer = setTimeout(() => setHighlight(false), 1500); return () => clearTimeout(timer); }, [highlight]);
  const delivered = state.status === "success";
  return <Frame>
    <Heading level="level3">대화 메시지</Heading>
    <Stack gap="lg">
      <View style={{ borderWidth: 2, borderColor: highlight ? colors.primary : "transparent", borderRadius: radius.md }}>
        <ChatMessage direction="incoming" author="서연" timestamp="오후 2:30" avatar={<Avatar name="서연" size={32} decorative source={{ uri: SEOYEON_PHOTO }} />}
          replyAction={{ label: "답장", onPress: () => setStatus("서연님의 메시지에 답장을 준비했어요.") }}
          reactions={{ label: "메시지에 반응", closeLabel: "반응 닫기", value: reaction, onValueChange: setReaction, options: reactionOptions, reportAction: { label: "신고", onPress: () => setStatus("서연님의 메시지 신고를 접수했어요.") } }}
          actions={reaction ? <Text>{reactionOptions.find(option => option.id === reaction)?.emoji ?? ""}</Text> : null}>
          <Text>지난번 이야기한 산책길, 가 보셨어요?</Text>
        </ChatMessage>
      </View>
      <ChatMessage direction="outgoing" author="나" timestamp="오후 2:32" deliveryLabel="읽음"
        replyQuote={{ title: "서연에게 답장", excerpt: "지난번 이야기한 산책길, 가 보셨어요?" }}
        replyLink={{ label: "원문 메시지로 이동", onPress: () => { setHighlight(true); setStatus("원문 메시지를 표시했어요."); } }}>
        <Text>네! 생각보다 조용해서 좋았어요.</Text>
      </ChatMessage>
      <ChatMessage direction="outgoing" author="" timestamp="오후 2:33" deliveryLabel={deliveryCopy[delivered ? "sent" : busy ? "pending" : "failed"]}
        actions={delivered ? null : <Button size="small" tone="secondary" loading={busy} onPress={resend}>다시 보내기</Button>}>
        <Text>주말 오후는 어때요?</Text>
      </ChatMessage>
    </Stack>
    <Heading level="level3">묶음 표시</Heading>
    {/* Timeline lists add no gap: each message's group position owns the spacing above it. */}
    <View>{groupedMessages.map(message => <ChatMessage key={message.id} direction={message.authorId === "me" ? "outgoing" : "incoming"} author={message.authorId === "me" ? "" : "서연"} timestamp={message.timestamp} groupPosition={groupPositions.get(message.id) ?? "single"} {...(message.authorId === "me" ? {} : { avatar: <Avatar name="서연" size={36} decorative source={{ uri: SEOYEON_PHOTO }} /> })}><Text>{message.text}</Text></ChatMessage>)}</View>
    <PatternStatus>{state.status === "error" ? "다시 보내지 못했어요. 메시지는 그대로 남아 있어요." : status}</PatternStatus>
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy || delivered} onPress={toggleFailure}>다음 전송 실패시키기</PreviewToolButton></PreviewTools>
  </Frame>;
}

const notifications = [
  { id: 1, name: "서연", title: "서연님이 답글을 남겼어요", description: "저도 그 산책길 좋아해요. 다음에 같이 걸어요!", time: "5분 전" },
  { id: 2, name: "민준", title: "민준님이 내 이야기에 공감했어요", description: "작은 일에도 기분 좋아지는 하루", time: "28분 전" },
  { id: 3, name: "지우", title: "함께 나누던 대화가 이어졌어요", description: "내일 3시, 같은 장소에서 만나요.", time: "1시간 전" },
] as const;
// Read state ids map to copy through a table; statusLabel keeps read state readable without weight alone.
const readCopy = { read: "확인함", unread: "새 알림" } as const;
const readStatusCopy = { idle: "알림을 누르면 읽음으로 바뀌어요.", pending: "읽음으로 표시하고 있어요.", success: "읽음으로 표시했어요.", error: "읽음으로 바꾸지 못해 이전 상태로 돌아왔어요." } as const;

export function NotificationItemPreview() {
  // Marking read is optimistic and rolls back on failure (action-session.md `optimisticValue`).
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction<readonly number[]>([]);
  useEffect(() => () => session.reset([]), [session]);
  const open = (id: number) => {
    // Read the session at activation time; two callbacks can precede React's next render.
    const current = session.getSnapshot();
    if (current.status === "pending" || current.value.includes(id)) return;
    const next = [...current.value, id];
    void session.run(() => request(next), { optimisticValue: next, retryable: true });
  };
  return <Frame>
    <Heading level="level3">알림 항목</Heading>
    <Stack gap="sm">{notifications.map(entry => {
      const read = state.value.includes(entry.id);
      return <NotificationItem key={entry.id} title={entry.title} description={entry.description} leading={<Avatar name={entry.name} size={32} decorative />}
        read={read} statusLabel={read ? readCopy.read : readCopy.unread} timestamp={entry.time} disabled={busy} onPress={() => open(entry.id)} />;
    })}</Stack>
    <PatternStatus>{readStatusCopy[state.status]}</PatternStatus>
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onPress={toggleFailure}>다음 읽음 처리 실패시키기</PreviewToolButton></PreviewTools>
  </Frame>;
}
