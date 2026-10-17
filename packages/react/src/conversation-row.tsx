import type { ReactNode } from "react";
import { conversationRowRecipe as recipe } from "@hjmds/design-contracts/conversation-row";
import { Text } from "./layout.js";

export type ConversationRowProps = Readonly<{
  title: string; preview: string; metadata: string; avatar: ReactNode; unread?: boolean;
}>;

/** Presentation inside a router-owned link: the host supplies its full accessible name. */
export function ConversationRow({ title, preview, metadata, avatar, unread = false }: ConversationRowProps) {
  return <span aria-hidden="true" data-hjm-conversation-row="true" data-unread={unread || undefined}
    style={{display:"flex",alignItems:"center",gap:recipe.gap,paddingInline:recipe.paddingInline,paddingBlock:recipe.paddingBlock,minWidth:0,width:"100%",boxSizing:"border-box"}}>
    <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:recipe.avatarSize,height:recipe.avatarSize,flexShrink:0,borderRadius:"50%",overflow:"hidden"}}>{avatar}</span>
    <span style={{display:"flex",flexDirection:"column",gap:recipe.contentGap,flex:1,minWidth:0}}>
      <Text style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:unread?recipe.unreadTitleWeight:recipe.titleWeight}}>{title}</Text>
      <span style={{display:"flex",minWidth:0}}>
        <Text variant="label" tone={unread?"primary":"subtle"} style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:unread?recipe.unreadPreviewWeight:recipe.titleWeight}}>{preview}</Text>
        <Text variant="label" tone={unread?"primary":"subtle"} style={{flexShrink:0,/* "pre": flex items drop the leading space of " · " (2026-10-17 comparison); still no wrap. */whiteSpace:"pre",fontWeight:unread?recipe.unreadPreviewWeight:recipe.titleWeight}}>{` · ${metadata}`}</Text>
      </span>
    </span>
    {unread?<span data-hjm-unread-dot="true" style={{width:recipe.unreadSize,height:recipe.unreadSize,flexShrink:0,borderRadius:"50%",background:"var(--hjm-color-content-brand)"}}/>:null}
  </span>;
}
