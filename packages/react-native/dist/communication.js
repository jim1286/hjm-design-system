"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { chatRoomRecipe, resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import { canSubmitChatRoom, filterChatRoomMembers, selectedChatRoomMembers } from "@hjmds/design-contracts/communication";
import { validateReplyTarget } from "@hjmds/design-contracts/communication";
import { ChatMessage, MessageComposer, ScreenLayout } from "./screens.js";
import { SearchScreen } from "./screen-flows.js";
import { Button, IconButton } from "./actions.js";
import { glyph, spacing, radius } from "@hjmds/design-contracts/foundations";
import { withAlpha } from "@hjmds/design-contracts/colors";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnClose, DrawnMoreHorizontal, DrawnPencil, DrawnPlus, DrawnSearch } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { Stack, Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { Checkbox, SearchField, TextField } from "./inputs.js";
import { Avatar, ListRow } from "./data-display.js";
import { AlertDialog } from "./overlays.js";
import { Menu } from "./navigation.js";
export function ReplyMessage({ messageId, onReply, replyLabel, replyDisabled = false, swipeAction = "reply", ...message }) {
    if (!messageId.trim())
        throw new TypeError("Reply message requires the actual message ID");
    return _jsx(ChatMessage, { ...message, timestampPresentation: swipeAction === "timestamp" ? "swipe" : "always", replyAction: { label: replyLabel, onPress: () => onReply(messageId), disabled: replyDisabled } });
}
export function ReplyComposer({ replyTarget, onReplyCancel, cancelReplyLabel, errorLabel, onSend, ...composer }) {
    validateReplyTarget(replyTarget);
    const action = useCompositionAction(composer.disabled);
    return _jsxs(Stack, { gap: "sm", children: [_jsx(MessageComposer, { ...composer, pending: action.pending, ...(replyTarget ? { replyTo: { author: replyTarget.author, excerpt: replyTarget.excerpt, cancelLabel: cancelReplyLabel, onCancel: onReplyCancel } } : {}), onSend: value => { const id = replyTarget?.id ?? null; void action.run("send", () => onSend(value, { replyToId: id })); } }), action.failed ? _jsx(Text, { accessibilityRole: "alert", accessibilityLiveRegion: "assertive", tone: "danger", align: "center", children: errorLabel }) : null] });
}
export function ExpandableSearch(props) {
    const [snapshot, setSnapshot] = useState(null), [pending, setPending] = useState(false), [failed, setFailed] = useState(false), [committed, setCommitted] = useState("");
    const latest = useRef(props);
    latest.current = props;
    const input = useRef(null), generation = useRef(0), controller = useRef(null);
    useEffect(() => { if (!props.expanded) {
        controller.current?.abort();
        generation.current++;
        setPending(false);
        setCommitted("");
    } }, [props.expanded]);
    useEffect(() => () => { generation.current++; controller.current?.abort(); }, []);
    useEffect(() => { if (props.expanded)
        input.current?.focus(); }, [props.expanded]);
    const search = (query, { signal }) => {
        controller.current?.abort();
        const token = ++generation.current, request = new AbortController();
        controller.current = request;
        const abort = () => request.abort();
        signal.addEventListener("abort", abort, { once: true });
        if (signal.aborted)
            request.abort();
        // Some adapters ignore abort; generation and current-query checks still prevent stale UI writes.
        const valid = () => !request.signal.aborted && token === generation.current && latest.current.expanded && latest.current.query === query;
        if (!query.trim()) {
            setSnapshot(null);
            setPending(false);
            setFailed(false);
            signal.removeEventListener("abort", abort);
            return;
        }
        setPending(true);
        setFailed(false);
        const execute = latest.current.onSearch;
        void Promise.resolve().then(() => request.signal.aborted ? null : execute(query, { signal: request.signal })).then(response => { if (valid() && response)
            setSnapshot({ query, response }); }, () => { if (valid())
            setFailed(true); }).finally(() => { signal.removeEventListener("abort", abort); if (valid())
            setPending(false); });
    };
    const cancel = () => { controller.current?.abort(); generation.current++; setPending(false); Keyboard.dismiss(); props.onExpandedChange(false); };
    const commit = (query) => { const normalized = resolveSearchCommit(query); if (normalized === null)
        return; setCommitted(normalized); props.onSubmit?.(normalized); };
    const current = snapshot?.query === props.query ? snapshot.response : null;
    const glyphColor = resolveIconButtonPresentation("ghost", useHjmNativeTheme().palette, false).content;
    // Opening and closing are tool actions, as on Web: a search icon at the area's end, and the search screen's own
    // header-leading close exit instead of a full-width primary button and a text close button (2026-10-17 review).
    return _jsx(Stack, { gap: "sm", children: !props.expanded ? _jsx(IconButton, { label: props.labels.open, tone: "ghost", disabled: props.disabled === true, layoutStyle: { alignSelf: "flex-end" }, onPress: () => props.onExpandedChange(true), children: _jsx(DrawnSearch, { size: glyph.sm, color: glyphColor }) }) : _jsxs(_Fragment, { children: [_jsx(SearchScreen, { title: props.labels.title, titleVisibility: "hidden", exit: { kind: "close", label: props.labels.cancel, onPress: cancel }, queryLabel: props.labels.query, queryField: _jsx(SearchField, { ref: input, label: props.labels.query, clearLabel: props.labels.clear, busyLabel: props.labels.searching, value: props.query, onValueChange: props.onQueryChange, busy: pending, onSubmitEditing: () => commit(props.query), returnKeyType: "search" }), query: props.query, onQueryChange: props.onQueryChange, onSearch: search, ...(props.debounceMs === undefined ? {} : { debounceMs: props.debounceMs }), ...(props.recentQueries ? { recentQueries: props.recentQueries } : {}), committedQuery: committed, onSubmit: commit, searching: pending, searchingLabel: props.labels.searching, suggestions: { items: current?.suggestions ?? [], commitLabel: props.labels.commit, countLabel: props.labels.suggestionCount }, children: current ? props.renderResult(current.result) : null }), failed ? _jsx(Text, { accessibilityRole: "alert", accessibilityLiveRegion: "assertive", tone: "danger", align: "center", children: props.labels.error }) : null] }) });
}
const photoOf = (url) => url ? { source: { uri: url } } : {};
function CornerBadge({ size, tone, children }) {
    const { colors } = useHjmNativeTheme();
    const mark = Math.round(size * .6);
    return _jsx(View, { style: { width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: tone === "brand" ? colors.primary : colors.textMuted, borderWidth: 2, borderColor: colors.bg }, children: children(colors.onPrimary, mark) });
}
export function ChatRoomProfile({ value, onValueChange, onSave, onPickPhoto, disabled = false, submitDisabled = false, presentation = "centered", title, back, nameCharacterCount, children, labels }) {
    // Photo upload and save fail for different reasons, so each keeps its own state and message.
    const save = useCompositionAction(disabled), photo = useCompositionAction(disabled);
    const blocked = disabled || save.pending || photo.pending;
    const { colors } = useHjmNativeTheme();
    const latest = useRef({ value, onValueChange });
    latest.current = { value, onValueChange };
    const mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const patch = (change) => onValueChange({ ...value, ...change });
    // A new room has no identity yet; its photo slot is decorative until a name exists.
    const identity = value.name.trim() ? { name: value.name, accessibilityLabel: labels.photo } : { decorative: true, renderFallback: () => _jsx(DrawnPlus, { size: glyph.md, color: colors.textMuted }) };
    const avatar = (accessory) => _jsx(Avatar, { ...photoOf(value.photoUrl), size: chatRoomRecipe.heroAvatar, ...identity, ...(accessory ? { accessory } : {}) });
    const inline = presentation === "inline";
    const remove = onPickPhoto && value.photoUrl ? _jsx(Button, { tone: "ghost", size: "small", disabled: blocked, ...(inline ? { layoutStyle: { alignSelf: "flex-start" } } : {}), onPress: () => patch({ photoUrl: null }), children: labels.removePhoto }) : null;
    return _jsx(ScreenLayout, { title: title, ...(back ? { exit: { kind: "back", label: back.label, onPress: back.onPress } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: blocked || submitDisabled || !canSubmitChatRoom(value), loading: save.pending, onPress: () => void save.run("save", () => onSave(value)), children: labels.save }), children: _jsxs(Stack, { gap: "md", children: [_jsxs(Stack, { axis: inline ? "inline" : "block", align: "center", gap: "md", children: [_jsxs(Stack, { align: "center", gap: "xs", children: [onPickPhoto ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: labels.changePhoto, accessibilityState: { disabled: blocked, busy: photo.pending }, disabled: blocked, onPress: () => void photo.run("photo", async () => { const url = await onPickPhoto(); if (url !== null && mounted.current)
                                        latest.current.onValueChange({ ...latest.current.value, photoUrl: url }); }), children: avatar(_jsx(CornerBadge, { size: chatRoomRecipe.badgeSize, tone: "brand", children: (color, size) => _jsx(DrawnPencil, { size: size, color: color, strokeWidth: 1.5 }) })) }) : avatar(), inline ? null : remove] }), _jsx(Stack, { gap: "xs", layoutStyle: inline ? { flex: 1, minWidth: 0 } : { alignSelf: "stretch" }, children: _jsx(TextField, { label: labels.name, value: value.name, onValueChange: name => patch({ name }), disabled: blocked, ...(nameCharacterCount ? { characterCount: nameCharacterCount } : {}) }) })] }), inline ? remove : null, _jsx(TextField, { label: labels.description, value: value.description, onValueChange: description => patch({ description }), disabled: blocked }), photo.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: labels.photoError }) : null, save.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: labels.error }) : null, typeof children === "function" ? children(blocked) : children] }) });
}
export function ChatRoomMembers({ members, title, emptyLabel, countLabel, onSelectionChange, disabled = false, invite, renderActions, memberActions, memberProfile }) {
    const { colors } = useHjmNativeTheme();
    const leading = (member) => _jsx(Avatar, { size: chatRoomRecipe.memberAvatar, ...photoOf(member.photoUrl), name: member.name, decorative: true });
    const add = chatRoomRecipe.addLeadingSize;
    return _jsxs(Stack, { gap: "xs", children: [_jsxs(Stack, { axis: "inline", align: "end", gap: "xxs", children: [_jsx(Text, { variant: "label", children: title }), countLabel ? _jsx(Text, { variant: "label", tone: "brand", children: countLabel }) : null] }), invite ? _jsx(ListRow, { title: invite.label, tone: "brand", leading: _jsx(View, { style: { width: add, height: add, borderRadius: add / 2, alignItems: "center", justifyContent: "center", backgroundColor: withAlpha(colors.contentBrand, .12) }, children: _jsx(DrawnPlus, { size: glyph.sm, color: colors.contentBrand }) }), disabled: disabled, onPress: invite.onPress }) : null, members.length === 0 ? _jsx(Text, { tone: "muted", children: emptyLabel }) : members.map(member => onSelectionChange ?
                _jsx(Checkbox, { presentation: "plain", label: member.name, ...(member.detail ? { description: member.detail } : {}), renderLeading: () => leading(member), checked: member.selected === true, disabled: disabled || member.disabled === true, onCheckedChange: selected => onSelectionChange(member.id, selected), layoutStyle: { width: "100%" } }, member.id) :
                _jsx(ListRow, { title: member.name, ...(member.detail ? { description: member.detail } : {}), leading: leading(member), ...(memberProfile ? { leadingAction: { label: memberProfile.label(member), onPress: () => memberProfile.onPress(member) }, onPress: () => memberProfile.onPress(member) } : {}), ...(member.role ? { trailing: _jsx(Text, { variant: "caption", tone: "brand", children: member.role }) } : {}), trailingAction: _jsxs(_Fragment, { children: [memberActions ? _jsx(RoomActionList, { actions: memberActions.items(member), disabled: disabled, menu: { label: memberActions.label(member), dismissLabel: memberActions.dismissLabel } }) : null, renderActions?.(member)] }) }, member.id))] });
}
/** People picked so far, kept visible above the list while the search narrows it; tapping one deselects it. */
function SelectedMembers({ members, labels, onRemove, disabled }) {
    if (members.length === 0)
        return null;
    return _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, accessibilityLabel: labels.count(members.length), contentContainerStyle: { gap: chatRoomRecipe.selectedGap, paddingVertical: spacing.xxs }, children: members.map(member => _jsxs(Pressable, { accessibilityRole: "button", accessibilityLabel: labels.remove(member), accessibilityState: { disabled }, disabled: disabled, onPress: () => onRemove(member.id), style: ({ pressed }) => ({ width: chatRoomRecipe.selectedItemWidth, alignItems: "center", gap: spacing.xxs, borderRadius: radius.md, opacity: pressed ? .7 : 1 }), children: [_jsx(Avatar, { size: chatRoomRecipe.selectedAvatar, ...photoOf(member.photoUrl), name: member.name, decorative: true, accessory: _jsx(CornerBadge, { size: chatRoomRecipe.removeBadgeSize, tone: "neutral", children: (color, size) => _jsx(DrawnClose, { size: size, color: color, strokeWidth: 1.5 }) }) }), _jsx(Text, { variant: "caption", numberOfLines: 1, children: member.name })] }, member.id)) });
}
function MemberPicker({ members, title, emptyLabel, search, selection, onSelectionChange, disabled }) {
    const [localQuery, setLocalQuery] = useState("");
    // A product that searches its server owns the query and the result list; otherwise names are filtered here.
    const remote = search.onQueryChange !== undefined, query = remote ? search.query ?? "" : localQuery;
    const selected = selectedChatRoomMembers(members);
    return _jsxs(Stack, { gap: "sm", children: [_jsx(SearchField, { placeholder: search.label, accessibilityLabel: search.label, clearLabel: search.clearLabel, busyLabel: search.busyLabel, busy: search.searching === true, value: query, onValueChange: remote ? search.onQueryChange : setLocalQuery }), _jsx(SelectedMembers, { members: selected, labels: selection, onRemove: id => onSelectionChange(id, false), disabled: disabled }), _jsx(ChatRoomMembers, { members: remote ? members : filterChatRoomMembers(members, query), title: title, ...(selected.length > 0 ? { countLabel: selection.count(selected.length) } : {}), emptyLabel: emptyLabel, onSelectionChange: onSelectionChange, disabled: disabled })] });
}
export function ChatRoomCreate({ members, onSelectionChange, membersLabel, emptyMembersLabel, onCreate, disabled = false, nextLabel, backLabel, title, search, selection, onCancel, ...profile }) {
    const [stage, setStage] = useState("members");
    const selected = selectedChatRoomMembers(members), ids = selected.map(member => member.id);
    if (stage === "members")
        return _jsx(ScreenLayout, { title: title, ...(onCancel ? { exit: { kind: "close", label: backLabel, onPress: onCancel } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: disabled || ids.length === 0, onPress: () => setStage("profile"), children: nextLabel }), children: _jsx(MemberPicker, { members: members, title: membersLabel, emptyLabel: emptyMembersLabel, search: search, selection: selection, onSelectionChange: onSelectionChange, disabled: disabled }) });
    return _jsx(ChatRoomProfile, { ...profile, presentation: "inline", title: title, back: { label: backLabel, onPress: () => setStage("members") }, disabled: disabled, onSave: value => { if (!canSubmitChatRoom(value, ids))
            return; return onCreate(value, ids); }, submitDisabled: !canSubmitChatRoom(profile.value, ids), children: blocked => _jsx(ChatRoomMembers, { members: selected, title: membersLabel, countLabel: selection.count(selected.length), emptyLabel: emptyMembersLabel, disabled: blocked }) });
}
export function ChatRoomActions({ leave, deleteHistory, deleteRoom, disabled = false }) {
    const [active, setActive] = useState(null);
    // Exits are full-width buttons; local history deletion is secondary, leaving or deleting the room is danger.
    const items = [[deleteHistory, "secondary"], [leave, "danger"], [deleteRoom, "danger"]].filter((item) => Boolean(item[0]));
    if (items.length === 0)
        return null;
    return _jsxs(Stack, { gap: "xs", children: [items.map(([item, tone]) => _jsx(Button, { tone: tone, disabled: disabled || active !== null, layoutStyle: { alignSelf: "stretch" }, onPress: () => setActive({ ...item, destructive: true }), children: item.label }, item.label)), active ? _jsx(RoomConfirmDialog, { action: active, onClose: () => setActive(null) }) : null] });
}
function RoomConfirmDialog({ action, onClose }) {
    return _jsx(AlertDialog, { open: true, onOpenChange: open => { if (!open)
            onClose(); }, request: { mode: "confirm", tone: action.destructive ? "danger" : "attention", title: action.title, description: action.description, confirmLabel: action.confirmLabel, cancelLabel: action.cancelLabel, fallbackErrorMessage: action.errorLabel, onConfirm: action.onConfirm } });
}
function RoomActionList({ actions, disabled = false, menu }) {
    const [active, setActive] = useState(null);
    const { colors } = useHjmNativeTheme();
    if (actions.length === 0)
        return null;
    const dialog = active ? _jsx(RoomConfirmDialog, { action: active, onClose: () => setActive(null) }) : null;
    return _jsxs(_Fragment, { children: [_jsx(Menu, { triggerLabel: menu.label, renderTrigger: props => _jsx(IconButton, { label: menu.label, tone: "ghost", onPress: props.onPress, accessibilityState: props.accessibilityState, children: _jsx(DrawnMoreHorizontal, { size: glyph.md, color: colors.textMuted }) }), presentation: "anchored", disabled: disabled || active !== null, dismissLabel: menu.dismissLabel, items: actions.map((action, index) => ({ id: String(index), label: action.label, ...(action.destructive ? { tone: "danger" } : {}) })), onActionAfterDismiss: id => setActive(actions[Number(id)] ?? null) }), dialog] });
}
export function ChatRoomDetails({ profile, back, photoLabel, memberCountLabel, edit, tools = [], members, actions, errorLabel }) {
    const action = useCompositionAction();
    const { colors } = useHjmNativeTheme();
    return _jsx(ScreenLayout, { title: profile.name, titleVisibility: "hidden", ...(back ? { exit: { kind: "back", label: back.label, onPress: back.onPress } } : {}), actions: edit ? _jsx(Button, { tone: "ghost", onPress: edit.onPress, children: edit.label }) : null, children: _jsxs(Stack, { gap: "lg", children: [_jsxs(Stack, { align: "center", gap: "sm", children: [_jsx(Avatar, { ...photoOf(profile.photoUrl), size: chatRoomRecipe.heroAvatar, accessibilityLabel: photoLabel, name: profile.name }), _jsxs(Stack, { align: "center", gap: "xxs", children: [_jsx(Text, { variant: "title", align: "center", children: profile.name }), _jsx(Text, { tone: "muted", align: "center", children: memberCountLabel })] })] }), tools.length > 0 ? _jsx(View, { style: { flexDirection: "row", gap: chatRoomRecipe.toolGap }, children: tools.map(tool => _jsx(Pressable, { accessibilityRole: tool.pressed === undefined ? "button" : "togglebutton", accessibilityLabel: tool.label, accessibilityState: { disabled: action.pending, busy: action.active === tool.id, ...(tool.pressed === undefined ? {} : { checked: tool.pressed }) }, disabled: action.pending, onPress: () => void action.run(tool.id, tool.onPress), style: ({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: chatRoomRecipe.toolMinHeight, justifyContent: "center", backgroundColor: tool.pressed ? colors.surfaceSelected : colors.surface, borderRadius: radius.md, padding: spacing.xs, opacity: pressed ? .7 : 1 }), children: _jsxs(Stack, { align: "center", gap: "xs", children: [tool.icon, _jsx(Text, { variant: "caption", tone: "brand", numberOfLines: 1, children: tool.label })] }) }, tool.id)) }) : null, action.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: errorLabel }) : null, profile.description ? _jsx(Text, { children: profile.description }) : null, _jsx(ChatRoomMembers, { ...members }), actions ? _jsx(ChatRoomActions, { ...actions }) : null] }) });
}
export function ChatRoomInvite({ members, title, membersLabel, emptyLabel, onSelectionChange, onInvite, search, selection, back, confirmLabel, errorLabel, disabled = false }) {
    const action = useCompositionAction(disabled), ids = selectedChatRoomMembers(members).map(member => member.id), blocked = disabled || action.pending;
    return _jsx(ScreenLayout, { title: title, ...(back ? { exit: { kind: "close", label: back.label, onPress: back.onPress } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: blocked || ids.length === 0, loading: action.pending, onPress: () => void action.run("invite", () => onInvite(ids)), children: confirmLabel }), children: _jsxs(Stack, { gap: "md", children: [_jsx(MemberPicker, { members: members, title: membersLabel, emptyLabel: emptyLabel, search: search, selection: selection, onSelectionChange: onSelectionChange, disabled: blocked }), action.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: errorLabel }) : null] }) });
}
//# sourceMappingURL=communication.js.map