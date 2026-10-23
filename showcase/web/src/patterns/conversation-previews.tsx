// Item-level conversation compositions: composer, message bubble and notification row.
// The full chat/inbox screens (common-screen-previews) own screen states; these previews
// show the item interactions those screens repeat, so the two stories no longer duplicate.
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus, RefreshCw, Check, Pencil, Trash2 } from "lucide-react";
import { HjmProvider } from "@hjmds/react/provider";
import { AlertDialog } from "@hjmds/react/overlays";
import { IconButton } from "@hjmds/react/actions";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Avatar } from "@hjmds/react/display";
import { ChatMessage, MessageComposer, NotificationItem } from "@hjmds/react/screens";
import { resolveChatMessageGroups } from "@hjmds/design-contracts/screen-patterns";
import { compositionBrandFixtures } from "../../../shared/composition-brand-fixtures";
import { useDemoAction } from "./action-recovery-previews";
import { PreviewPhoto } from "./reference-screen-parts";
import { PreviewToolButton, PreviewTools } from "./preview-tools";
import { composerCopy, composerEndPendingLabel, composerPreviewNote, type ComposerPurpose } from "../../../shared/composer-copy";

// Failure arming is a demo-only tool: it sits in PreviewTools after each composition (SELECTION.md 조립 규칙).
// The product screen owns the outer frame; the preview shows it so the example matches the usage guide.
// The live status sits after the card: an always-mounted empty line inside it padded the Surface.
export type { ComposerPurpose };
type ComposerOptions = { purpose?: ComposerPurpose; initialState?: "idle" | "pending" | "error"; initialPhotos?: number };

function ComposerContents({ purpose = "comment", initialState = "idle", initialPhotos = 0 }: ComposerOptions) {
  const copy = composerCopy[purpose];
  const input = useRef<HTMLTextAreaElement>(null);
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
    // The send control becomes disabled/absent during confirmation; keep typing focus in the persistent field.
    input.current?.focus();
    const outcome = await session.run(() => request(text), { retryable: true });
    // The draft, photos and reply target are cleared only after the server confirms.
    if (outcome.status === "success") { setSent(items => [...items, text || `사진 ${photos.length}장`]); setValue(""); setReply(false); setPhotos([]); }
  };
  return <Container gutter="compact" size="reading"><Stack gap="lg">
    <Surface padding="lg"><Stack gap="md">
      <Heading level="level5" semanticLevel={2}>{copy.title}</Heading>
      <MessageComposer inputRef={input} label={copy.label} sendLabel={copy.send} value={value} onValueChange={setValue} pending={pending} onSend={send}
        sendIcon={<ArrowUp size={20} strokeWidth={2} color="var(--hjm-color-on-primary)" />} sendPresentation="circle"
        context={error ? <Text role="alert" tone="danger">전송하지 못했어요. 초안은 그대로예요. 다시 전송해 주세요.</Text> : null}
        {...(reply ? { replyTo: { author: "서연", excerpt: "오늘 어떤 하루였나요?", cancelLabel: copy.replyCancel, onCancel: () => setReply(false) } } : {})}
        {...(purpose === "message" ? {
          attachmentAction: { label: "사진 추가", icon: <Plus size={20} />, onPress: () => setPhotos(current => [...current, (current.at(-1) ?? -1) + 1]) },
          attachments: photos.map((id, index) => ({ id: String(id), removeLabel: `사진 ${index + 1} 삭제`, preview: <PreviewPhoto index={id} square label={`선택한 사진 ${index + 1}`} /> })),
          onRemoveAttachment: (id: string) => setPhotos(current => current.filter(photo => String(photo) !== id)),
        } : {})} />
      {sent.map((text, index) => <Text key={index}>{text}</Text>)}
    </Stack></Surface>
    <Text role="status">{sent.length ? `전송한 항목 ${sent.length}개` : ""}</Text>
    {/* Reply targeting and leaving the held pending state are demo-only tools, kept after the composition. */}
    <PreviewTools>
      <PreviewToolButton disabled={pending} onClick={() => setReply(true)}>{copy.reply}</PreviewToolButton>
      {demoPending ? <PreviewToolButton onClick={() => setDemoPending(false)}>{composerEndPendingLabel}</PreviewToolButton> : null}
      <PreviewToolButton disabled={pending} selected={failureArmed} onClick={toggleFailure}>다음 전송 실패시키기</PreviewToolButton>
    </PreviewTools>
    <Text variant="caption" tone="muted">{composerPreviewNote}</Text>
  </Stack></Container>;
}

// The same composition receives a palette; no product-specific layout or behavioral fork.
export function ComposerPreview({ brand = "default", ...props }: ComposerOptions & { brand?: "default" | keyof typeof compositionBrandFixtures }) {
  return brand === "default" ? <ComposerContents {...props} /> : <HjmProvider brandPalette={compositionBrandFixtures[brand]}><ComposerContents {...props} /></HjmProvider>;
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
  const [reaction, setReaction] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [status, setStatus] = useState("말풍선을 길게 누르거나 우클릭해 반응을 남겨 보세요.");
  // The failed message starts in error; resending reuses the demo action session (action-session.md).
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction(false);
  useEffect(() => () => session.reset(false), [session]);
  const resendButton = useRef<HTMLButtonElement>(null), receipt = useRef<HTMLSpanElement>(null);
  const resend = () => { void session.run(async () => {
    const result = await request(true);
    if (session.getSnapshot().status === "pending") {
      // Recover only the disappearing action; navigation elsewhere or an explicit blur stays owned by the user.
      if (document.activeElement === resendButton.current) receipt.current?.focus();
      setStatus("메시지를 전송했어요.");
    }
    return result;
  }, { retryable: true }); };
  useEffect(() => { if (!highlight) return; const timer = setTimeout(() => setHighlight(false), 1500); return () => clearTimeout(timer); }, [highlight]);
  const delivered = state.status === "success";
  return <Container gutter="compact"><Stack gap="lg">
    <Heading level="level3">대화 메시지</Heading>
    <Stack gap="lg">
      <div style={{ outline: highlight ? "2px solid var(--hjm-color-content-brand)" : undefined, borderRadius: "var(--hjm-radius-md)" }}>
        <ChatMessage direction="incoming" author="서연" timestamp="오후 2:30" avatar={<Avatar name="서연" size="small" src={SEOYEON_PHOTO} alt="" />}
          replyAction={{ label: "답장", onPress: () => setStatus("서연님의 메시지에 답장을 준비했어요.") }}
          reactions={{ label: "메시지에 반응", closeLabel: "반응 닫기", value: reaction, onValueChange: setReaction, options: reactionOptions, reportAction: { label: "신고", onPress: () => setStatus("서연님의 메시지 신고를 접수했어요.") },
            // The summary is HJM's pill beside the time; pressing it opens the same hold menu (2026-10-18).
            ...(reaction ? { summary: { label: `반응 ${reactionOptions.find(option => option.id === reaction)?.emoji ?? ""} 1개. 반응 메뉴 열기`, items: [{ id: reaction, emoji: reactionOptions.find(option => option.id === reaction)?.emoji ?? "", count: 1 }] } } : {}) }}>
          <Text>지난번 이야기한 산책길, 가 보셨어요?</Text>
        </ChatMessage>
      </div>
      <ChatMessage direction="outgoing" author="나" timestamp="오후 2:32" deliveryLabel="읽음"
        replyQuote={{ title: "서연에게 답장", excerpt: "지난번 이야기한 산책길, 가 보셨어요?" }}
        replyLink={{ label: "원문 메시지로 이동", onPress: () => { setHighlight(true); setStatus("원문 메시지를 표시했어요."); } }}>
        <Text>네! 생각보다 조용해서 좋았어요.</Text>
      </ChatMessage>
      <ChatMessage direction="outgoing" author="" timestamp="오후 2:33" deliveryLabel={deliveryCopy[delivered ? "sent" : busy ? "pending" : "failed"]}
        actions={delivered ? null : <IconButton ref={resendButton} label="다시 보내기" title="다시 보내기" size="small" tone="secondary" loading={busy} onClick={resend}><RefreshCw size={18} aria-hidden="true" /></IconButton>}>
        <Text>주말 오후는 어때요?</Text>
      </ChatMessage>
    </Stack>
    <SentMessageManagementPreview />
    <GroupReadPreview />
    <Heading level="level3">묶음 표시</Heading>
    {/* Timeline lists add no gap: each message's group position owns the spacing above it. */}
    <div>{groupedMessages.map(message => <ChatMessage key={message.id} direction={message.authorId === "me" ? "outgoing" : "incoming"} author={message.authorId === "me" ? "" : "서연"} timestamp={message.timestamp} groupPosition={groupPositions.get(message.id) ?? "single"} {...(message.authorId === "me" ? {} : { avatar: <Avatar name="서연" size="small" src={SEOYEON_PHOTO} alt="" /> })}><Text>{message.text}</Text></ChatMessage>)}</div>
    <Text ref={receipt} tabIndex={-1} role="status">{state.status === "error" ? "다시 보내지 못했어요. 메시지는 그대로 남아 있어요." : status}</Text>
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy || delivered} onClick={toggleFailure}>다음 전송 실패시키기</PreviewToolButton></PreviewTools>
  </Stack></Container>;
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
  return <Container gutter="compact"><Stack gap="lg">
    <Heading level="level3">알림 항목</Heading>
    <Stack gap="sm">{notifications.map(entry => {
      const read = state.value.includes(entry.id);
      return <NotificationItem key={entry.id} title={entry.title} description={entry.description} leading={<Avatar name={entry.name} size="small" />}
        read={read} statusLabel={read ? readCopy.read : readCopy.unread} timestamp={entry.time} aria-disabled={busy} onClick={() => open(entry.id)} />;
    })}</Stack>
    <Text role="status">{readStatusCopy[state.status]}</Text>
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 읽음 처리 실패시키기</PreviewToolButton></PreviewTools>
  </Stack></Container>;
}

/** The draft and saved message are distinct: failed saves or cancelling never consume a new-message draft. */
function SentMessageManagementPreview() {
  const [draft, setDraft] = useState("작성하던 새 메시지");
  const [editValue, setEditValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { session, state, request, failureArmed, toggleFailure, busy } = useDemoAction({ text: "토요일 오후에 만나요!", edited: false, deleted: false });
  useEffect(() => () => session.reset({ text: "토요일 오후에 만나요!", edited: false, deleted: false }), [session]);
  const cancel = () => { setEditing(false); setEditValue(""); };
  const save = async () => {
    const outcome = await session.run(() => request({ text: editValue, edited: true, deleted: false }), { retryable: true });
    if (outcome.status === "success") cancel();
  };
  return <Stack gap="md">
    <Heading level="level3">보낸 메시지 관리</Heading>
    <ChatMessage direction="outgoing" author="나" timestamp="오후 3:10" {...(state.value.edited && !state.value.deleted ? { deliveryLabel: "수정됨" } : {})}
      {...(state.value.deleted ? {} : { reactions: { label: "보낸 메시지 메뉴", closeLabel: "메시지 메뉴 닫기", options: [], value: null, onValueChange: () => {}, disabled: busy,
        menuActions: [
          { id: "edit", label: "메시지 수정", icon: <Pencil size={20} aria-hidden="true" />, onPress: () => { setEditValue(state.value.text); setEditing(true); } },
          { id: "delete", label: "메시지 삭제", tone: "danger", icon: <Trash2 size={20} aria-hidden="true" />, onPress: () => setConfirmDelete(true) },
        ],
      } })}><Text>{state.value.deleted ? "삭제된 메시지입니다" : state.value.text}</Text></ChatMessage>
    <MessageComposer value={editing ? editValue : draft} label={editing ? "메시지 수정 내용" : "새 메시지"}
      onValueChange={editing ? setEditValue : setDraft} sendLabel={editing ? "수정 저장" : "전송"}
      sendIcon={editing ? <Check size={20} aria-hidden="true" /> : <ArrowUp size={20} aria-hidden="true" />} sendPresentation="circle" pending={busy}
      onSend={() => { if (editing) void save(); else setDraft(""); }}
      {...(editing ? { editTarget: { label: "메시지 수정", excerpt: state.value.text, cancelLabel: "수정 취소", onCancel: cancel } } : {})}
      {...(editing && state.status === "error" ? { error: "수정하지 못했어요. 작성한 내용은 그대로예요." } : {})} />
    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete} request={{ mode: "confirm", title: "메시지를 삭제할까요?", description: "모든 대화 상대에게서 메시지가 삭제됩니다.", confirmLabel: "삭제", cancelLabel: "취소", tone: "danger",
      fallbackErrorMessage: "삭제하지 못했어요. 다시 시도해 주세요.", onConfirm: async () => {
        const outcome = await session.run(() => request({ text: "", edited: false, deleted: true }), { retryable: true });
        if (outcome.status !== "success") throw new Error("Delete failed");
        cancel(); setConfirmDelete(false);
      } }} />
    <PreviewTools><PreviewToolButton selected={failureArmed} disabled={busy} onClick={toggleFailure}>다음 메시지 변경 실패시키기</PreviewToolButton></PreviewTools>
  </Stack>;
}

function GroupReadPreview() {
  const [unread, setUnread] = useState(2);
  return <Stack gap="md">
    <Heading level="level3">단체 대화 읽음</Heading>
    <ChatMessage direction="outgoing" author="나" timestamp="오후 3:15" {...(unread > 0 ? { deliveryLabel: `안 읽음 ${unread}명` } : {})}>
      <Text>모두 토요일 오후에 만나요!</Text>
    </ChatMessage>
    <PreviewTools>
      <PreviewToolButton onClick={() => setUnread(value => Math.max(0, value - 1))} disabled={unread === 0}>참여자 한 명 읽음</PreviewToolButton>
      <PreviewToolButton onClick={() => setUnread(2)}>읽음 상태 초기화</PreviewToolButton>
    </PreviewTools>
  </Stack>;
}
