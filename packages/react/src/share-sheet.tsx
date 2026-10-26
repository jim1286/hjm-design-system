"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { SheetOpenChangeDetails } from "@hjmds/design-contracts/components/sheet";
import {
  filterShareSheetRecipients, resolveShareSheetPickerValue, resolveShareSheetSendOutcome, shareSheetRecipe, validateShareSheet, validateShareSheetRecipients,
  type ShareSheetLabels, type ShareSheetRecipientDescriptor, type ShareSheetRecipientLabels, type ShareSheetRecipientStatus, type ShareSheetSendResult,
  type ShareSheetShareContent, type ShareSheetSystemShareOutcome,
} from "@hjmds/design-contracts/share-sheet";
import { Button, IconButton } from "./actions.js";
import { EmptyState, Notice } from "./feedback.js";
import { SearchField } from "./forms.js";
import { ImageChoiceGroup } from "./image-choice.js";
import { Spinner } from "./internal/spinner.js";
import { Stack, Text } from "./layout.js";
import { Sheet } from "./overlays.js";
import { Icon } from "./supplemental-display.js";

export type {
  ShareSheetLabels, ShareSheetRecipientLabels, ShareSheetRecipientStatus, ShareSheetSendResult, ShareSheetShareContent, ShareSheetSystemShareOutcome,
} from "@hjmds/design-contracts/share-sheet";

export type ShareSheetRecipient = ShareSheetRecipientDescriptor & Readonly<{ image: ReactNode }>;

export type ShareSheetRecipientSearch = Readonly<{
  /** Controlled query. With `onQueryChange` the product owns the query and `items` is already its result. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** A server search is running. */
  searching?: boolean;
}>;

export type ShareSheetRecipients = Readonly<{
  items: readonly ShareSheetRecipient[];
  labels: ShareSheetRecipientLabels;
  /** Default `ready`. */
  status?: ShareSheetRecipientStatus;
  /** Shown with the `error` state. */
  onRetry?: () => void;
  retrying?: boolean;
  /** Omit to filter `items` by label here; pass `onQueryChange` to search on the server. */
  search?: ShareSheetRecipientSearch;
  /** Recipients that already received this link (before the sheet opened). They stay checked and locked. */
  sentIds?: readonly string[];
  /** Sends the link to the selected ids. Delivered ids lock as sent; the rest stay selected for a retry. */
  onSend: (ids: readonly string[]) => Promise<ShareSheetSendResult>;
}>;

export type ShareSheetProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean, detail: SheetOpenChangeDetails) => void;
  title: string;
  labels: ShareSheetLabels;
  /** The URL that is copied and shared. */
  link: string;
  /** Title and text handed to the OS share sheet with the link. */
  shareTitle?: string;
  shareText?: string;
  /** Writes the link to the clipboard. Default `navigator.clipboard.writeText`; `false` hides the action. */
  copyLink?: ((link: string) => Promise<void>) | false;
  /**
   * Opens the OS share sheet. Default `navigator.share` (the action is hidden where the browser has none); `false`
   * hides the action. Reject with an `AbortError` when the user backs out.
   */
  systemShare?: ((content: ShareSheetShareContent) => Promise<void>) | false;
  onLinkCopied?: () => void;
  /** The OS share sheet closed. `completed` is not a delivery receipt. */
  onSystemShare?: (outcome: ShareSheetSystemShareOutcome) => void;
  /** Product artwork for the two actions. Defaults to the HJM `copy` and `share` icons. */
  icons?: Readonly<{ copyLink?: ReactNode; systemShare?: ReactNode }>;
  /** In-app recipients (group chats, followers). Omit for external sharing only. */
  recipients?: ShareSheetRecipients;
  /** Product feedback above the body, such as a reward earned by sending. */
  notice?: ReactNode;
}>;

type ExternalAction = "copy" | "share";
type ExternalFeedback = "copied" | "failed";

const subscribeNever = () => () => {};
const browserShareAvailable = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
const serverShareAvailable = () => false;

function isAbort(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && (error as { name: unknown }).name === "AbortError";
}

/**
 * One Sheet for sharing a link (2026-10-26, generalized from BurnTok's share sheets): optional in-app recipients with a
 * batch send, then copy link and the OS share sheet as two round actions in the footer.
 */
export function ShareSheet({
  open, onOpenChange, title, labels, link, shareTitle, shareText, copyLink, systemShare, onLinkCopied, onSystemShare, icons, recipients, notice,
}: ShareSheetProps) {
  validateShareSheet({ title, link, labels });
  if (recipients) validateShareSheetRecipients(recipients.items);
  // navigator.share exists only in some browsers and never on the server; read it after hydration.
  const browserShare = useSyncExternalStore(subscribeNever, browserShareAvailable, serverShareAvailable);
  const copy = copyLink === false ? null : copyLink ?? ((value: string) => navigator.clipboard.writeText(value));
  const share = systemShare === false ? null : systemShare ?? (browserShare ? (content: ShareSheetShareContent) => navigator.share(content) : null);

  const [externalAction, setExternalAction] = useState<ExternalAction | null>(null);
  const [feedback, setFeedback] = useState<ExternalFeedback | null>(null);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [sentHere, setSentHere] = useState<ReadonlySet<string>>(() => new Set());
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
    if (open) return;
    visit.current += 1;
    setFeedback(null); setSelected([]); setSentHere(new Set()); setSendError(""); setLocalQuery("");
  }, [open]);
  useEffect(() => {
    // A different link makes a "copied" claim about the old one false.
    setFeedback(null);
  }, [link]);

  async function runExternal(action: ExternalAction) {
    if (externalInFlight.current) return;
    const run = action === "copy" ? copy : share;
    if (!run) return;
    externalInFlight.current = true;
    const current = visit.current;
    setExternalAction(action);
    setFeedback(null);
    try {
      if (action === "copy") {
        await copy!(link);
        if (current !== visit.current) return;
        setFeedback("copied");
        onLinkCopied?.();
      } else {
        await share!({ url: link, ...(shareTitle ? { title: shareTitle } : {}), ...(shareText ? { text: shareText } : {}) });
        // Resolving only means the OS sheet closed on a target; never announce delivery.
        if (current === visit.current) onSystemShare?.("completed");
      }
    } catch (error) {
      if (current !== visit.current) return;
      if (action === "share" && isAbort(error)) onSystemShare?.("dismissed");
      else setFeedback("failed");
    } finally {
      externalInFlight.current = false;
      if (mounted.current) setExternalAction(null);
    }
  }

  const sent = new Set([...(recipients?.sentIds ?? []), ...sentHere]);
  const pending = selected.filter(id => !sent.has(id));

  async function sendSelected() {
    if (!recipients || batchInFlight.current || pending.length === 0) return;
    batchInFlight.current = true;
    const current = visit.current, requested = pending;
    setSending(true);
    setSendError("");
    try {
      const result = await recipients.onSend(requested);
      if (current !== visit.current) return;
      const outcome = resolveShareSheetSendOutcome(requested, result);
      const delivered = new Set(outcome.sent);
      setSentHere(previous => new Set([...previous, ...outcome.sent]));
      // Failed recipients stay selected, so the next press retries only them.
      setSelected(previous => previous.filter(id => !delivered.has(id)));
      if (outcome.failed.length) setSendError(result.error ?? recipients.labels.sendFailed);
    } catch {
      if (current === visit.current) setSendError(recipients.labels.sendFailed);
    } finally {
      batchInFlight.current = false;
      if (mounted.current) setSending(false);
    }
  }

  const remoteSearch = recipients?.search?.onQueryChange !== undefined;
  const query = remoteSearch ? recipients?.search?.query ?? "" : localQuery;
  const visible = recipients ? (remoteSearch ? recipients.items : filterShareSheetRecipients(recipients.items, query)) : [];
  const status = recipients?.status ?? "ready";

  const actionButton = (action: ExternalAction, label: string, icon: ReactNode) =>
    <Stack align="center" gap={shareSheetRecipe.actionCaptionGap}>
      <IconButton label={label} tone={shareSheetRecipe.actionButton.tone} size={shareSheetRecipe.actionButton.size}
        loading={externalAction === action} disabled={externalAction !== null} onClick={() => void runExternal(action)}>{icon}</IconButton>
      {/* The button already carries the name; the caption is the visible copy of it. */}
      <Text variant={shareSheetRecipe.actionCaptionVariant} aria-hidden="true">{label}</Text>
    </Stack>;
  const actions = copy || share ? <Stack axis="inline" justify="center" gap={shareSheetRecipe.actionGap}>
    {copy ? actionButton("copy", labels.copyLink, icons?.copyLink ?? <Icon name="copy" />) : null}
    {share ? actionButton("share", labels.systemShare, icons?.systemShare ?? <Icon name="share" />) : null}
  </Stack> : null;
  const footer = pending.length > 0 || actions ? <Stack gap={shareSheetRecipe.footerGap} layoutStyle={{ width: "100%" }}>
    {recipients && pending.length > 0 ? <Button fullWidth tone={shareSheetRecipe.sendButton.tone} size={shareSheetRecipe.sendButton.size} loading={sending}
      onClick={() => void sendSelected()}>{recipients.labels.send(pending.length)}</Button> : null}
    {actions}
  </Stack> : undefined;

  return <Sheet open={open} onOpenChange={onOpenChange} title={title} closeLabel={labels.close} busy={sending}
    size={recipients ? shareSheetRecipe.size.recipients : shareSheetRecipe.size.externalOnly} footer={footer}>
    <Stack gap={shareSheetRecipe.bodyGap}>
      {notice}
      {sendError ? <Notice tone="danger" title={sendError} /> : null}
      {feedback === "copied" ? <Notice tone="success" appearance="status" title={labels.linkCopied} /> : null}
      {feedback === "failed" ? <Notice tone="danger" title={labels.actionFailed} /> : null}
      {recipients ? <>
        <SearchField aria-label={recipients.labels.search} placeholder={recipients.labels.search} clearLabel={recipients.labels.clearSearch}
          loading={recipients.search?.searching === true} value={query} onValueChange={remoteSearch ? recipients.search!.onQueryChange! : setLocalQuery} />
        {status === "error" ? <Notice tone="danger" title={recipients.labels.loadFailed} action={recipients.onRetry ?
          <IconButton label={recipients.labels.retry} tone="secondary" size="small" loading={recipients.retrying === true} onClick={recipients.onRetry}><Icon name="refresh" /></IconButton> : undefined} />
          : status === "loading" ? <Spinner label={recipients.labels.loading} />
          : visible.length === 0 ? <EmptyState density="compact" title={query.trim() ? recipients.labels.noResults : recipients.labels.empty} />
          : <ImageChoiceGroup label={recipients.labels.group} selectionMode="multiple" showItemLabels={shareSheetRecipe.picker.showItemLabels}
            itemLabelLines={shareSheetRecipe.picker.itemLabelLines} disabled={sending}
            value={resolveShareSheetPickerValue(selected, sent, visible.map(item => item.id))}
            onValueChange={next => setSelected(next.filter(id => !sent.has(id)))}
            items={visible.map(item => sent.has(item.id) ? { ...item, description: recipients.labels.sent, disabled: true } : item)} />}
      </> : null}
    </Stack>
  </Sheet>;
}
