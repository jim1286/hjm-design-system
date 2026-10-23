"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { validateReplyTarget } from "@hjmds/design-contracts/communication";
import { ChatMessage, MessageComposer } from "./screens.js";
import { SearchScreen } from "./screen-flows.js";
import { Button, IconButton } from "./actions.js";
import { Icon } from "./supplemental-display.js";
import { Stack, Text } from "./layout.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
import { canSubmitChatRoom, filterChatRoomMembers, selectedChatRoomMembers } from "@hjmds/design-contracts/communication";
import { chatRoomRecipe, resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import { Avatar } from "./advanced-display.js";
import { ListRow } from "./display.js";
import { AlertDialog, Menu } from "./overlays.js";
import { TextField, SearchField } from "./forms.js";
import { TopBar } from "./top-bar.js";
import { Checkbox } from "./selection.js";
export function ReplyMessage({ messageId, onReply, replyLabel, replyDisabled = false, swipeAction = "reply", ...message }) {
    if (!messageId.trim())
        throw new TypeError("Reply message requires the actual message ID");
    return _jsx(ChatMessage, { ...message, timestampPresentation: swipeAction === "timestamp" ? "swipe" : "always", replyAction: { label: replyLabel, onPress: () => onReply(messageId), disabled: replyDisabled } });
}
export function ReplyComposer({ replyTarget, onReplyCancel, cancelReplyLabel, errorLabel, onSend, ...composer }) {
    validateReplyTarget(replyTarget);
    const action = useCompositionAction(composer.disabled);
    return _jsxs(Stack, { gap: "sm", children: [_jsx(MessageComposer, { ...composer, pending: action.pending, ...(replyTarget ? { replyTo: { author: replyTarget.author, excerpt: replyTarget.excerpt, cancelLabel: cancelReplyLabel, onCancel: onReplyCancel } } : {}), onSend: value => { const id = replyTarget?.id ?? null; void action.run("send", () => onSend(value, { replyToId: id })); } }), action.failed ? _jsx(Text, { role: "alert", tone: "danger", style: { textAlign: "center" }, children: errorLabel }) : null] });
}
export function ExpandableSearch(props) {
    const [snapshot, setSnapshot] = useState(null), [pending, setPending] = useState(false), [failed, setFailed] = useState(false), [committed, setCommitted] = useState("");
    const latest = useRef(props);
    latest.current = props;
    const generation = useRef(0), controller = useRef(null);
    const host = useRef(null), opener = useRef(null), restore = useRef(false);
    useEffect(() => { if (!props.expanded) {
        controller.current?.abort();
        generation.current++;
        setPending(false);
        setCommitted("");
    } }, [props.expanded]);
    useEffect(() => () => { generation.current++; controller.current?.abort(); }, []);
    useEffect(() => { if (props.expanded)
        host.current?.querySelector("input")?.focus();
    else if (restore.current) {
        opener.current?.focus();
        restore.current = false;
    } }, [props.expanded]);
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
    const cancel = () => { controller.current?.abort(); generation.current++; setPending(false); restore.current = true; props.onExpandedChange(false); };
    const commit = (query) => { const normalized = resolveSearchCommit(query); if (normalized === null)
        return; setCommitted(normalized); props.onSubmit?.(normalized); };
    const current = snapshot?.query === props.query ? snapshot.response : null;
    // Opening and closing are tool actions: a search icon at the area's end, and the search screen's own header-leading
    // close exit. A full-width primary "Expand" button and a text "Close" button read as product actions (2026-10-17 review).
    return _jsx(Stack, { ref: host, gap: "sm", children: !props.expanded ? _jsx(IconButton, { ref: opener, label: props.labels.open, tone: "ghost", disabled: props.disabled === true, layoutStyle: { alignSelf: "flex-end" }, onClick: () => props.onExpandedChange(true), children: _jsx(Icon, { name: "search" }) }) : _jsxs(_Fragment, { children: [_jsx(SearchScreen, { title: props.labels.title, titleVisibility: "hidden", exit: { kind: "close", label: props.labels.cancel, onClick: cancel }, queryLabel: props.labels.query, queryClearLabel: props.labels.clear, query: props.query, onQueryChange: props.onQueryChange, onSearch: search, ...(props.debounceMs === undefined ? {} : { debounceMs: props.debounceMs }), ...(props.recentQueries ? { recentQueries: props.recentQueries } : {}), committedQuery: committed, onSubmit: commit, searching: pending, searchingLabel: props.labels.searching, suggestions: { items: current?.suggestions ?? [], commitLabel: props.labels.commit, countLabel: props.labels.suggestionCount }, children: current ? props.renderResult(current.result) : null }), failed ? _jsx(Text, { role: "alert", tone: "danger", style: { textAlign: "center" }, children: props.labels.error }) : null] }) });
}
const photoOf = (url) => url ? { src: url } : {};
export function ChatRoomProfile({ value, onValueChange, onSave, onPickPhoto, disabled = false, submitDisabled = false, presentation = "centered", title, back, nameCharacterCount, children, labels }) {
    // Photo upload and save fail for different reasons, so each keeps its own state and message.
    const save = useCompositionAction(disabled), photo = useCompositionAction(disabled);
    const blocked = disabled || save.pending || photo.pending;
    const latest = useRef({ value, onValueChange });
    latest.current = { value, onValueChange };
    const mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const patch = (change) => onValueChange({ ...value, ...change });
    // A new room has no identity yet; its photo slot is decorative until a name exists.
    const identity = value.name.trim() ? { name: value.name, alt: labels.photo } : { decorative: true, renderFallback: () => _jsx(Icon, { name: "users", tone: "secondary" }) };
    const avatar = (accessory) => _jsx(Avatar, { ...photoOf(value.photoUrl), size: chatRoomRecipe.heroAvatar, ...identity, ...(accessory ? { accessory } : {}) });
    const inline = presentation === "inline";
    return _jsxs(Stack, { gap: "md", children: [_jsx(TopBar, { ...(title ? { title } : {}), ...(back ? { exit: { kind: "back", label: back.label, onClick: back.onPress } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: blocked || submitDisabled || !canSubmitChatRoom(value), loading: save.pending, onClick: () => void save.run("save", () => onSave(value)), children: labels.save }) }), _jsxs(Stack, { axis: inline ? "inline" : "block", align: "center", gap: "md", children: [_jsxs(Stack, { align: "center", gap: "xs", children: [onPickPhoto ? _jsx("button", { type: "button", className: "hjm-chat-room__photo", "aria-label": labels.changePhoto, "aria-busy": photo.pending, disabled: blocked, onClick: () => void photo.run("photo", async () => { const url = await onPickPhoto(); if (url !== null && mounted.current)
                                    latest.current.onValueChange({ ...latest.current.value, photoUrl: url }); }), children: avatar(_jsx("span", { className: "hjm-chat-room__badge", children: _jsx(Icon, { name: "edit", size: "xs" }) })) }) : avatar(), onPickPhoto && value.photoUrl && !inline ? _jsx(Button, { tone: "ghost", size: "small", disabled: blocked, onClick: () => patch({ photoUrl: null }), children: labels.removePhoto }) : null] }), _jsx(Stack, { gap: "xs", layoutStyle: inline ? { flex: 1, minWidth: 0 } : { alignSelf: "stretch" }, children: _jsx(TextField, { label: labels.name, value: value.name, onValueChange: name => patch({ name }), disabled: blocked, ...(nameCharacterCount ? { characterCount: nameCharacterCount } : {}) }) })] }), onPickPhoto && value.photoUrl && inline ? _jsx(Button, { tone: "ghost", size: "small", disabled: blocked, layoutStyle: { alignSelf: "flex-start" }, onClick: () => patch({ photoUrl: null }), children: labels.removePhoto }) : null, _jsx(TextField, { label: labels.description, value: value.description, onValueChange: description => patch({ description }), disabled: blocked }), photo.failed ? _jsx(Text, { role: "alert", tone: "danger", children: labels.photoError }) : null, save.failed ? _jsx(Text, { role: "alert", tone: "danger", children: labels.error }) : null, typeof children === "function" ? children(blocked) : children] });
}
export function ChatRoomMembers({ members, title, emptyLabel, countLabel, onSelectionChange, disabled = false, invite, renderActions, memberActions }) {
    const leading = (member) => _jsx(Avatar, { size: chatRoomRecipe.memberAvatar, ...photoOf(member.photoUrl), name: member.name, decorative: true });
    return _jsxs(Stack, { gap: "xs", children: [_jsxs("div", { className: "hjm-chat-room__heading", children: [_jsx(Text, { variant: "label", children: title }), countLabel ? _jsx(Text, { variant: "label", tone: "muted", children: countLabel }) : null] }), invite ? _jsx(ListRow, { title: invite.label, tone: "brand", leading: _jsx("span", { className: "hjm-chat-room__add", children: _jsx(Icon, { name: "add", size: "sm" }) }), disabled: disabled, onClick: invite.onPress }) : null, members.length === 0 ? _jsx(Text, { tone: "muted", children: emptyLabel }) : members.map(member => onSelectionChange ?
                _jsx(Checkbox, { presentation: "plain", label: member.name, ...(member.detail ? { description: member.detail } : {}), renderLeading: () => leading(member), checked: member.selected === true, disabled: disabled || member.disabled === true, onCheckedChange: selected => onSelectionChange(member.id, selected), layoutStyle: { width: "100%" } }, member.id) :
                _jsx(ListRow, { title: member.name, ...(member.detail ? { description: member.detail } : {}), leading: leading(member), ...(member.role ? { trailing: _jsx(Text, { variant: "caption", tone: "brand", children: member.role }) } : {}), trailingAction: _jsxs(_Fragment, { children: [memberActions ? _jsx(RoomActionList, { actions: memberActions.items(member), disabled: disabled, menu: { label: memberActions.label(member), dismissLabel: memberActions.dismissLabel } }) : null, renderActions?.(member)] }) }, member.id))] });
}
/** People picked so far, kept visible above the list while the search narrows it; tapping one deselects it. */
function SelectedMembers({ members, labels, onRemove, disabled }) {
    if (members.length === 0)
        return null;
    return _jsx("ul", { className: "hjm-chat-room__selected", "aria-label": labels.count(members.length), children: members.map(member => _jsx("li", { children: _jsxs("button", { type: "button", className: "hjm-chat-room__selected-item", "aria-label": labels.remove(member), disabled: disabled, onClick: () => onRemove(member.id), children: [_jsx(Avatar, { size: chatRoomRecipe.selectedAvatar, ...photoOf(member.photoUrl), name: member.name, decorative: true, accessory: _jsx("span", { className: "hjm-chat-room__badge", "data-tone": "neutral", children: _jsx(Icon, { name: "close", size: "xs" }) }) }), _jsx(Text, { variant: "caption", className: "hjm-chat-room__selected-name", children: member.name })] }) }, member.id)) });
}
function MemberPicker({ members, title, emptyLabel, search, selection, onSelectionChange, disabled }) {
    const [localQuery, setLocalQuery] = useState("");
    // A product that searches its server owns the query and the result list; otherwise names are filtered here.
    const remote = search.onQueryChange !== undefined, query = remote ? search.query ?? "" : localQuery;
    const selected = selectedChatRoomMembers(members);
    return _jsxs(Stack, { gap: "sm", children: [_jsx(SearchField, { placeholder: search.label, "aria-label": search.label, clearLabel: search.clearLabel, loading: search.searching === true, value: query, onValueChange: remote ? search.onQueryChange : setLocalQuery }), _jsx(SelectedMembers, { members: selected, labels: selection, onRemove: id => onSelectionChange(id, false), disabled: disabled }), _jsx(ChatRoomMembers, { members: remote ? members : filterChatRoomMembers(members, query), title: title, countLabel: selection.count(selected.length), emptyLabel: emptyLabel, onSelectionChange: onSelectionChange, disabled: disabled })] });
}
export function ChatRoomCreate({ members, onSelectionChange, membersLabel, emptyMembersLabel, onCreate, disabled = false, nextLabel, backLabel, title, search, selection, onCancel, ...profile }) {
    const [stage, setStage] = useState("members");
    const selected = selectedChatRoomMembers(members), ids = selected.map(member => member.id);
    if (stage === "members")
        return _jsxs(Stack, { gap: "md", children: [_jsx(TopBar, { title: title, ...(onCancel ? { exit: { kind: "close", label: backLabel, onClick: onCancel } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: disabled || ids.length === 0, onClick: () => setStage("profile"), children: nextLabel }) }), _jsx(MemberPicker, { members: members, title: membersLabel, emptyLabel: emptyMembersLabel, search: search, selection: selection, onSelectionChange: onSelectionChange, disabled: disabled })] });
    return _jsx(ChatRoomProfile, { ...profile, presentation: "inline", title: title, back: { label: backLabel, onPress: () => setStage("members") }, disabled: disabled, onSave: value => { if (!canSubmitChatRoom(value, ids))
            return; return onCreate(value, ids); }, submitDisabled: !canSubmitChatRoom(profile.value, ids), children: blocked => _jsx(ChatRoomMembers, { members: selected, title: membersLabel, countLabel: selection.count(selected.length), emptyLabel: emptyMembersLabel, disabled: blocked }) });
}
export function ChatRoomActions({ leave, deleteHistory, deleteRoom, disabled = false }) {
    return _jsx(RoomActionList, { actions: [deleteHistory, leave, deleteRoom].filter((item) => Boolean(item)).map(item => ({ ...item, destructive: true })), disabled: disabled });
}
function RoomActionList({ actions, disabled = false, menu }) {
    const [active, setActive] = useState(null);
    if (actions.length === 0)
        return null;
    const dialog = active ? _jsx(AlertDialog, { open: true, onOpenChange: open => { if (!open)
            setActive(null); }, request: { mode: "confirm", tone: active.destructive ? "danger" : "attention", title: active.title, description: active.description, confirmLabel: active.confirmLabel, cancelLabel: active.cancelLabel, fallbackErrorMessage: active.errorLabel, onConfirm: active.onConfirm } }) : null;
    if (menu)
        return _jsxs(_Fragment, { children: [_jsx(Menu, { label: menu.label, trigger: _jsx(IconButton, { label: menu.label, tone: "ghost", children: _jsx(Icon, { name: "more" }) }), presentation: "anchored", align: "end", disabled: disabled || active !== null, dismissLabel: menu.dismissLabel, items: actions.map((action, index) => ({ id: String(index), label: action.label, ...(action.destructive ? { tone: "danger" } : {}) })), onActionAfterDismiss: id => setActive(actions[Number(id)] ?? null) }), dialog] });
    return _jsxs(Stack, { gap: "xxs", children: [actions.map((action, index) => _jsx(ListRow, { title: action.label, tone: action.destructive ? "danger" : "default", disabled: disabled || active !== null, onClick: () => setActive(action) }, index)), dialog] });
}
export function ChatRoomDetails({ profile, back, photoLabel, memberCountLabel, edit, tools = [], members, actions, errorLabel }) {
    const action = useCompositionAction();
    return _jsxs("div", { className: "hjm-chat-room", children: [_jsx(TopBar, { surface: "transparent", ...(back ? { exit: { kind: "back", label: back.label, onClick: back.onPress } } : {}), actions: edit ? _jsx(Button, { tone: "ghost", onClick: edit.onPress, children: edit.label }) : null }), _jsxs(Stack, { gap: "lg", children: [_jsxs(Stack, { align: "center", gap: "sm", children: [_jsx(Avatar, { ...photoOf(profile.photoUrl), size: chatRoomRecipe.heroAvatar, alt: photoLabel, name: profile.name }), _jsxs(Stack, { align: "center", gap: "xxs", children: [_jsx(Text, { variant: "title", className: "hjm-chat-room__name", children: profile.name }), _jsx(Text, { tone: "muted", children: memberCountLabel })] })] }), tools.length > 0 ? _jsx("div", { className: "hjm-chat-room__tools", children: tools.map(tool => _jsx("button", { type: "button", className: "hjm-chat-room__tool", disabled: action.pending, "aria-busy": action.active === tool.id, onClick: () => void action.run(tool.id, tool.onPress), children: _jsxs(Stack, { align: "center", gap: "xs", children: [tool.icon, _jsx(Text, { variant: "caption", tone: "brand", children: tool.label })] }) }, tool.id)) }) : null, action.failed ? _jsx(Text, { role: "alert", tone: "danger", children: errorLabel }) : null, profile.description ? _jsx("div", { className: "hjm-chat-room__group", children: _jsx(Text, { children: profile.description }) }) : null, _jsx("div", { className: "hjm-chat-room__group", children: _jsx(ChatRoomMembers, { ...members }) }), actions ? _jsx("div", { className: "hjm-chat-room__group", "data-flush": "true", children: _jsx(ChatRoomActions, { ...actions }) }) : null] })] });
}
export function ChatRoomInvite({ members, title, membersLabel, emptyLabel, onSelectionChange, onInvite, search, selection, back, confirmLabel, errorLabel, disabled = false }) {
    const action = useCompositionAction(disabled), ids = selectedChatRoomMembers(members).map(member => member.id), blocked = disabled || action.pending;
    return _jsxs(Stack, { gap: "md", children: [_jsx(TopBar, { title: title, ...(back ? { exit: { kind: "close", label: back.label, onClick: back.onPress } } : {}), actions: _jsx(Button, { tone: "ghost", disabled: blocked || ids.length === 0, loading: action.pending, onClick: () => void action.run("invite", () => onInvite(ids)), children: confirmLabel }) }), _jsx(MemberPicker, { members: members, title: membersLabel, emptyLabel: emptyLabel, search: search, selection: selection, onSelectionChange: onSelectionChange, disabled: blocked }), action.failed ? _jsx(Text, { role: "alert", tone: "danger", children: errorLabel }) : null] });
}
//# sourceMappingURL=communication.js.map