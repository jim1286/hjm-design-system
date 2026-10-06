import riverPhoto from "../../../shared/photos/river.jpg";
import { ProviderLogo } from "./provider-logo";
import { SettingsPagePreview } from "./settings-page-preview";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NotificationInboxScreen, NotificationItem, ChatScreen, ChatMessage, MessageComposer, ScreenLayout } from "@hjmds/react/screens";
import { AuthScreenLayout } from "@hjmds/react/auth-screen";
import { AuthProviderButton } from "@hjmds/react/provider-button";
import { Button, IconButton } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Top } from "@hjmds/react/top";
import { Notice } from "@hjmds/react/feedback";
import { Avatar } from "@hjmds/react/display";
import { Bell, ChevronLeft, ChevronRight, Globe2, HelpCircle, ShieldCheck, Volume2, Sparkles, MoreHorizontal, CheckCheck, MessageCircle, Heart, Palette, Settings2, Image as ImageIcon, ArrowUp } from "lucide-react";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { ListRow } from "@hjmds/react/display";

const extraReactions = [{"id": "smile", "emoji": "😀", "label": "웃는 얼굴"}, {"id": "grin", "emoji": "😁", "label": "활짝 웃음"}, {"id": "wink", "emoji": "😉", "label": "윙크"}, {"id": "love", "emoji": "😍", "label": "반한 얼굴"}, {"id": "kiss", "emoji": "😘", "label": "입맞춤"}, {"id": "cool", "emoji": "😎", "label": "멋진 얼굴"}, {"id": "think", "emoji": "🤔", "label": "생각 중"}, {"id": "party", "emoji": "🥳", "label": "축하"}, {"id": "please", "emoji": "🥺", "label": "부탁"}, {"id": "sleep", "emoji": "😴", "label": "졸려요"}, {"id": "angry", "emoji": "😡", "label": "화나요"}, {"id": "sick", "emoji": "🤒", "label": "아파요"}, {"id": "clap", "emoji": "👏", "label": "박수"}, {"id": "thumb", "emoji": "👍", "label": "최고"}, {"id": "thanks", "emoji": "🙏", "label": "감사"}, {"id": "wave", "emoji": "👋", "label": "인사"}, {"id": "strong", "emoji": "💪", "label": "힘내요"}, {"id": "ok", "emoji": "👌", "label": "좋아요 표시"}, {"id": "sparkles", "emoji": "✨", "label": "반짝임"}, {"id": "star", "emoji": "⭐", "label": "별"}, {"id": "hundred", "emoji": "💯", "label": "백 점"}, {"id": "confetti", "emoji": "🎉", "label": "축하 꽃가루"}, {"id": "flower", "emoji": "🌸", "label": "벚꽃"}, {"id": "sun", "emoji": "☀️", "label": "해"}, {"id": "moon", "emoji": "🌙", "label": "달"}, {"id": "rainbow", "emoji": "🌈", "label": "무지개"}, {"id": "coffee", "emoji": "☕", "label": "커피"}, {"id": "cake", "emoji": "🎂", "label": "케이크"}, {"id": "pizza", "emoji": "🍕", "label": "피자"}, {"id": "gift", "emoji": "🎁", "label": "선물"}, {"id": "cat", "emoji": "🐱", "label": "고양이"}, {"id": "dog", "emoji": "🐶", "label": "강아지"}];

// Fixture copy is deliberately product-like: APIs receive translated product strings in consumers.
const states = {
  ready: { kind: "ready" }, loading: { kind: "loading", title: "소식을 가져오고 있어요" },
  empty: { kind: "empty", title: "모두 확인했어요", description: "새로운 소식이 도착하면 여기서 알려드릴게요." },
  error: { kind: "error", title: "잠시 연결이 끊겼어요", description: "지금까지의 내용은 안전해요. 잠시 후 다시 연결해 주세요." },
  restricted: { kind: "restricted", title: "내 이야기로 이어가기", description: "로그인하고 나에게 온 소식을 확인해 보세요." },
} as const satisfies Record<string, ScreenContentState>;
export type ScreenPreviewOptions = { stateKind?: keyof typeof states; tools?: boolean };
const glyphs = { bell: Bell, back: ChevronLeft, next: ChevronRight, language: Globe2, help: HelpCircle, shield: ShieldCheck, sound: Volume2, spark: Sparkles, more: MoreHorizontal, check: CheckCheck, chat: MessageCircle, heart: Heart, palette: Palette, settings: Settings2 };
function Glyph({ name }: { name: keyof typeof glyphs }) { const GlyphIcon = glyphs[name];  return <GlyphIcon size={20} color={"currentColor"} strokeWidth={1.8} />; }
function Person({ name }: { name: string }) { return <Avatar name={name} size="small" />; }
function Frame({ children, login = false }: { children: ReactNode; login?: boolean }) { return <div style={{ height: login ? "auto" : "90dvh", width: "100%" }}>{children}</div>; }
type ReplyTarget = {id:string; author:string; text:string};
type DemoMessage = ReplyTarget & {direction:"incoming"|"outgoing"; timestamp:string; replyTo?:ReplyTarget};
const initialMessages: DemoMessage[] = [
 {id:"first",author:"서연",direction:"incoming",timestamp:"오후 2:30",text:"오늘 날씨 정말 좋네요. 지난번 이야기한 산책길, 가 보셨어요?"},
 {id:"second",author:"나",direction:"outgoing",timestamp:"오후 2:32",text:"네! 생각보다 조용해서 좋았어요. 사진도 몇 장 남겼어요."},
 {id:"third",author:"서연",direction:"incoming",timestamp:"오후 2:33",text:"다음에는 같이 걸어요 🙂"},
 {id:"fourth",author:"나",direction:"outgoing",timestamp:"오후 2:34",text:"좋아요! 주말 오후는 어때요?"},
 {id:"fifth",author:"서연",direction:"incoming",timestamp:"오후 2:35",text:"토요일 괜찮아요. 천천히 걸으면서 이야기해요."},
 {id:"sixth",author:"나",direction:"outgoing",timestamp:"오후 2:36",text:"그럼 입구에서 만나요!",replyTo:{id:"first",author:"서연",text:"지난번 이야기한 산책길, 가 보셨어요?"}},
];
// 2026-10-06: composer/message/notification-item kinds moved to conversation-previews (구성 항목) and were removed here.
type Kind = "login" | "settings" | "notifications" | "chat" | "shell";
// Demo failure toggle copy per screen (product: kind → i18n key). Login and shell have no toggle: login has its own failure story.
const failToggleCopy = { chat: ["다음 전송 실패", "전송 실패 예약됨"], notifications: ["다음 읽음 저장 실패", "읽음 저장 실패 예약됨"] } as const;
const loginDelay = 600;
function ScreenPreview({ kind: initialKind, stateKind = "ready", tools = false }: ScreenPreviewOptions & { kind: Kind }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [atHome, setAtHome] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const state: ScreenContentState = recovered ? states.ready : states[stateKind];
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<number[]>([]);
  const [reaction, setReaction] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);
  const [notificationTab,setNotificationTab]=useState("전체");
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  useEffect(() => { if (!highlight) return; const timer=setTimeout(() => setHighlight(null),1500); return () => clearTimeout(timer); }, [highlight]);
  const messageNodes = useRef(new Map<string,HTMLDivElement>());
  const jump = (id:string) => { messageNodes.current.get(id)?.scrollIntoView({block:"center",behavior:"instant"}); setHighlight(id); };
  const [failNext, setFailNext] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  // "loading" on the login screen means a provider sign-in in progress (pendingLabel), not the initial
  // provider-list fetch: LS-09 keeps those two states apart.
  const [loginBusy, setLoginBusy] = useState(initialKind === "login" && stateKind === "loading");
  const [loginError, setLoginError] = useState(false);
  const failLogin = useRef(initialKind === "login" && stateKind === "error");
  const loginJob = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(loginJob.current), []);
  const startLogin = () => {
    if (loginBusy) return;
    setLoginError(false); setLoginBusy(true);
    loginJob.current = setTimeout(() => {
      setLoginBusy(false);
      if (failLogin.current) { failLogin.current = false; setLoginError(true); } else setAtHome(true);
    }, loginDelay);
  };
  const cancelLogin = () => { clearTimeout(loginJob.current); setLoginBusy(false); }; // LS-09: cancel restores buttons without a failure sentence
  const [readError, setReadError] = useState(false);
  const notice = failed ? <Text tone="danger">보내지 못했어요. 작성한 메시지는 남아 있어요.</Text> : readError ? <Text tone="danger">읽음 표시를 저장하지 못했어요. 알림을 다시 눌러 주세요.</Text> : detail ? <Stack gap="sm"><Text>{detail}</Text><Button tone="ghost" onClick={() => setDetail(null)}>닫기</Button></Stack> : null;
  const composer = <MessageComposer value={draft} onValueChange={setDraft} label="메시지 보내기" sendLabel="전송" context={notice} {...(replyTarget ? {replyTo:{author:replyTarget.author,excerpt:replyTarget.text,cancelLabel:"답장 취소",onCancel:() => setReplyTarget(null)}} : {})} sendPresentation="circle" sendIcon={<ArrowUp size={20} strokeWidth={2} color="var(--hjm-color-on-primary)"/>} attachmentAction={{label:"사진 추가", icon:<ImageIcon size={20}/>, onPress:() => setPhotos(current => [...current, (current.at(-1) ?? -1) + 1])}}
    attachments={photos.map((id,index) => ({id:String(id),removeLabel:`사진 ${index + 1} 삭제`,preview:<img src={riverPhoto} alt={`선택한 사진 ${index + 1}`} />}))}
    onRemoveAttachment={id => setPhotos(current => current.filter(photo => String(photo) !== id))} onSend={value => {
    if (failNext) { setFailed(true); setFailNext(false); return; }
    setMessages(current => [...current, {id:`sent-${current.length}`,author:"나",direction:"outgoing",timestamp:"지금",text:value || `사진 ${photos.length}장`,...(replyTarget ? {replyTo:replyTarget} : {})}]); setReplyTarget(null); setPhotos([]); setDraft(""); setFailed(false);
  }} />;
  const retry = state.kind === "error" || state.kind === "restricted" ? <Button onClick={() => setRecovered(true)}>{state.kind === "restricted" ? "로그인" : "다시 연결"}</Button> : null;
  const back = <IconButton label="뒤로" tone="ghost" onClick={() => { setDetail(null); setAtHome(true); }}><Glyph name="back" /></IconButton>;
  const entries = [
    { id: 1, name: "서연", title: "서연님이 답글을 남겼어요", description: "저도 그 산책길 좋아해요. 다음에 같이 걸어요!", time: "5분 전", icon: "chat" as const },
    { id: 2, name: "민준", title: "민준님이 내 이야기에 공감했어요", description: "작은 일에도 기분 좋아지는 하루", time: "28분 전", icon: "heart" as const },
    { id: 3, name: "지우", title: "함께 나누던 대화가 이어졌어요", description: "내일 3시, 같은 장소에서 만나요.", time: "1시간 전", icon: "chat" as const },
    { id: 4, name: "안내", title: "이번 주의 이야기가 모였어요", description: "소중했던 순간을 다시 만나 보세요.", time: "어제", icon: "spark" as const },
  ];
  let screen;
  if (kind === "settings") screen = <SettingsPagePreview leading={back} state={state} stateAction={retry} />;
  else if (kind === "notifications") screen = <NotificationInboxScreen title="알림" leading={back} state={state} stateAction={retry} notice={readError ? notice : null}
    filters={<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{["전체","답글","읽지 않음"].map(value=><Button key={value} size="small" tone="ghost" selected={notificationTab===value} onClick={()=>setNotificationTab(value)}>{value}</Button>)}</Stack>}
    actions={<IconButton label="알림 설정" tone="ghost" onClick={() => setKind("settings")}><Glyph name="settings" /></IconButton>}>
    <Stack gap="xl">{[{title:"오늘", items:entries.slice(0,3)}, {title:"이번 주", items:entries.slice(3)}].map(group => <Stack key={group.title} gap="sm"><Heading level="level5" semanticLevel={2}>{group.title}</Heading>{group.items.filter(entry=>notificationTab==="전체"||notificationTab==="답글"&&entry.icon==="chat"||notificationTab==="읽지 않음"&&!readIds.includes(entry.id)&&entry.id!==4).map(entry => <NotificationItem key={entry.id} title={entry.title} description={entry.description}
      leading={<Person name={entry.name} />} trailing={<Glyph name={entry.icon} />} read={readIds.includes(entry.id) || entry.id === 4} statusLabel={readIds.includes(entry.id) || entry.id === 4 ? "확인함" : "새 알림"} timestamp={entry.time}
      onClick={() => { if (failNext) { setFailNext(false); setReadError(true); return; } setReadError(false); setReadIds(ids => [...ids, entry.id]); setDetail(entry.description); }} />)}</Stack>)}</Stack>
  </NotificationInboxScreen>;
  else if (kind === "chat") screen = <ChatScreen title="서연" leading={<Stack axis="inline" gap="xs" align="center">{back}<Person name="서연"/></Stack>} state={state} stateAction={retry} scroll="screen" composer={composer}
    actions={<IconButton label="대화 정보" tone="ghost" onClick={() => setDetail("서연님과 나누는 대화예요.")}><Glyph name="more" /></IconButton>}>
    <Stack gap="lg"><Stack align="center"><Text variant="caption" tone="muted">10월 5일 월요일</Text></Stack>
      {[...initialMessages,...messages].map(message => <div key={message.id} ref={node => {if(node) messageNodes.current.set(message.id,node); else messageNodes.current.delete(message.id);}} style={{outline:highlight===message.id ? "2px solid var(--hjm-color-content-brand)" : undefined,borderRadius:"var(--hjm-radius-md)"}}>
        <ChatMessage direction={message.direction} author={message.author} timestamp={message.timestamp}
          replyAction={{label:"답장",onPress:() => setReplyTarget(message)}}
          {...(message.replyTo ? {reply:<Text variant="caption">{message.replyTo.author} · {message.replyTo.text}</Text>,replyLink:{label:"원문 메시지로 이동",onPress:() => jump(message.replyTo!.id)}} : {})}
          {...(message.id === "first" ? {reactions:{label:"메시지에 반응",closeLabel:"반응 닫기",value:reaction,onValueChange:setReaction,more:{label:"더 많은 이모지",options:extraReactions},options:[{id:"heart",emoji:"❤️",label:"좋아요"},{id:"laugh",emoji:"😂",label:"웃겨요"},{id:"wow",emoji:"😮",label:"놀라워요"},{id:"sad",emoji:"😢",label:"슬퍼요"},{id:"fire",emoji:"🔥",label:"멋져요"}]}} : {})}
          actions={message.id === "first" && reaction ? <Text>{({heart:"❤️",laugh:"😂",wow:"😮",sad:"😢",fire:"🔥"} as Record<string,string>)[reaction] ?? extraReactions.find(item => item.id === reaction)?.emoji}</Text> : null}>
          <Text>{message.text}</Text>
        </ChatMessage></div>)}

    </Stack>
  </ChatScreen>;
  else if (kind === "login") screen = <AuthScreenLayout hero={<Stack gap="lg" align="center"><Glyph name="chat"/><Top descriptor={{ eyebrow: "이야기", title: "당신의 일상을 이야기로 남겨요", description: "사진 한 장, 짧은 한 줄로 시작하세요." }} /></Stack>} mainCard
    {...(loginBusy ? { pendingLabel: "로그인 중" } : {})}
    main={<Stack gap="sm">{loginError ? <Notice tone="danger" title="로그인하지 못했어요" description="잠시 후 다시 시도해 주세요." /> : null}<AuthProviderButton descriptor={{ provider: "google", label: "Google" }} logo={<ProviderLogo provider="google" />} onClick={startLogin} /><AuthProviderButton descriptor={{ provider: "apple", label: "Apple" }} logo={<ProviderLogo provider="apple" />} onClick={startLogin} /></Stack>}
    footer={<Stack gap="xs" align="center"><Text variant="caption" tone="muted">계속하면 이용약관과 개인정보처리방침에 동의해요.</Text><Stack axis="inline" gap="md"><Button size="small" tone="ghost" onClick={() => setDetail("이용약관 예제 · 실제 서비스의 약관을 연결하는 영역이에요.")}>이용약관</Button><Button size="small" tone="ghost" onClick={() => setDetail("개인정보처리방침 예제 · 수집 항목과 보관 기간을 안내하는 영역이에요.")}>개인정보처리방침</Button></Stack>{detail ? <Text variant="caption">{detail}</Text> : null}{loginBusy ? <Button tone="ghost" onClick={cancelLogin}>예제 로그인 취소</Button> : null}</Stack>} />;
  else screen = <ScreenLayout title="내 소식" leading={back} state={state} stateAction={retry}><Text>나에게 도착한 이야기를 여기에서 확인해요.</Text></ScreenLayout>;
  // Local navigation keeps the fixture reversible without changing the host router.
  if (atHome) screen = <ScreenLayout title="나의 공간" description="오늘의 이야기와 소식을 만나 보세요."><Stack gap="sm">{([['settings', '설정'], ['notifications', '알림'], ['chat', '서연과의 대화']] as const).map(([target, label]) => <ListRow key={target} title={label} trailing={<Glyph name="next" />} onClick={() => { setKind(target); setAtHome(false); }} />)}</Stack></ScreenLayout>;
  else if (detail && kind !== "login") screen = <ScreenLayout title={kind === "notifications" ? "도착한 이야기" : kind === "chat" ? "대화 정보" : "상세 정보"} leading={<IconButton label="뒤로" tone="ghost" onClick={() => setDetail(null)}><Glyph name="back" /></IconButton>}><Stack gap="lg"><Text>{detail}</Text>{kind === "notifications" ? <Button onClick={() => { setDetail(null); setKind("chat"); }}>대화 이어가기</Button> : null}</Stack></ScreenLayout>;
  const toggleCopy = kind === "chat" || kind === "notifications" ? failToggleCopy[kind] : null;
  return <Stack gap="sm">{tools && toggleCopy ? <Button tone="secondary" selected={failNext} onClick={() => setFailNext(v => !v)}>{toggleCopy[failNext ? 1 : 0]}</Button> : null}<Frame login={kind === "login"}>{screen}</Frame></Stack>;
}

export function LoginScreenPreview(props: ScreenPreviewOptions) { return <ScreenPreview kind="login" {...props} />; }

export function SettingsScreenPreview(props: ScreenPreviewOptions) { return <ScreenPreview kind="settings" {...props} />; }

export function NotificationScreenPreview(props: ScreenPreviewOptions) { return <ScreenPreview kind="notifications" {...props} />; }

export function ChatScreenPreview(props: ScreenPreviewOptions) { return <ScreenPreview kind="chat" {...props} />; }

export function ScreenLayoutPreview(props: ScreenPreviewOptions) { return <ScreenPreview kind="shell" {...props} />; }

