"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { filterShareSheetRecipients, resolveShareSheetPickerValue, resolveShareSheetSendOutcome, shareSheetRecipe, validateShareSheet, validateShareSheetRecipients, } from "@hjmds/design-contracts/share-sheet";
import { Button, IconButton } from "./actions.js";
import { EmptyState, Notice } from "./feedback.js";
import { SearchField } from "./forms.js";
import { ImageChoiceGroup } from "./image-choice.js";
import { Spinner } from "./internal/spinner.js";
import { Stack, Text } from "./layout.js";
import { Sheet } from "./overlays.js";
import { Icon } from "./supplemental-display.js";
const subscribeNever = () => () => { };
const browserShareAvailable = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
const serverShareAvailable = () => false;
function isAbort(error) {
    return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}
/**
 * One Sheet for sharing a link (2026-10-26, generalized from BurnTok's share sheets): optional in-app recipients with a
 * batch send, then copy link and the OS share sheet as two round actions in the footer.
 */
export function ShareSheet({ open, onOpenChange, title, labels, link, shareTitle, shareText, copyLink, systemShare, onLinkCopied, onSystemShare, icons, recipients, notice, }) {
    validateShareSheet({ title, link, labels });
    if (recipients)
        validateShareSheetRecipients(recipients.items);
    // navigator.share exists only in some browsers and never on the server; read it after hydration.
    const browserShare = useSyncExternalStore(subscribeNever, browserShareAvailable, serverShareAvailable);
    const copy = copyLink === false ? null : copyLink ?? ((value) => navigator.clipboard.writeText(value));
    const share = systemShare === false ? null : systemShare ?? (browserShare ? (content) => navigator.share(content) : null);
    const [externalAction, setExternalAction] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [selected, setSelected] = useState([]);
    const [sentHere, setSentHere] = useState(() => new Set());
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [localQuery, setLocalQuery] = useState("");
    // Refs close the gap before React re-renders the busy state, so a double tap cannot start a second request.
    const externalInFlight = useRef(false);
    const batchInFlight = useRef(false);
    // Bumped on every close: results of requests started in an earlier visit must not report into the next one.
    const visit = useRef(0);
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; visit.current += 1; };
    }, []);
    useEffect(() => {
        if (open)
            return;
        visit.current += 1;
        setFeedback(null);
        setSelected([]);
        setSentHere(new Set());
        setSendError("");
        setLocalQuery("");
    }, [open]);
    useEffect(() => {
        // A different link makes a "copied" claim about the old one false.
        setFeedback(null);
    }, [link]);
    async function runExternal(action) {
        if (externalInFlight.current)
            return;
        const run = action === "copy" ? copy : share;
        if (!run)
            return;
        externalInFlight.current = true;
        const current = visit.current;
        setExternalAction(action);
        setFeedback(null);
        try {
            if (action === "copy") {
                await copy(link);
                if (current !== visit.current)
                    return;
                setFeedback("copied");
                onLinkCopied?.();
            }
            else {
                await share({ url: link, ...(shareTitle ? { title: shareTitle } : {}), ...(shareText ? { text: shareText } : {}) });
                // Resolving only means the OS sheet closed on a target; never announce delivery.
                if (current === visit.current)
                    onSystemShare?.("completed");
            }
        }
        catch (error) {
            if (current !== visit.current)
                return;
            if (action === "share" && isAbort(error))
                onSystemShare?.("dismissed");
            else
                setFeedback("failed");
        }
        finally {
            externalInFlight.current = false;
            if (mounted.current)
                setExternalAction(null);
        }
    }
    const sent = new Set([...(recipients?.sentIds ?? []), ...sentHere]);
    const pending = selected.filter(id => !sent.has(id));
    async function sendSelected() {
        if (!recipients || batchInFlight.current || pending.length === 0)
            return;
        batchInFlight.current = true;
        const current = visit.current, requested = pending;
        setSending(true);
        setSendError("");
        try {
            const result = await recipients.onSend(requested);
            if (current !== visit.current)
                return;
            const outcome = resolveShareSheetSendOutcome(requested, result);
            const delivered = new Set(outcome.sent);
            setSentHere(previous => new Set([...previous, ...outcome.sent]));
            // Failed recipients stay selected, so the next press retries only them.
            setSelected(previous => previous.filter(id => !delivered.has(id)));
            if (outcome.failed.length)
                setSendError(result.error ?? recipients.labels.sendFailed);
        }
        catch {
            if (current === visit.current)
                setSendError(recipients.labels.sendFailed);
        }
        finally {
            batchInFlight.current = false;
            if (mounted.current)
                setSending(false);
        }
    }
    const remoteSearch = recipients?.search?.onQueryChange !== undefined;
    const query = remoteSearch ? recipients?.search?.query ?? "" : localQuery;
    const visible = recipients ? (remoteSearch ? recipients.items : filterShareSheetRecipients(recipients.items, query)) : [];
    const status = recipients?.status ?? "ready";
    const actionButton = (action, label, icon) => _jsxs(Stack, { align: "center", gap: shareSheetRecipe.actionCaptionGap, children: [_jsx(IconButton, { label: label, tone: shareSheetRecipe.actionButton.tone, size: shareSheetRecipe.actionButton.size, loading: externalAction === action, disabled: externalAction !== null, onClick: () => void runExternal(action), children: icon }), _jsx(Text, { variant: shareSheetRecipe.actionCaptionVariant, "aria-hidden": "true", children: label })] });
    const actions = copy || share ? _jsxs(Stack, { axis: "inline", justify: "center", gap: shareSheetRecipe.actionGap, children: [copy ? actionButton("copy", labels.copyLink, icons?.copyLink ?? _jsx(Icon, { name: "copy" })) : null, share ? actionButton("share", labels.systemShare, icons?.systemShare ?? _jsx(Icon, { name: "share" })) : null] }) : null;
    const footer = pending.length > 0 || actions ? _jsxs(Stack, { gap: shareSheetRecipe.footerGap, layoutStyle: { width: "100%" }, children: [recipients && pending.length > 0 ? _jsx(Button, { fullWidth: true, tone: shareSheetRecipe.sendButton.tone, size: shareSheetRecipe.sendButton.size, loading: sending, onClick: () => void sendSelected(), children: recipients.labels.send(pending.length) }) : null, actions] }) : undefined;
    return _jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: title, closeLabel: labels.close, busy: sending, size: recipients ? shareSheetRecipe.size.recipients : shareSheetRecipe.size.externalOnly, footer: footer, children: _jsxs(Stack, { gap: shareSheetRecipe.bodyGap, children: [notice, sendError ? _jsx(Notice, { tone: "danger", title: sendError }) : null, feedback === "copied" ? _jsx(Notice, { tone: "success", appearance: "status", title: labels.linkCopied }) : null, feedback === "failed" ? _jsx(Notice, { tone: "danger", title: labels.actionFailed }) : null, recipients ? _jsxs(_Fragment, { children: [_jsx(SearchField, { "aria-label": recipients.labels.search, placeholder: recipients.labels.search, clearLabel: recipients.labels.clearSearch, loading: recipients.search?.searching === true, value: query, onValueChange: remoteSearch ? recipients.search.onQueryChange : setLocalQuery }), status === "error" ? _jsx(Notice, { tone: "danger", title: recipients.labels.loadFailed, action: recipients.onRetry ?
                                _jsx(IconButton, { label: recipients.labels.retry, tone: "secondary", size: "small", loading: recipients.retrying === true, onClick: recipients.onRetry, children: _jsx(Icon, { name: "refresh" }) }) : undefined })
                            : status === "loading" ? _jsx(Spinner, { label: recipients.labels.loading })
                                : visible.length === 0 ? _jsx(EmptyState, { density: "compact", title: query.trim() ? recipients.labels.noResults : recipients.labels.empty })
                                    : _jsx(ImageChoiceGroup, { label: recipients.labels.group, selectionMode: "multiple", showItemLabels: shareSheetRecipe.picker.showItemLabels, itemLabelLines: shareSheetRecipe.picker.itemLabelLines, disabled: sending, value: resolveShareSheetPickerValue(selected, sent, visible.map(item => item.id)), onValueChange: next => setSelected(next.filter(id => !sent.has(id))), items: visible.map(item => sent.has(item.id) ? { ...item, description: recipients.labels.sent, disabled: true } : item) })] }) : null] }) });
}
//# sourceMappingURL=share-sheet.js.map