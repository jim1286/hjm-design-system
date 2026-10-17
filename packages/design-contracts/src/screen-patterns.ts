import { glyph, layout, radius, spacing } from "./foundations.js";
import { avatarRecipe } from "./component-recipes.js";
import type { MenuItemDescriptor } from "./behaviors.js";

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

/**
 * Native header band heights. Titled centered headers match the iOS navigation bar (44 control + 4 + 4);
 * icon-only centered headers are compact (2026-10-14 야잘알 tab spacing, 2026-10-17 "상단 여백 줄여").
 * Body top padding shrinks only under a compact header without a notice.
 */
export const screenHeaderRecipe = {
  minHeight: 52,
  paddingVertical: spacing.xxs,
  compactMinHeight: 48,
  compactPaddingVertical: 2,
  compactBodyTop: spacing.xxs,
  /**
   * Heading levels for the route title, shared by Web and Native (2026-10-17 comparison: Native drew the
   * title as regular-weight Text — 20 start / 18 centered — while Web used bold Heading levels).
   */
  titleLevel: "level3",
  centeredTitleLevel: "level5",
} as const;

/**
 * Leaving a screen (back, close, "설정 나가기") is an icon-only button fixed at the header's leading edge
 * (2026-10-17 user rule: exits had drifted into body text buttons with mixed glyphs). The label is read
 * by assistive tech only. `back` mirrors in RTL; `close` is for modal-style routes.
 */
export type ScreenExitKind = "back" | "close";
export const screenExitRecipe = {
  /** Chevron arm length and stroke; close cross arm length. Drawn, not font glyphs, so every platform matches. */
  chevronSize: 10,
  closeSize: 14,
  stroke: 2,
} as const;
export function validateScreenExit(exit: Readonly<{ kind: string; label: string }>, hasLeading: boolean) {
  if (exit.kind !== "back" && exit.kind !== "close") throw new TypeError("Screen exit kind must be back or close");
  if (!exit.label.trim()) throw new TypeError("Screen exit needs a localized accessible label");
  if (hasLeading) throw new TypeError("Screen exit owns the leading slot; do not also pass leading");
}

/**
 * Who owns the screen gutters. `default`: the shared shell pads header, notice, body and footer. `none`: the host
 * route already insets everything (≈45 product call sites rely on this meaning, so it cannot change).
 * `body-edge`: header, notice and footer keep the shell padding; only the body's inline padding is 0 so full-width
 * list rows (ConversationRow, ListRow-based items) supply their own inset — review S5#9 measured DM avatars ~32pt
 * from the edge because body padding and row padding stacked (2026-10-17 user decision).
 */
export type ScreenContentInset = "default" | "none" | "body-edge";
export const screenContentInsets = ["default", "none", "body-edge"] as const satisfies readonly ScreenContentInset[];

/**
 * 화면 진입 시 첫 입력 포커스(2026-10-18 사용자 요청: "input이 있는 화면에 진입하면 포커스되도록, 웹앱 둘 다").
 * 앱마다 autoFocus를 따로 붙이던 일을 화면 골격이 맡는다. 입력 칸은 가장 가까운 화면·시트 범위에 자신을 등록하고,
 * 범위가 진입이 끝난 뒤(Native: 전환·애니메이션 interaction 뒤, Web: mount 직후) 아래 규칙으로 한 번 고른다.
 *
 * - `first-input`: `initialFocusTarget`을 준 칸이 있으면 그 칸, 없으면 등록 순서상 첫 칸. 입력이 화면의 주 행동인 구성
 *   (검색, 작성·편집)의 기본값이다.
 * - `single-input`: 등록된 텍스트 입력이 정확히 하나일 때만 그 칸. 시트·대화상자의 기본값이다 — 칸이 여럿이면 어느
 *   것이 주인지 알 수 없어 기존 포커스 규칙(첫 포커스 가능 요소·덜 파괴적인 행동)을 그대로 둔다.
 * - `none`: 고르지 않는다. 일반 화면과, 입력이 읽기의 보조인 대화·댓글 화면의 기본값이다 — 키보드가 올라오면 읽던
 *   기록을 가린다. 같은 prop으로 켤 수 있다.
 *
 * 비활성·읽기 전용 칸은 고르지 않고 `initialFocusTarget={false}` 칸은 제외한다. 화면 범위는 mount당 한 번만 포커스한다:
 * 스택에서 돌아온 화면(이미 mount된 화면)을 다시 포커스하면 키보드가 돌아온 맥락을 가리고, HJM은 내비게이션 포커스
 * 신호를 알지 못한다. 시트·대화상자는 열릴 때마다 다시 고른다. 모션 감소는 애니메이션에만 적용하고 포커스는 그대로 한다.
 */
export type InitialFocusMode = "first-input" | "single-input" | "none";
export type ScreenInitialFocus = "first-input" | "none";
export type InitialFocusCandidate = Readonly<{
  /** Registration order inside the scope (tree order). */
  order: number;
  /** `initialFocusTarget` on the field: true prefers it, false excludes it, undefined keeps it eligible. */
  preference: boolean | undefined;
  /** False for disabled or read-only fields at resolve time. */
  focusable: boolean;
}>;

/** Defaults per composition; renderers read these instead of repeating literals. */
export const initialFocusDefaults = {
  screen: "none",
  search: "first-input",
  editor: "first-input",
  chat: "none",
  commentThread: "none",
  overlay: "single-input",
} as const satisfies Record<string, InitialFocusMode>;

export function resolveInitialFocusTarget<T extends InitialFocusCandidate>(candidates: readonly T[], mode: InitialFocusMode): T | null {
  if (mode === "none") return null;
  const ordered = [...candidates].sort((a, b) => a.order - b.order);
  if (mode === "single-input") {
    const only = ordered.length === 1 ? ordered[0]! : null;
    return only && only.focusable && only.preference !== false ? only : null;
  }
  const eligible = ordered.filter(candidate => candidate.focusable && candidate.preference !== false);
  return eligible.find(candidate => candidate.preference === true) ?? eligible[0] ?? null;
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

/**
 * Shared timeline geometry. 2026-10-16 user decision: the common chat standard follows the measured
 * KakaoTalk iOS chat room (@3x capture: bubble ~35pt tall, radius ~14, run gap ~6, group gap ~12,
 * avatar ~34, avatar gap 8). Brand colors and artwork are not copied; surfaces stay semantic tokens.
 */
export const chatMessageRecipe = {
  // Must be a size the Avatar renders on both platforms: 36 was no Web Avatar step (32/40/48/64), so Web drew a 32
  // avatar in a 36 slot while Native drew 36 (2026-10-17 measured audit). `small` is the step nearest the ~34 reference.
  avatarSize: avatarRecipe.sizes.small,
  avatarGap: spacing.xs,
  authorGap: spacing.xxs,
  metaGap: spacing.xxs,
  bubbleRadius: 14,
  bubblePaddingInline: 10,
  bubblePaddingBlock: 6,
  // Bubbles of one run read as a stack; a new author or minute starts a visibly separate group.
  runGap: 6,
  groupGap: spacing.sm,
  // Flat-topped tip continuing the bubble's top edge; the tipped corner tightens to meet it.
  tailWidth: 7,
  tailHeight: 10,
  tailCornerRadius: 4,
  jumpToLatestGap: spacing.xs,
  // Timeline side gutter (measured 10pt); header and composer keep the screen padding.
  timelineInset: 10,
  // Photos render without the bubble surface (measured reference: ~210pt wide, bubble radius).
  mediaWidth: 210,
  mediaGap: 2,
} as const;

/** Column count for a photo set: pairs read as 2-up, other counts as 3-up; one photo spans the width. */
export function resolveChatMediaColumns(count: number): 1 | 2 | 3 {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Chat media requires at least one item");
  return count === 1 ? 1 : count === 2 || count === 4 ? 2 : 3;
}

/**
 * Long-press menu geometry measured from the Instagram iOS DM hold menu (2026-10-16 @3x capture):
 * full-width reaction strip ~60pt with ~30pt emoji, the pressed bubble itself as preview, and a ~200pt
 * action card aligned to the bubble's side with ~56pt rows. 12pt between the three blocks.
 */
/** Emoji row above a comment composer (Instagram comment sheet, 2026-10-16): evenly spread 44pt targets. */
export const composerQuickInsertRecipe = { itemSize: 44, emojiSize: 26, gap: spacing.xs } as const;

export const holdMenuRecipe = {
  inset: 10,
  gap: spacing.sm,
  stripHeight: 60,
  stripItemSize: 48,
  emojiSize: 28,
  actionWidth: 200,
  actionRowHeight: 56,
  actionRadius: 18,
  iconSize: 24,
} as const;

/** Position inside a run of consecutive messages from one author within one displayed minute. */
export type ChatMessageGroupPosition = "single" | "first" | "middle" | "last";

/**
 * Runs break when the author or the displayed timestamp changes, so each minute shows its time once
 * and a new minute re-introduces the author (KakaoTalk behavior). Products pass the same localized
 * timestamp string they render; HJM never parses dates.
 */
export function resolveChatMessageGroups(items: readonly Readonly<{ id: string; authorId: string; timestamp: string }>[]): ReadonlyMap<string, ChatMessageGroupPosition> {
  const positions = new Map<string, ChatMessageGroupPosition>();
  items.forEach((item, index) => {
    if (!item.id.trim() || positions.has(item.id)) throw new TypeError("Chat messages require unique, nonempty ids");
    const same = (other: (typeof items)[number] | undefined) => !!other && other.authorId === item.authorId && other.timestamp === item.timestamp;
    const before = same(items[index - 1]), after = same(items[index + 1]);
    positions.set(item.id, before ? (after ? "middle" : "last") : after ? "first" : "single");
  });
  return positions;
}

/** What one bubble shows for its run position; both renderers read this instead of re-deriving rules. */
export function resolveChatMessageGroupDisplay(position: ChatMessageGroupPosition = "single") {
  if (!["single", "first", "middle", "last"].includes(position)) throw new TypeError("Unknown chat message group position");
  const starts = position === "single" || position === "first";
  const ends = position === "single" || position === "last";
  return { showAuthor: starts, showAvatar: starts, showTail: starts, showTimestamp: ends, spacingBefore: starts ? chatMessageRecipe.groupGap : chatMessageRecipe.runGap } as const;
}

/** Bubble alignment expresses authorship, not delivery; delivery text always comes from the product receipt. */
export type ChatMessageDescriptor = Readonly<{
  direction: "incoming" | "outgoing";
  author: string;
  timestamp: string;
  deliveryLabel?: string;
  /** Inward drag reveals time (incoming right, outgoing left) while delivery state remains visible; default shows time beside the last bubble of a run. */
  timestampPresentation?: "always" | "swipe";
  /** Authorship tip on the run's first bubble. Default on since the 2026-10-16 timeline standard. */
  bubbleTail?: boolean;
  /** From resolveChatMessageGroups; omitted means a standalone message. */
  groupPosition?: ChatMessageGroupPosition;
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

/**
 * Shared comment-row geometry. 2026-10-16 user decision: comments follow the measured Instagram iOS
 * comment sheet (@3x capture: avatar 32 / reply 24, avatar gap 8, like count under the heart,
 * "Reply" as quiet text below the body, replies indented to the text column). Artwork is not copied.
 */
export const commentThreadRecipe = {
  avatarSize: 32,
  replyAvatarSize: 24,
  avatarGap: spacing.xs,
  lineGap: 2,
  rowGap: spacing.sm,
  // Replies align with the parent's text column instead of an arbitrary section inset.
  replyIndent: 32 + spacing.xs,
  // The heart keeps the 44pt touch target even though the measured reference draws a smaller glyph.
  likeColumnWidth: 44,
  // Optional photo/sticker under the body; the measured reference keeps it thumbnail-sized.
  mediaMaxWidth: 160,
  mediaRadius: radius.md,
  // The trailing vertical-dots menu glyph; the button keeps the shared 44pt IconButton target.
  menuGlyphSize: glyph.sm,
  /**
   * Trailing actions (like, product actions, more) centre their 44 targets on the identity's first line instead of
   * top-aligning the target box (2026-10-17 measured audit: avatar 168 / author line 162 / glyphs 174). The cluster
   * shifts by (first-line height − visible target) / 2 — negative while the line is shorter than the target — and the
   * last control takes IconButton `edge="end"` so its glyph slot ends on the row inset like the avatar starts on it.
   * The first line is the author caption, or the body line when the author runs inline with `bodyText`.
   */
  actionAnchor: { authorTextVariant: "caption", inlineTextVariant: "body" },
} as const;

/**
 * Items of the HJM-owned per-comment "more" menu (2026-10-17: message/comment structure belongs to HJM, review S4#7).
 * Same vocabulary as Menu/ContextMenu; the product supplies only ids, localized labels, tone and availability.
 */
export type CommentMenuItemDescriptor<Key extends string = string> = Pick<MenuItemDescriptor<Key>, "id" | "label" | "disabled" | "tone">;
/** Danger actions (delete, block) always sit last so a destructive row is never the first target; order is otherwise kept. */
export function resolveCommentMenuItems<Key extends string>(items: readonly CommentMenuItemDescriptor<Key>[]): readonly CommentMenuItemDescriptor<Key>[] {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || ids.has(item.id) || !item.label.trim()) throw new TypeError("Comment menu items require unique ids and localized labels");
    ids.add(item.id);
  }
  return [...items.filter(item => item.tone !== "danger"), ...items.filter(item => item.tone === "danger")];
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
  // Loading/nonempty results must not bypass the same count contract used by empty results.
  if ((count !== null && (count < 0 || !Number.isSafeInteger(count))) || !Number.isSafeInteger(appliedFilterCount) || appliedFilterCount < 0) {
    throw new RangeError("Search counts must be nonnegative integers");
  }
  if (count === null || count > 0) return "none";
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
  /** Debounced typing delay; explicit submit remains a separate host action. */
  debounceMs: 300,
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

/** Keep finite negative delays at zero; reject values whose timer behavior varies by host. */
export function resolveSearchDebounceMs(value: number = searchScreenRecipe.debounceMs): number {
  if (!Number.isFinite(value)) throw new RangeError("Search debounceMs must be finite");
  return Math.max(0, value);
}

/** Horizontal intent preserves vertical scrolling and uses one reveal distance across renderers. */
export function timestampRevealOffset(dx: number, dy: number): number {
  // A 12px dead zone and 2:1 direction bias avoid turning taps/list scrolling into a time gesture.
  return dx > 12 && dx > Math.abs(dy) * 2 ? Math.min(dx, 88) : 0;
}

/** Notification previews need an actor/type badge and a separate subject thumbnail.
 * Keep this geometry shared so inboxes do not recreate the same row per product. */
export const notificationRowRecipe = {
  gap: 12, contentGap: 4, avatarSize: 44, avatarBadgeSize: 20,
  thumbnailSize: 44, unreadSize: 6, previewLines: 2, paddingBlock: 12, paddingInline: 16,
} as const;

/** Shared profile identity geometry; product owns the avatar content. */
export const profileSummaryRecipe = Object.freeze({ avatarSize: 72 });

/** Launcher artwork stays above its caption; product overlays may extend beyond the icon frame. */
export const iconTileRecipe = Object.freeze({ iconSize: 64, labelMaxWidth: 72, multilineLabelMaxWidth: 84, multilineLabelMinHeight: 44, ghostOpacity: 0.55, gap: 6, iconRadius: "22%" });
