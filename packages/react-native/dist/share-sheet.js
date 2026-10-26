import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import { glyph } from "@hjmds/design-contracts/foundations";
import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import { filterShareSheetRecipients, resolveShareSheetPickerValue, resolveShareSheetSendOutcome, shareSheetRecipe, validateShareSheet, validateShareSheetRecipients, } from "@hjmds/design-contracts/share-sheet";
import { Button, IconButton } from "./actions.js";
import { EmptyState, Notice } from "./feedback.js";
import { ImageChoiceGroup } from "./image-choice.js";
import { SearchField } from "./inputs.js";
import { DrawnRefresh } from "./internal/drawn-glyphs.js";
import { Spinner } from "./internal/spinner.js";
import { Sheet } from "./overlays.js";
import { Stack, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/**
 * React Native's own share sheet. Android drops `url`, so the link joins the message there; iOS keeps the link as the
 * shared URL (its preview) and the title or text as the message. `dialogTitle` names the Android chooser.
 */
async function shareWithReactNative(content, dialogTitle) {
    const message = content.text ?? content.title;
    const result = Platform.OS === "ios"
        ? await Share.share({ url: content.url, ...(message ? { message } : {}), ...(content.title ? { title: content.title } : {}) }, { subject: content.title ?? dialogTitle })
        : await Share.share({ message: [message, content.url].filter(Boolean).join("\n"), ...(content.title ? { title: content.title } : {}) }, { dialogTitle });
    return result.action === Share.dismissedAction ? "dismissed" : "completed";
}
/**
 * One Sheet for sharing a link (2026-10-26, generalized from BurnTok's share sheets): optional in-app recipients with a
 * batch send, then copy link and the OS share sheet as two round actions in the footer.
 */
export function ShareSheet({ open, onOpenChange, title, labels, link, shareTitle, shareText, copyLink, systemShare, onLinkCopied, onSystemShare, icons, recipients, notice, }) {
    validateShareSheet({ title, link, labels });
    if (recipients)
        validateShareSheetRecipients(recipients.items);
    const { colors } = useHjmNativeTheme();
    const share = systemShare === false ? null : systemShare ?? ((content) => shareWithReactNative(content, title));
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
        if (action === "copy" ? !copyLink : !share)
            return;
        externalInFlight.current = true;
        const current = visit.current;
        setExternalAction(action);
        setFeedback(null);
        try {
            if (action === "copy") {
                await copyLink(link);
                if (current !== visit.current)
                    return;
                setFeedback("copied");
                onLinkCopied?.();
            }
            else {
                const outcome = await share({ url: link, ...(shareTitle ? { title: shareTitle } : {}), ...(shareText ? { text: shareText } : {}) });
                // The OS sheet only reports that it closed; never announce delivery.
                if (current === visit.current)
                    onSystemShare?.(outcome);
            }
        }
        catch {
            if (current === visit.current)
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
    const actionButton = (action, label, icon) => _jsxs(Stack, { align: "center", gap: shareSheetRecipe.actionCaptionGap, children: [_jsx(IconButton, { label: label, tone: shareSheetRecipe.actionButton.tone, size: shareSheetRecipe.actionButton.size, loading: externalAction === action, disabled: externalAction !== null, onPress: () => void runExternal(action), children: icon }), _jsx(Text, { variant: shareSheetRecipe.actionCaptionVariant, accessible: false, importantForAccessibility: "no", children: label })] });
    const actions = copyLink || share ? _jsxs(Stack, { axis: "inline", justify: "center", gap: shareSheetRecipe.actionGap, children: [copyLink ? actionButton("copy", labels.copyLink, icons.copyLink) : null, share ? actionButton("share", labels.systemShare, icons.systemShare) : null] }) : null;
    const footer = pending.length > 0 || actions ? _jsxs(Stack, { gap: shareSheetRecipe.footerGap, children: [recipients && pending.length > 0 ? _jsx(Button, { tone: shareSheetRecipe.sendButton.tone, size: shareSheetRecipe.sendButton.size, loading: sending, onPress: () => void sendSelected(), children: recipients.labels.send(pending.length) }) : null, actions] }) : undefined;
    return _jsx(Sheet, { open: open, onOpenChange: onOpenChange, title: title, closeLabel: labels.close, busy: sending, size: recipients ? shareSheetRecipe.size.recipients : shareSheetRecipe.size.externalOnly, scrollable: recipients !== undefined, footer: footer, children: _jsxs(Stack, { gap: shareSheetRecipe.bodyGap, children: [notice, sendError ? _jsx(Notice, { tone: "danger", announcement: "assertive", title: sendError }) : null, feedback === "copied" ? _jsx(Notice, { tone: "success", appearance: "status", announcement: "polite", title: labels.linkCopied }) : null, feedback === "failed" ? _jsx(Notice, { tone: "danger", announcement: "assertive", title: labels.actionFailed }) : null, recipients ? _jsxs(_Fragment, { children: [_jsx(SearchField, { accessibilityLabel: recipients.labels.search, placeholder: recipients.labels.search, clearLabel: recipients.labels.clearSearch, busyLabel: recipients.labels.loading, busy: recipients.search?.searching === true, value: query, onValueChange: remoteSearch ? recipients.search.onQueryChange : setLocalQuery }), status === "error" ? _jsx(Notice, { tone: "danger", announcement: "polite", title: recipients.labels.loadFailed, ...(recipients.onRetry ? { action: _jsx(IconButton, { label: recipients.labels.retry, tone: "secondary", size: "small", loading: recipients.retrying === true, onPress: recipients.onRetry, children: _jsx(DrawnRefresh, { size: glyph[iconButtonRecipe.sizes.small.glyph], color: colors.text }) }) } : {}) })
                            : status === "loading" ? _jsx(Spinner, { label: recipients.labels.loading })
                                : visible.length === 0 ? _jsx(EmptyState, { density: "compact", title: query.trim() ? recipients.labels.noResults : recipients.labels.empty })
                                    : _jsx(ImageChoiceGroup, { label: recipients.labels.group, selectionMode: "multiple", showItemLabels: shareSheetRecipe.picker.showItemLabels, itemLabelLines: shareSheetRecipe.picker.itemLabelLines, disabled: sending, value: resolveShareSheetPickerValue(selected, sent, visible.map(item => item.id)), onValueChange: next => setSelected(next.filter(id => !sent.has(id))), items: visible.map(item => sent.has(item.id) ? { ...item, description: recipients.labels.sent, disabled: true } : item) })] }) : null] }) });
}
//# sourceMappingURL=share-sheet.js.map