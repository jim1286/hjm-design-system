"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { resolveSearchCommit } from "@hjmds/design-contracts/screen-patterns";
import { validateReplyTarget } from "@hjmds/design-contracts/communication";
import { ChatMessage, MessageComposer } from "./screens.js";
import { SearchScreen } from "./screen-flows.js";
import { IconButton } from "./actions.js";
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
//# sourceMappingURL=communication.js.map