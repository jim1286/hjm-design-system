import { MemberProfilePreview } from "./member-profile-preview.js";
import { ChatRoomPreview } from "./ChatRoom.preview";
import { useState } from "react";
import { Ban, BellOff, MailOpen, Search, SquarePen, Trash2 } from "lucide-react";
import { Text } from "@hjmds/react/layout";
import { IconButton } from "@hjmds/react/actions";
import { SearchField } from "@hjmds/react/forms";
import { Avatar } from "@hjmds/react/display";
import { ConversationRow } from "@hjmds/react/conversation-row";
import { ContextMenu } from "@hjmds/react/context-menu";
import { ConversationListScreen } from "@hjmds/react/screens";
import { PreviewRoute, PreviewTools } from "./preview-tools.js";
import { conversationActionResult, conversationListActions, conversationListCopy as copy, conversationOpened, conversationRowMenuLabel, conversationRowSummary, filterConversations, type ConversationListAction } from "../../../shared/conversation-list.js";

// 2026-10-16 conversation list: right-click/long-press opens the measured DM action menu
// (mark unread, mute, then block/delete in the danger tone). Click still opens the conversation.
const icons: Record<ConversationListAction, typeof MailOpen> = { unread: MailOpen, mute: BellOff, block: Ban, delete: Trash2 };

export function ConversationListPreview({ tools = false }: { tools?: boolean }) {
  const [member,setMember]=useState<{name:string;photo:string}|null>(null);
  const [creating,setCreating]=useState(false);
  const [status, setStatus] = useState<string>(copy.hint);
  const [query, setQuery] = useState("");
  const rows = filterConversations(query);
  // The demo result line is a preview tool, not screen content: only the tools story shows it, as other screen stories
  // keep demo controls out of the default canvas (2026-10-17 review). The product's notice slot holds search.
  // ConversationRow owns its 16pt inline inset, so the body uses while header and search keep
  // the screen gutter: rows start 16 from the edge like Instagram DM instead of 32 (review S5#9).
  if(member)return <MemberProfilePreview name={member.name} avatar={<Avatar name={member.name} size="xlarge" decorative src={member.photo}/>} onBack={()=>setMember(null)}/>;
  if(creating)return <ChatRoomPreview initialMode="create" onClose={()=>setCreating(false)}/>;
  return <PreviewRoute before={tools ? <PreviewTools><Text tone="muted" role="status">{status}</Text></PreviewTools> : null}>
      <ConversationListScreen title={copy.title} as="section" scroll="content"
        actions={<IconButton edge="end" label={copy.compose} tone="ghost" onClick={() => setCreating(true)}><SquarePen size={20} /></IconButton>}
        search={<SearchField label={copy.search} clearLabel={copy.clearSearch} placeholder={copy.searchPlaceholder} renderSearchIcon={({ color, size }) => <Search aria-hidden color={color} size={size} />} value={query} onValueChange={setQuery} />}
        state={rows.length ? { kind: "ready" } : { kind: "empty", title: copy.noMatch }}>
        <div>{rows.map(row => <ConversationRow key={row.id} title={row.name} preview={row.preview} metadata={row.time} unread={row.unread}
          {...(row.id!=="walk"?{avatarAction:{label:`${row.name} 프로필 보기`,onPress:()=>setMember({name:row.name,photo:row.photo})}}:{})}
          avatar={<Avatar name={row.name} size="large" decorative src={row.photo}/>}
          renderBody={body=><div style={{flex:1,minWidth:0}}><ContextMenu accessibilityLabel={conversationRowMenuLabel(row)}
            items={conversationListActions.map(action=>{const Icon=icons[action.id];return {id:action.id,label:action.label,textValue:action.label,icon:<Icon size={20}/>,...(action.danger?{tone:"danger" as const}:{})};})}
            onAction={id=>setStatus(conversationActionResult(row,id))}>
            <a href={`#${row.id}`} aria-label={conversationRowSummary(row)} onClick={event=>{event.preventDefault();setStatus(conversationOpened(row));}} style={{display:"block",color:"inherit",textDecoration:"none"}}>{body}</a>
          </ContextMenu></div>}/> )}</div>
      </ConversationListScreen>
  </PreviewRoute>;
}
