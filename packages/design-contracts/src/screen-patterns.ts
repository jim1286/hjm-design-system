import { layout, spacing } from "./foundations.js";

/** Initial load replaces the body; refresh/save errors belong beside retained content. */
export type ScreenContentState =
  | Readonly<{ kind: "ready" }>
  | Readonly<{ kind: "loading" | "empty" | "error" | "restricted"; title: string; description?: string }>;

export function resolveScreenContentState(state: ScreenContentState = { kind: "ready" }) {
  if (!["ready", "loading", "empty", "error", "restricted"].includes(state.kind)) {
    throw new TypeError("Unknown screen content state");
  }
  if (state.kind !== "ready" && !state.title.trim()) {
    throw new TypeError("Screen state requires a localized title");
  }
  return {
    kind: state.kind,
    replacesContent: state.kind !== "ready",
    busy: state.kind === "loading",
    announcement: state.kind === "error" ? "assertive" : "polite",
  } as const;
}

// Reuse reading-width and spacing tokens; do not derive geometry from a product's device or artwork.
export const screenPatternRecipe = {
  maxWidth: layout.readingMaxWidth,
  padding: spacing.md,
  sectionGap: spacing.xl,
  itemGap: spacing.sm,
  stateGap: spacing.md,
  // Compact screens must keep back/title/save on one row; scale this floor for large text instead of reserving a desktop-width title.
  headerMinWidth: layout.readingMaxWidth / 6,
  // Reserve the opposite edge for authorship and cap the composer so history remains visible.
  messageMaxWidth: "84%",
  // Social thumbnails stay compact; selection order and removal replace a second toolbar.
  attachmentSize: 80,
  attachmentRemoveSize: 24,
  reactionHoldMs: 450,
  reactionMoveTolerance: 10,
  reactionMenuWidth: 320,
  replySwipeDistance: 60,
  composerMinLines: 1,
  composerMaxLines: 5,
} as const;

/** Controlled composer: HJM never clears drafts or interprets a fulfilled callback as server delivery. */
export type MessageComposerDescriptor = Readonly<{
  value: string;
  label: string;
  sendLabel: string;
  /** Short visual copy may differ from the complete accessible input name. */
  placeholder?: string;
  description?: string;
  error?: string;
  invalid?: boolean;
  /** Newline remains the compatible default; desktop chat may explicitly opt into send. */
  submitMode?: "newline" | "send";
  disabled?: boolean;
  pending?: boolean;
  attachmentCount?: number;
}>;
/** Safari may report the final IME Enter as keyCode 229 after isComposing becomes false. */
export function shouldSubmitMessageKey(event: Readonly<{ key: string; shiftKey?: boolean; isComposing?: boolean; keyCode?: number }>, mode: "newline" | "send" = "newline"): boolean {
  return mode === "send" && event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229;
}
export function canSubmitMessage({ value, disabled = false, pending = false, attachmentCount = 0 }: MessageComposerDescriptor): boolean {
  if (!Number.isSafeInteger(attachmentCount) || attachmentCount < 0) throw new RangeError("Attachment count must be a nonnegative integer");
  return !disabled && !pending && (value.trim().length > 0 || attachmentCount > 0);
}

/** Bubble alignment expresses authorship, not delivery; delivery text always comes from the product receipt. */
export type ChatMessageDescriptor = Readonly<{
  direction: "incoming" | "outgoing";
  author: string;
  timestamp: string;
  deliveryLabel?: string;
  /** Inward drag reveals time (incoming right, outgoing left) while delivery state remains visible; default preserves existing captions. */
  timestampPresentation?: "always" | "swipe";
  /** Connected authorship tip; opt-in keeps existing card-like conversations unchanged. */
  bubbleTail?: boolean;
}>;

/** A denied permission goes to settings; rendering never requests OS access automatically. */
export type PermissionScreenStatus = "prompt" | "denied" | "granted" | "unavailable";
export function resolvePermissionAction(status:PermissionScreenStatus) {
  switch(status){case "prompt":return "request";case "denied":return "settings";case "granted":return "continue";case "unavailable":return null;default:throw new TypeError("Unknown permission state");}
}
export function resolveOnboardingStep(total:number,index:number){
 if(!Number.isInteger(total)||total<1||!Number.isInteger(index)||index<0||index>=total)throw new RangeError("Onboarding requires a valid step index");
 return {first:index===0,last:index===total-1};
}

/** Replies are one level deep; reject orphaned/duplicate records instead of silently losing them. */
export function validateCommentThread(items:readonly {id:string;parentId:string|null}[]){
 const roots=new Set(items.filter(item=>item.parentId===null).map(item=>item.id));const ids=new Set<string>();
 for(const item of items){if(!item.id.trim()||ids.has(item.id))throw new TypeError("Comment ids must be unique and nonempty");ids.add(item.id);if(item.parentId!==null&&(!roots.has(item.parentId)||item.parentId===item.id))throw new TypeError("Replies require an existing root comment");}
}

/** Source bytes, permission requests, ordering and upload limits remain product-owned. */
export type MessageAttachmentDescriptor = Readonly<{ id: string; removeLabel: string; /** Local preparation can lock removal without locking text entry. */ disabled?: boolean }>;
export function validateMessageAttachments(attachments: readonly MessageAttachmentDescriptor[]): void {
  const ids = new Set<string>();
  for (const item of attachments) {
    if (!item.id.trim() || ids.has(item.id) || !item.removeLabel.trim()) throw new TypeError("Attachments require unique ids and localized removal labels");
    ids.add(item.id);
  }
}

/** Require horizontal intent so a timeline scroll cannot accidentally start a reply. */
export function isReplySwipe(dx: number, dy: number): boolean {
  return Math.abs(dx) >= screenPatternRecipe.replySwipeDistance && Math.abs(dx) > Math.abs(dy) * 2;
}

/** The UI never infers permission or camera availability; product adapters own both. */
export type PhotoSource = "library" | "camera";
export type PhotoSourceLabels = Readonly<{ title:string; library:string; camera:string; cancel:string }>;

export type SavedItem = Readonly<{ id: string; title: string }>;
export type SavedCollection = Readonly<{ id: string; title: string; itemIds: readonly string[] }>;
export type SavedItemsLabels = Readonly<{ allItems: string; privateNotice: string; back: string; empty: string; createCollection: string }>;

/** Unsave removes an item from every collection view without rewriting product-owned membership. */
export function resolveSavedItems<T extends SavedItem>(items:readonly T[],collections:readonly SavedCollection[],collectionId:string|null|undefined,selectedItemId:string|null|undefined){
  const ids=new Set<string>(),groups=new Set<string>();
  for(const item of items){if(!item.id.trim()||ids.has(item.id)||!item.title.trim())throw new TypeError("Saved items require unique ids and nonempty titles");ids.add(item.id);}
  for(const group of collections){if(!group.id.trim()||groups.has(group.id)||!group.title.trim())throw new TypeError("Saved collections require unique ids and nonempty titles");groups.add(group.id);}
  const collection=collections.find(item=>item.id===collectionId);
  // A deleted collection returns to the overview instead of showing a mislabeled all-posts view.
  const home=collectionId===undefined||(collectionId!==null&&!collection);
  const visible=home||collectionId===null?items:items.filter(item=>collection?.itemIds.includes(item.id));
  return {home,collection,visible,selected:home?undefined:visible.find(item=>item.id===selectedItemId)};
}

/**
 * SearchScreen phases (2026-10-06 search redesign, docs/screen-patterns.md#searchscreen-두-단계-검색).
 * Without a committed query (one-step search, the pre-1.13 behavior) any nonblank query is already
 * `results`. With one, typing a different query is `typing`: suggestions replace the results until the
 * user commits (Enter, a suggestion, a recent or suggested query). Comparing trimmed values keeps a
 * trailing space from flipping committed results back into suggestions.
 */
export type SearchScreenPhase = "idle" | "typing" | "results";
export function resolveSearchScreenPhase(query: string, committedQuery?: string): SearchScreenPhase {
  const typed = query.trim();
  if (!typed) return "idle";
  if (committedQuery === undefined) return "results";
  return typed === committedQuery.trim() ? "results" : "typing";
}

/**
 * The value a commit records, or `null` when there is nothing to commit. Blank commits are dropped
 * so a stray Enter never writes an empty recent search or fetches "everything".
 */
export function resolveSearchCommit(value: string): string | null {
  const next = value.trim();
  return next ? next : null;
}

/**
 * Why a committed search shows nothing. `filters` keeps the filter rail and offers "clear all";
 * `query` hides the rail (no filter can fix it) and offers suggested queries instead. Reference
 * services hide the rail on every zero result, which removes the only way to undo a filter.
 * `null` count means the result is still loading, so no cause is reported yet.
 */
export type SearchEmptyCause = "none" | "filters" | "query";
export function resolveSearchEmptyCause(count: number | null, appliedFilterCount: number): SearchEmptyCause {
  if (count === null || count > 0) return "none";
  if (count < 0 || !Number.isSafeInteger(count) || !Number.isSafeInteger(appliedFilterCount) || appliedFilterCount < 0) {
    throw new RangeError("Search counts must be nonnegative integers");
  }
  return appliedFilterCount > 0 ? "filters" : "query";
}

/**
 * Index to focus after removing item `removedIndex` from a list that now has `remaining` items:
 * the item that slid into its place, else the new last item, else -1 (move to the fallback target).
 * Removing a focused chip or row would otherwise drop focus to <body>.
 */
export function resolveFocusAfterRemoval(removedIndex: number, remaining: number): number {
  if (!Number.isInteger(removedIndex) || removedIndex < 0 || !Number.isInteger(remaining) || remaining < 0) {
    throw new RangeError("Removal indexes must be nonnegative integers");
  }
  return remaining === 0 ? -1 : Math.min(removedIndex, remaining - 1);
}

/** Recipe for the SearchScreen phase sections; geometry stays on shared spacing tokens. */
export const searchScreenRecipe = {
  /** Recent searches shown before the user types; reference services show 5–10 and let the rest scroll away. */
  recentVisible: 5,
  /** Suggestions under the "search for ‘q’" row. */
  suggestionVisible: 6,
  /** Skeleton rows while the first page of results loads. */
  loadingRows: 4,
  /** Between idle sections (recent, suggested). */
  sectionGap: spacing.xl,
  /** Section title to its list, and results header to applied filters. */
  headerGap: spacing.sm,
  /** Between chips in applied filters and suggested queries. */
  chipGap: spacing.xs,
} as const;

/** Horizontal intent preserves vertical scrolling and uses one reveal distance across renderers. */
export function timestampRevealOffset(dx: number, dy: number): number {
  // A 12px dead zone and 2:1 direction bias avoid turning taps/list scrolling into a time gesture.
  return dx > 12 && dx > Math.abs(dy) * 2 ? Math.min(dx, 88) : 0;
}
