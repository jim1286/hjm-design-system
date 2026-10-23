"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import { validateReplyTarget } from "@hjmds/design-contracts/communication";
import { ChatMessage, MessageComposer } from "./screens.js";
import { SearchScreen } from "./screen-flows.js";
import { Button, IconButton } from "./actions.js";
import { glyph } from "@hjmds/design-contracts/foundations";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnSearch } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { Stack, Text } from "./primitives.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { Keyboard } from "react-native";
import { SearchField } from "./inputs.js";
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
import { canSubmitChatRoom } from "@hjmds/design-contracts/communication";
import { Avatar, ListRow } from "./data-display.js";
import { AlertDialog } from "./overlays.js";
import { Menu, TopBar } from "./navigation.js";
import { View, Pressable } from "react-native";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { TextField, Checkbox } from "./inputs.js";
export function ChatRoomProfile({ value, onValueChange, onSave, onPickPhoto, disabled = false, submitDisabled = false, presentation = "centered", title, back, children, labels }) {
    const action = useCompositionAction(disabled);
    const blocked = disabled || action.pending;
    const latest = useRef({ value, onValueChange });
    latest.current = { value, onValueChange };
    const mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const patch = (change) => onValueChange({ ...value, ...change });
    // A new room has no identity yet; its photo slot is decorative until a name exists.
    return _jsxs(Stack, { gap: "md", children: [_jsx(TopBar, { ...(title ? { title } : {}), ...(back ? { exit: { kind: "back", label: back.label, onPress: back.onPress } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: blocked || submitDisabled || !canSubmitChatRoom(value), loading: action.active === "save", onPress: () => void action.run("save", () => onSave(value)), children: labels.save }) }), _jsxs(Stack, { axis: presentation === "inline" ? "inline" : "block", align: presentation === "inline" ? "center" : "stretch", gap: "md", children: [_jsxs(Stack, { align: "center", gap: "xs", children: [onPickPhoto ? _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: labels.changePhoto, disabled: blocked, onPress: () => void action.run("photo", async () => { const url = await onPickPhoto(); if (url !== null && mounted.current)
                                    latest.current.onValueChange({ ...latest.current.value, photoUrl: url }); }), children: _jsx(Avatar, { ...(value.photoUrl ? { source: { uri: value.photoUrl } } : {}), size: "xlarge", ...(value.name.trim() ? { name: value.name, accessibilityLabel: labels.photo } : { decorative: true, renderFallback: () => _jsx(Text, { children: "\uFF0B" }) }) }) }) : _jsx(Avatar, { ...(value.photoUrl ? { source: { uri: value.photoUrl } } : {}), size: "xlarge", ...(value.name.trim() ? { name: value.name, accessibilityLabel: labels.photo } : { decorative: true, renderFallback: () => _jsx(Text, { children: "\uFF0B" }) }) }), onPickPhoto && value.photoUrl ? _jsx(Button, { tone: "ghost", size: "small", disabled: blocked, onPress: () => patch({ photoUrl: null }), children: labels.removePhoto }) : null] }), _jsx(Stack, { gap: "xs", layoutStyle: { flex: 1 }, children: _jsx(TextField, { label: labels.name, value: value.name, onValueChange: name => patch({ name }), disabled: blocked }) })] }), _jsx(TextField, { label: labels.description, value: value.description, onValueChange: description => patch({ description }), disabled: blocked }), typeof children === "function" ? children(blocked) : children, action.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: labels.error }) : null] });
}
export function ChatRoomMembers({ members, title, emptyLabel, onSelectionChange, disabled = false, renderActions, actions }) {
    return _jsxs(Stack, { gap: "sm", children: [_jsx(Text, { variant: "label", children: title }), members.length === 0 ? _jsx(Text, { tone: "muted", children: emptyLabel }) : members.map(member => onSelectionChange ?
                _jsx(Checkbox, { presentation: "plain", label: member.name, ...(member.detail ? { description: member.detail } : {}), renderLeading: () => _jsx(Avatar, { size: "medium", ...(member.photoUrl ? { source: { uri: member.photoUrl } } : {}), name: member.name, decorative: true }), checked: member.selected === true, disabled: disabled || member.disabled === true, onCheckedChange: selected => onSelectionChange(member.id, selected), layoutStyle: { width: "100%" } }, member.id) :
                _jsx(ListRow, { title: member.name, ...(member.detail ? { description: member.detail } : {}), leading: _jsx(Avatar, { size: "medium", ...(member.photoUrl ? { source: { uri: member.photoUrl } } : {}), name: member.name, decorative: true }), trailingAction: _jsxs(_Fragment, { children: [actions ? _jsx(RoomActionList, { actions: actions(member), disabled: disabled, menuLabel: member.name }) : null, renderActions?.(member)] }) }, member.id))] });
}
export function ChatRoomCreate({ members, onSelectionChange, membersLabel, emptyMembersLabel, onCreate, disabled = false, nextLabel, backLabel, title, searchLabel, clearSearchLabel, searchBusyLabel, onCancel, ...profile }) {
    const [stage, setStage] = useState("members"), [query, setQuery] = useState("");
    const ids = members.filter(member => member.selected && !member.disabled).map(member => member.id);
    if (stage === "members")
        return _jsxs(Stack, { gap: "md", children: [_jsx(TopBar, { title: title, ...(onCancel ? { exit: { kind: "close", label: backLabel, onPress: onCancel } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: disabled || ids.length === 0, onPress: () => setStage("profile"), children: nextLabel }) }), _jsx(SearchField, { busyLabel: searchBusyLabel, accessibilityLabel: searchLabel, clearLabel: clearSearchLabel, value: query, onValueChange: setQuery }), _jsx(ChatRoomMembers, { members: members.filter(member => member.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), title: membersLabel, emptyLabel: emptyMembersLabel, onSelectionChange: onSelectionChange, disabled: disabled })] });
    return _jsx(ChatRoomProfile, { ...profile, presentation: "inline", title: title, back: { label: backLabel, onPress: () => setStage("members") }, disabled: disabled, onSave: value => { if (!canSubmitChatRoom(value, ids))
            return; return onCreate(value, ids); }, submitDisabled: !canSubmitChatRoom(profile.value, ids), children: blocked => _jsx(ChatRoomMembers, { members: members.filter(member => ids.includes(member.id)), title: membersLabel, emptyLabel: emptyMembersLabel, disabled: blocked }) });
}
export function ChatRoomActions({ leave, deleteHistory, deleteRoom, disabled = false }) {
    return _jsx(RoomActionList, { actions: [leave, deleteHistory, deleteRoom].filter((item) => Boolean(item)).map(item => ({ ...item, destructive: true })), disabled: disabled });
}
function RoomActionList({ actions, disabled = false, menuLabel }) {
    const [active, setActive] = useState(null);
    return _jsxs(Stack, { gap: "sm", children: [menuLabel && actions.length > 0 ? _jsx(Menu, { triggerLabel: menuLabel, renderTrigger: props => _jsx(IconButton, { label: menuLabel, tone: "ghost", onPress: props.onPress, accessibilityState: props.accessibilityState, children: _jsx(Text, { children: "\u2022\u2022\u2022" }) }), presentation: "anchored", disabled: disabled || active !== null, dismissLabel: actions[0].cancelLabel, items: actions.map((action, index) => ({ id: String(index), label: action.label, ...(action.destructive ? { tone: "danger" } : {}) })), onActionAfterDismiss: id => setActive(actions[Number(id)] ?? null) }) : actions.map((action, index) => action ? _jsx(ListRow, { title: action.label, tone: action.destructive ? "danger" : "default", disabled: disabled || active !== null, onPress: () => setActive(action) }, index) : null), active ? _jsx(AlertDialog, { open: true, onOpenChange: open => { if (!open)
                    setActive(null); }, request: { mode: "confirm", tone: active.destructive ? "danger" : "attention", title: active.title, description: active.description, confirmLabel: active.confirmLabel, cancelLabel: active.cancelLabel, fallbackErrorMessage: active.errorLabel, onConfirm: active.onConfirm } }) : null] });
}
export function ChatRoomDetails({ profile, back, photoLabel, memberCountLabel, edit, tools = [], members, actions, errorLabel }) {
    const action = useCompositionAction();
    const { colors } = useHjmNativeTheme();
    return _jsxs(View, { style: { backgroundColor: colors.bg, padding: spacing.md }, children: [_jsx(TopBar, { surface: "transparent", ...(back ? { exit: { kind: "back", label: back.label, onPress: back.onPress } } : {}), actions: edit ? _jsx(Button, { tone: "ghost", onPress: edit.onPress, children: edit.label }) : null }), _jsxs(Stack, { gap: "lg", children: [_jsxs(Stack, { align: "center", gap: "xs", children: [_jsx(Avatar, { ...(profile.photoUrl ? { source: { uri: profile.photoUrl } } : {}), size: "xlarge", accessibilityLabel: photoLabel, name: profile.name }), _jsx(Text, { variant: "title", children: profile.name }), _jsx(Text, { tone: "muted", children: memberCountLabel })] }), _jsx(View, { style: { flexDirection: "row", gap: spacing.xs }, children: tools.map(tool => _jsx(Pressable, { accessibilityRole: "button", accessibilityLabel: tool.label, accessibilityState: { disabled: action.pending, busy: action.active === tool.id }, disabled: action.pending, onPress: () => void action.run(tool.id, tool.onPress), style: ({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 64, justifyContent: "center", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xs, opacity: pressed ? .7 : 1 }), children: _jsxs(Stack, { align: "center", gap: "xs", children: [tool.icon, _jsx(Text, { variant: "caption", tone: "brand", children: tool.label })] }) }, tool.id)) }), profile.description ? _jsx(View, { style: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg }, children: _jsx(Text, { children: profile.description }) }) : null, action.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: errorLabel }) : null, _jsx(View, { style: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg }, children: _jsx(ChatRoomMembers, { ...members }) }), actions ? _jsx(View, { style: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg }, children: _jsx(ChatRoomActions, { ...actions }) }) : null] })] });
}
export function ChatRoomInvite({ onInvite, confirmLabel, errorLabel, disabled = false, ...members }) {
    const action = useCompositionAction(disabled), ids = members.members.filter(member => member.selected && !member.disabled).map(member => member.id);
    return _jsxs(Stack, { gap: "md", children: [_jsx(ChatRoomMembers, { ...members, disabled: disabled || action.pending }), action.failed ? _jsx(Text, { accessibilityRole: "alert", tone: "danger", children: errorLabel }) : null, _jsx(Button, { disabled: disabled || action.pending || ids.length === 0, loading: action.pending, onPress: () => void action.run("invite", () => onInvite(ids)), children: confirmLabel })] });
}
//# sourceMappingURL=communication.js.map