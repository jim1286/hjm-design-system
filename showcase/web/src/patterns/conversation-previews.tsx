// Item-level conversation compositions: composer, message bubble and notification row.
// The full chat/inbox screens (common-screen-previews) own screen states; these previews
// show the item interactions those screens repeat, so the two stories no longer duplicate.
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { HjmProvider } from "@hjmds/react/provider";
import { Button } from "@hjmds/react/actions";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Avatar } from "@hjmds/react/display";
import { ChatMessage, MessageComposer, NotificationItem } from "@hjmds/react/screens";
import { compositionBrandFixtures } from "../../../shared/composition-brand-fixtures";
import { useDemoAction } from "./action-recovery-previews";
import { PreviewPhoto } from "./reference-screen-parts";

// The product screen owns the outer frame; the preview shows it so the example matches the usage guide.
function Frame({ children }: { children: ReactNode }) { return <Container gutter="compact"><Stack gap="lg">{children}</Stack></Container>; }

// Purpose copy is a table like the product's purpose→i18n-key table; comment and message differ only here and in slots.
const composerCopy = {
  comment: { title: "댓글 작성", label: "댓글을 남겨 주세요", send: "등록", reply: "답글 대상 선택", replyCancel: "답글 취소" },
  message: { title: "메시지 작성", label: "메시지 입력", send: "전송", reply: "답장할 메시지 선택", replyCancel: "답장 취소" },
} as const;
export type ComposerPurpose = keyof typeof composerCopy;
type ComposerOptions = { purpose?: ComposerPurpose; initialState?: "idle" | "pending" | "error"; initialPhotos?: number };

function ComposerContents({ purpose = "comment", initialState = "idle", initialPhotos = 0 }: ComposerOptions) {
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
      <Heading level="level5" semanticLevel={2}>{copy.title}</Heading>
      <MessageComposer label={copy.label} sendLabel={copy.send} value={value} onValueChange={setValue} pending={pending} onSend={send}
        sendIcon={<ArrowUp size={20} strokeWidth={2} color="var(--hjm-color-on-primary)" />} sendPresentation="circle"
        context={error ? <Text tone="danger">전송하지 못했어요. 초안은 그대로예요. 다시 전송해 주세요.</Text> : null}
        {...(reply ? { replyTo: { author: "서연", excerpt: "오늘 어떤 하루였나요?", cancelLabel: copy.replyCancel, onCancel: () => setReply(false) } } : {})}
        {...(purpose === "message" ? {
          attachmentAction: { label: "사진 추가", icon: <Plus size={20} />, onPress: () => setPhotos(current => [...current, (current.at(-1) ?? -1) + 1]) },
          attachments: photos.map((id, index) => ({ id: String(id), removeLabel: `사진 ${index + 1} 삭제`, preview: <PreviewPhoto index={id} square label={`선택한 사진 ${index + 1}`} /> })),
          onRemoveAttachment: (id: string) => setPhotos(current => current.filter(photo => String(photo) !== id)),
        } : {})} />
      {sent.map((text, index) => <Text key={index}>{text}</Text>)}
    </Stack></Surface>
    <Stack axis="inline" wrap gap="sm">
      <Button tone="secondary" disabled={pending} onClick={() => setReply(true)}>{copy.reply}</Button>
      <Button tone="ghost" disabled={pending} selected={failureArmed} onClick={toggleFailure}>다음 전송 실패시키기</Button>
      {demoPending ? <Button tone="ghost" onClick={() => setDemoPending(false)}>대기 예제 종료</Button> : null}
    </Stack>
    <Text variant="caption" tone="muted">예제 전송은 서버에 저장하지 않습니다. Enter는 줄바꿈이고, 성공한 뒤에만 초안을 지웁니다.</Text>
  </Frame>;
}

// The same composition receives a palette; no product-specific layout or behavioral fork.
export function ComposerPreview({ brand = "default", ...props }: ComposerOptions & { brand?: "default" | keyof typeof compositionBrandFixtures }) {
  return brand === "default" ? <ComposerContents {...props} /> : <HjmProvider brandPalette={compositionBrandFixtures[brand]}><ComposerContents {...props} /></HjmProvider>;
}

const reactionOptions = [{ id: "heart", emoji: "❤️", label: "좋아요" }, { id: "laugh", emoji: "😂", label: "웃겨요" }, { id: "wow", emoji: "😮", label: "놀라워요" }, { id: "sad", emoji: "😢", label: "슬퍼요" }, { id: "fire", emoji: "🔥", label: "멋져요" }];
// Delivery ids map to copy through a table; the product supplies its own localized receipts.
const deliveryCopy = { failed: "전송 실패", pending: "보내는 중", sent: "전송됨" } as const;

export function ChatMessagePreview() {
  const [reaction, setReaction] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [status, setStatus] = useState("말풍선을 길게 누르거나 우클릭해 반응을 남겨 보세요.");
  // The failed message starts in error; resending reuses the demo action session (action-session.md).
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
  useEffect(() => { if (!highlight) return; const timer = setTimeout(() => setHighlight(false), 1500); return () => clearTimeout(timer); }, [highlight]);
  const delivered = state.status === "success";
  return <Frame>
    <Heading level="level3">대화 메시지</Heading>
    <Stack gap="lg">
      <div style={{ outline: highlight ? "2px solid var(--hjm-color-content-brand)" : undefined, borderRadius: "var(--hjm-radius-md)" }}>
        <ChatMessage direction="incoming" author="서연" timestamp="오후 2:30" avatar={<Avatar name="서연" size="small" />}
          replyAction={{ label: "답장", onPress: () => setStatus("서연님의 메시지에 답장을 준비했어요.") }}
          reactions={{ label: "메시지에 반응", closeLabel: "반응 닫기", value: reaction, onValueChange: setReaction, options: reactionOptions }}
          actions={reaction ? <Text>{reactionOptions.find(option => option.id === reaction)?.emoji}</Text> : null}>
          <Text>지난번 이야기한 산책길, 가 보셨어요?</Text>
        </ChatMessage>
      </div>
      <ChatMessage direction="outgoing" author="나" timestamp="오후 2:32" deliveryLabel="읽음"
        reply={<Text variant="caption">서연 · 지난번 이야기한 산책길, 가 보셨어요?</Text>}
        replyLink={{ label: "원문 메시지로 이동", onPress: () => { setHighlight(true); setStatus("원문 메시지를 표시했어요."); } }}>
        <Text>네! 생각보다 조용해서 좋았어요.</Text>
      </ChatMessage>
      <ChatMessage direction="outgoing" author="" timestamp="오후 2:33" deliveryLabel={deliveryCopy[delivered ? "sent" : busy ? "pending" : "failed"]}
        actions={delivered ? null : <Button size="small" tone="secondary" loading={busy} onClick={() => { void session.run(() => request(true), { retryable: true }); }}>다시 보내기</Button>}>
        <Text>주말 오후는 어때요?</Text>
      </ChatMessage>
    </Stack>
    <Text role="status">{state.status === "error" ? "다시 보내지 못했어요. 메시지는 그대로 남아 있어요." : status}</Text>
    <Button tone="ghost" selected={failureArmed} disabled={busy || delivered} onClick={toggleFailure}>다음 전송 실패시키기</Button>
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
  const open = (id: number) => {
    if (state.value.includes(id)) return;
    const next = [...state.value, id];
    void session.run(() => request(next), { optimisticValue: next, retryable: true });
  };
  return <Frame>
    <Heading level="level3">알림 항목</Heading>
    <Stack gap="sm">{notifications.map(entry => {
      const read = state.value.includes(entry.id);
      return <NotificationItem key={entry.id} title={entry.title} description={entry.description} leading={<Avatar name={entry.name} size="small" />}
        read={read} statusLabel={read ? readCopy.read : readCopy.unread} timestamp={entry.time} disabled={busy} onClick={() => open(entry.id)} />;
    })}</Stack>
    <Text role="status">{readStatusCopy[state.status]}</Text>
    <Button tone="ghost" selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 읽음 처리 실패시키기</Button>
  </Frame>;
}
