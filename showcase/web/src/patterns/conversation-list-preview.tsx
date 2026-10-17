import { useState } from "react";
import { Ban, BellOff, MailOpen, Search, SquarePen, Trash2 } from "lucide-react";
import { Text } from "@hjmds/react/layout";
import { IconButton } from "@hjmds/react/actions";
import { SearchField } from "@hjmds/react/forms";
import { Avatar } from "@hjmds/react/display";
import { ConversationRow } from "@hjmds/react/conversation-row";
import { ContextMenu } from "@hjmds/react/context-menu";
import { ScreenLayout } from "@hjmds/react/screens";
import { PreviewRoute, PreviewTools } from "./preview-tools";
import { conversationActionResult, conversationListActions, conversationListCopy as copy, conversationOpened, conversationRowMenuLabel, conversationRowSummary, filterConversations, type ConversationListAction } from "../../../shared/conversation-list";

// 2026-10-16 conversation list: right-click/long-press opens the measured DM action menu
// (mark unread, mute, then block/delete in the danger tone). Click still opens the conversation.
const icons: Record<ConversationListAction, typeof MailOpen> = { unread: MailOpen, mute: BellOff, block: Ban, delete: Trash2 };

export function ConversationListPreview({ tools = false }: { tools?: boolean }) {
  const [status, setStatus] = useState<string>(copy.hint);
  const [query, setQuery] = useState("");
  const rows = filterConversations(query);
  // The demo result line is a preview tool, not screen content: only the tools story shows it, as other screen stories
  // keep demo controls out of the default canvas (2026-10-17 review). The product's notice slot holds search.
  return <PreviewRoute before={tools ? <PreviewTools><Text tone="muted" role="status">{status}</Text></PreviewTools> : null}>
      <ScreenLayout title={copy.title} as="section" scroll="content"
        actions={<IconButton label={copy.compose} tone="ghost" onClick={() => setStatus(`${copy.compose}를 시작해요.`)}><SquarePen size={20} /></IconButton>}
        notice={<SearchField label={copy.search} clearLabel={copy.clearSearch} placeholder={copy.searchPlaceholder} renderSearchIcon={({ color, size }) => <Search aria-hidden color={color} size={size} />} value={query} onValueChange={setQuery} />}
        state={rows.length ? { kind: "ready" } : { kind: "empty", title: copy.noMatch }}>
        <div>{rows.map(row => <ContextMenu key={row.id} accessibilityLabel={conversationRowMenuLabel(row)}
          items={conversationListActions.map(action => { const Icon = icons[action.id]; return { id: action.id, label: action.label, textValue: action.label, icon: <Icon size={20} />, ...(action.danger ? { tone: "danger" as const } : {}) }; })}
          onAction={id => setStatus(conversationActionResult(row, id))}>
          <a href={`#${row.id}`} aria-label={conversationRowSummary(row)} onClick={event => { event.preventDefault(); setStatus(conversationOpened(row)); }} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
            <ConversationRow title={row.name} preview={row.preview} metadata={row.time} unread={row.unread} avatar={<Avatar name={row.name} size="large" src={row.photo} alt="" />} />
          </a>
        </ContextMenu>)}</div>
      </ScreenLayout>
  </PreviewRoute>;
}
