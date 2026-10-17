import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ban, BellOff, MailOpen, SquarePen, Trash2 } from "lucide-react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Stack } from "@hjmds/react-native/primitives";
import { IconButton } from "@hjmds/react-native/actions";
import { SearchField } from "@hjmds/react-native/inputs";
import { Avatar } from "@hjmds/react-native/data-display";
import { ConversationRow } from "@hjmds/react-native/conversation-row";
import { ContextMenu } from "@hjmds/react-native/context-menu";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { PreviewTools } from "./preview-tools";
import { PatternStatus } from "./pattern-status";
import { conversationActionResult, conversationListActions, conversationListCopy as copy, conversationOpened, conversationRowMenuLabel, conversationRowSummary, filterConversations, type ConversationListAction } from "../../shared/conversation-list";

// 2026-10-16 conversation list: long-press opens the action menu measured from Instagram DM
// (mark unread, mute, then block/delete in the danger tone). Tap still opens the conversation.
const icons: Record<ConversationListAction, typeof MailOpen> = { unread: MailOpen, mute: BellOff, block: Ban, delete: Trash2 };

export function ConversationListPreview() {
  const { colors } = useHjmNativeTheme();
  const [status, setStatus] = useState<string>(copy.hint);
  const [query, setQuery] = useState("");
  const rows = filterConversations(query);
  // The demo result line is a preview tool, not screen content; the product's notice slot holds search.
  // Host height stands in for the product route.
  return <View style={{ height: 720 }}><Stack gap="sm" layoutStyle={{ flex: 1 }}>
    <PreviewTools><PatternStatus tone="muted">{status}</PatternStatus></PreviewTools>
    <View style={{ flex: 1, minHeight: 0 }}>
      <ScreenLayout title={copy.title} scroll="content"
        actions={<IconButton label={copy.compose} tone="ghost" onPress={() => setStatus(`${copy.compose}를 시작해요.`)}><SquarePen size={20} color={colors.text} /></IconButton>}
        notice={<SearchField label={copy.search} clearLabel={copy.clearSearch} busyLabel={copy.searching} value={query} onValueChange={setQuery} />}
        state={rows.length ? { kind: "ready" } : { kind: "empty", title: copy.noMatch }}>
        <View>{rows.map(row => <ContextMenu key={row.id} accessibilityLabel={conversationRowMenuLabel(row)}
          items={conversationListActions.map(action => { const Icon = icons[action.id]; return { id: action.id, label: action.label, icon: <Icon size={20} color={action.danger ? colors.danger : colors.text} />, ...(action.danger ? { tone: "danger" as const } : {}) }; })}
          onAction={id => setStatus(conversationActionResult(row, id))}>
          <Pressable accessibilityRole="link" accessibilityLabel={conversationRowSummary(row)} onPress={() => setStatus(conversationOpened(row))}>
            <ConversationRow title={row.name} preview={row.preview} metadata={row.time} unread={row.unread} avatar={<Avatar name={row.name} size={56} decorative source={{ uri: row.photo }} />} />
          </Pressable>
        </ContextMenu>)}</View>
      </ScreenLayout>
    </View>
  </Stack></View>;
}
