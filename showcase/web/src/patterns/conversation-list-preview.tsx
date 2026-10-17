import { useState } from "react";
import { Ban, BellOff, MailOpen, SquarePen, Trash2 } from "lucide-react";
import { Stack, Text } from "@hjmds/react/layout";
import { IconButton } from "@hjmds/react/actions";
import { SearchField } from "@hjmds/react/forms";
import { Avatar } from "@hjmds/react/display";
import { ConversationRow } from "@hjmds/react/conversation-row";
import { ContextMenu } from "@hjmds/react/context-menu";
import { ScreenLayout } from "@hjmds/react/screens";
import { PreviewTools } from "./preview-tools";
import { conversationActionResult, conversationListActions, conversationListCopy as copy, conversationOpened, conversationRowMenuLabel, conversationRowSummary, filterConversations, type ConversationListAction } from "../../../shared/conversation-list";

// 2026-10-16 conversation list: right-click/long-press opens the measured DM action menu
// (mark unread, mute, then block/delete in the danger tone). Click still opens the conversation.
const icons: Record<ConversationListAction, typeof MailOpen> = { unread: MailOpen, mute: BellOff, block: Ban, delete: Trash2 };

export function ConversationListPreview() {
  const [status, setStatus] = useState<string>(copy.hint);
  const [query, setQuery] = useState("");
  const rows = filterConversations(query);
  // The demo result line is a preview tool, not screen content; the product's notice slot holds search.
  return <Stack gap="sm" style={{ height: 720 }}>
    <PreviewTools><Text tone="muted" role="status">{status}</Text></PreviewTools>
    <div style={{ flex: 1, minHeight: 0 }}>
      <ScreenLayout title={copy.title} as="section" scroll="content"
        actions={<IconButton label={copy.compose} tone="ghost" onClick={() => setStatus(`${copy.compose}를 시작해요.`)}><SquarePen size={20} /></IconButton>}
        notice={<SearchField label={copy.search} clearLabel={copy.clearSearch} value={query} onValueChange={setQuery} />}
        state={rows.length ? { kind: "ready" } : { kind: "empty", title: copy.noMatch }}>
        <div>{rows.map(row => <ContextMenu key={row.id} accessibilityLabel={conversationRowMenuLabel(row)}
          items={conversationListActions.map(action => { const Icon = icons[action.id]; return { id: action.id, label: action.label, textValue: action.label, icon: <Icon size={20} />, ...(action.danger ? { tone: "danger" as const } : {}) }; })}
          onAction={id => setStatus(conversationActionResult(row, id))}>
          <a href={`#${row.id}`} aria-label={conversationRowSummary(row)} onClick={event => { event.preventDefault(); setStatus(conversationOpened(row)); }} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
            <ConversationRow title={row.name} preview={row.preview} metadata={row.time} unread={row.unread} avatar={<Avatar name={row.name} size="large" src={row.photo} alt="" />} />
          </a>
        </ContextMenu>)}</div>
      </ScreenLayout>
    </div>
  </Stack>;
}
