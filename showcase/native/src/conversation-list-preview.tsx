import { MemberProfilePreview } from "./member-profile-preview";
import { ChatRoomPreview } from "./ChatRoom.preview";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ban, BellOff, MailOpen, Search, SquarePen, Trash2 } from "lucide-react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Stack } from "@hjmds/react-native/primitives";
import { IconButton } from "@hjmds/react-native/actions";
import { SearchField } from "@hjmds/react-native/inputs";
import { Avatar } from "@hjmds/react-native/data-display";
import { ConversationRow } from "@hjmds/react-native/conversation-row";
import { ContextMenu } from "@hjmds/react-native/context-menu";
import { ConversationListScreen } from "@hjmds/react-native/screens";
import { PreviewTools } from "./preview-tools";
import { PatternStatus } from "./pattern-status";
import { conversationActionResult, conversationListActions, conversationListCopy as copy, conversationOpened, conversationRowMenuLabel, conversationRowSummary, filterConversations, type ConversationListAction } from "../../shared/conversation-list";

// 2026-10-16 conversation list: long-press opens the action menu measured from Instagram DM
// (mark unread, mute, then block/delete in the danger tone). Tap still opens the conversation.
const icons: Record<ConversationListAction, typeof MailOpen> = { unread: MailOpen, mute: BellOff, block: Ban, delete: Trash2 };

export function ConversationListPreview({ tools = false }: { tools?: boolean }) {
  const { colors } = useHjmNativeTheme();
  const [member,setMember]=useState<{name:string;photo:string}|null>(null);
  const [creating,setCreating]=useState(false);
  const [status, setStatus] = useState<string>(copy.hint);
  const [query, setQuery] = useState("");
  const rows = filterConversations(query);
  // The demo result line is a preview tool, not screen content: only the tools story shows it, as other screen stories
  // keep demo controls out of the default canvas (2026-10-17 review). The product's notice slot holds search.
  // Host height stands in for the product route.
  // ConversationRow owns its 16pt inline inset, so the body uses while header and search keep
  // the screen gutter: rows start 16 from the edge like Instagram DM instead of 32 (review S5#9).
  if(member)return <MemberProfilePreview name={member.name} avatar={<Avatar name={member.name} size="xlarge" decorative source={{uri:member.photo}}/>} onBack={()=>setMember(null)}/>;
  if(creating)return <ChatRoomPreview initialMode="create" onClose={()=>setCreating(false)}/>;
  return <Stack gap="sm" layoutStyle={{ flex: 1 }}>
    {tools ? <PreviewTools><PatternStatus tone="muted">{status}</PatternStatus></PreviewTools> : null}
    <View style={{ flex: 1, width: "100%" }}>
      <ConversationListScreen title={copy.title}
        actions={<IconButton edge="end" label={copy.compose} tone="ghost" onPress={() => setCreating(true)}><SquarePen size={20} color={colors.text} /></IconButton>}
        search={<SearchField label={copy.search} clearLabel={copy.clearSearch} busyLabel={copy.searching} placeholder={copy.searchPlaceholder} renderLeading={({ color, size }) => <Search color={color} size={size} />} value={query} onValueChange={setQuery} />}
        state={rows.length ? { kind: "ready" } : { kind: "empty", title: copy.noMatch }}>
        <View>{rows.map(row => <ConversationRow key={row.id} title={row.name} preview={row.preview} metadata={row.time} unread={row.unread}
          {...(row.id!=="walk"?{avatarAction:{label:`${row.name} 프로필 보기`,onPress:()=>setMember({name:row.name,photo:row.photo})}}:{})}
          avatar={<Avatar name={row.name} size={56} decorative source={{uri:row.photo}}/>}
          renderBody={body=><View style={{flex:1,minWidth:0}}><ContextMenu accessibilityLabel={conversationRowMenuLabel(row)}
            items={conversationListActions.map(action=>{const Icon=icons[action.id];return {id:action.id,label:action.label,icon:<Icon size={20} color={action.danger?colors.danger:colors.text}/>,...(action.danger?{tone:"danger" as const}:{})};})}
            onAction={id=>setStatus(conversationActionResult(row,id))}>
            <Pressable accessibilityRole="link" accessibilityLabel={conversationRowSummary(row)} onPress={()=>setStatus(conversationOpened(row))}>{body}</Pressable>
          </ContextMenu></View>}/> )}</View>
      </ConversationListScreen>
    </View>
  </Stack>;
}
