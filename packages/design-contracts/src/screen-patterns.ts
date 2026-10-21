import { control, glyph, layout, opacity, radius, spacing } from "./foundations.js";
import { avatarRecipe, emptyStateRecipe } from "./component-recipes.js";
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
    // 2026-10-18: empty copy stays at the 14pt body size, including full-screen compositions.
    titleVariant: state.kind === "empty" ? emptyStateRecipe.title.textVariant : "title",
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
 * `body-bleed`: header, notice and footer keep the shell padding; the body has no gutter on any side, so a map or
 * canvas meets the header (or notice), the screen edges and the footer. With no footer the body is still the last
 * region and clears the bottom insets the screen owns (`safeAreaBottom`, an overlay BottomNavigation) without the
 * gutter. choose-window's map screens used `body-edge` and kept a 16pt strip above and below the map (2026-10-18).
 */
export type ScreenContentInset = "default" | "none" | "body-edge" | "body-bleed";
export const screenContentInsets = ["default", "none", "body-edge", "body-bleed"] as const satisfies readonly ScreenContentInset[];

/**
 * 2026-10-18 사용자 지시: 입력 자동 포커스는 페이지 진입에만 적용하고 하단 시트에서는 폐지한다.
 * 페이지는 `first-input`으로 명시한 주 입력 또는 첫 유효 입력을 한 번 고른다. 하단 시트는 renderer의
 * 상속 경계에서 중첩 화면까지 자동 포커스를 막는다. Dialog·측면 시트의 모달 포커스 계약은 유지한다.
 * `single-input`은 Dialog·측면 시트의 단일 입력 선택, `none`은 입력 자동 선택을 끈다.
 * 비활성·읽기 전용·initialFocusTarget={false} 칸은 제외한다. 이미 포커스된 입력을 빼앗지 않으며
 * 화면은 mount당 한 번만 포커스한다. 모션 감소는 포커스 정책을 바꾸지 않는다.
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
  // 2026-10-18: input focus belongs to page entry, including chat/auth pages; bottom sheets opt out at their boundary.
  screen: "first-input",
  search: "first-input",
  editor: "first-input",
  chat: "first-input",
  commentThread: "first-input",
  overlay: "single-input",
  auth: "first-input",
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

/**
 * 진입 포커스 창(2026-10-18 1.28.1 앱 채택 점검). mount 시점 한 번만 고르면 세 경우가 앱 우회로 남았다: 진입 때 열린
 * 모달 아래 칸(번뚝 첫 가입 약관), 진입 중 비동기로 나타나는 칸(번뚝 계정 삭제 확인), 사용자 행동으로 나중에 나타나는 칸
 * (utilverse 검색 열기, 번뚝 아이디어 시트·spint 작성 단계). 그래서 범위는 아래 상태를 가진다.
 *
 * - `entering`: 진입 중(Native 전환·시트 등장 interaction 전). 칸 등록만 받는다.
 * - `open`: 진입이 끝났지만 아직 포커스하지 못했다. 칸이 새로 등록되거나 위 오버레이가 닫히면 다시 고른다. 모달 아래에서
 *   진입한 화면은 모달이 닫힐 때 사용자가 그 화면을 아직 만지지 않았으면 그때 포커스한다.
 * - `settled`: 포커스했거나, 사용자가 범위를 직접 조작(터치·포인터·키·휠)했거나, 이미 다른 텍스트 칸에 초점이 있다.
 *   이후에 입력이 새로 나타나도 자동 포커스를 다시 시작하지 않는다(2026-10-18 페이지 진입에만 적용).
 *
 * 위에 다른 오버레이가 열려 있는 동안(`blocked`)은 고르지 않고, 그 동안의 조작은 아래 범위의 조작으로 세지 않는다
 * (약관 동의 탭이 화면의 진입 포커스를 끝내면 안 된다). 텍스트 칸에 이미 초점이 있으면 빼앗지 않는다.
 */
export type EntryFocusPhase = "inactive" | "entering" | "open" | "settled";
export type EntryFocusEvent<T extends InitialFocusCandidate> =
  /** The scope mounted (screen) or opened (overlay). */
  | Readonly<{ kind: "activate" }>
  /** The overlay closed or the scope unmounted. */
  | Readonly<{ kind: "deactivate" }>
  /** The enter transition finished. */
  | Readonly<{ kind: "enter" }>
  /** A field mounted into the scope (first registration of that field instance). */
  | Readonly<{ kind: "register"; field: T }>
  /** An overlay above the scope closed. */
  | Readonly<{ kind: "unblock" }>
  /** User touch, pointer, key or wheel input reached the scope. */
  | Readonly<{ kind: "interact" }>;
export type EntryFocusFacts<T extends InitialFocusCandidate> = Readonly<{
  mode: InitialFocusMode;
  /** Every field registered in the scope now, including a newly registered one. */
  candidates: readonly T[];
  /** Another overlay is open above this scope. */
  blocked: boolean;
  /** A text field already has focus (the user's or the app's). */
  textEntryFocused: boolean;
}>;
export type EntryFocusResolution<T> = Readonly<{ phase: EntryFocusPhase; target: T | null }>;

export function resolveEntryFocus<T extends InitialFocusCandidate>(phase: EntryFocusPhase, event: EntryFocusEvent<T>, facts: EntryFocusFacts<T>): EntryFocusResolution<T> {
  const stay = { phase, target: null };
  if (event.kind === "deactivate") return { phase: "inactive", target: null };
  if (event.kind === "activate") return { phase: "entering", target: null };
  if (phase === "inactive") return stay;
  if (event.kind === "interact") return facts.blocked || phase === "settled" ? stay : { phase: "settled", target: null };
  const attempt = (): EntryFocusResolution<T> => {
    if (facts.blocked) return { phase: "open", target: null };
    if (facts.textEntryFocused) return { phase: "settled", target: null };
    const target = resolveInitialFocusTarget(facts.candidates, facts.mode);
    return target ? { phase: "settled", target } : { phase: "open", target: null };
  };
  if (event.kind === "enter") return phase !== "entering" ? stay : facts.mode === "none" ? { phase: "settled", target: null } : attempt();
  if (phase === "entering") return stay;
  if (phase === "open") return attempt();
  // Page entry only: revealing a marked field after interaction/entry must not open the keyboard again.
  return stay;
}

// Reuse reading-width and spacing tokens; do not derive geometry from a product's device or artwork.
export const screenPatternRecipe = {
  // Full-screen reading routes use fixed travel, unlike a Sheet's fraction of its own height.
  // Migrated from Diairy's handle/top-bounce contract so products no longer own dismissal physics.
  pullDismiss: {
    activationDistance: 6,
    distance: 80,
    flickDistance: 32,
    flickVelocity: 0.65,
    maxOffset: 160,
    settleDuration: 140,
    topTolerance: 1,
  },
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
  /** Counters can align to the field end; validation errors retain their normal alignment. */
  descriptionAlign?: "start" | "end";
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
  // The supplied reference keeps the tip on the top edge and curves its underside into the bubble (2026-10-20).
  // Add tailCornerRadius to the drawn width so the tail overlaps the rounded bubble corner without a gap.
  tailWidth: 7,
  tailHeight: 10,
  tailCornerRadius: 4,
  jumpToLatestGap: spacing.xs,
  // Timeline side gutter (measured 10pt); header and composer keep the screen padding.
  timelineInset: 10,
  // Photos render without the bubble surface (measured reference: ~210pt wide, bubble radius).
  mediaWidth: 210,
  mediaGap: 2,
  /**
   * Reaction summary pill beside the time (2026-10-18 BurnTok DM): one button that opens the same hold menu.
   * Counts below `minCount` show the emoji alone, as the measured DM references do for a single reaction.
   */
  reactionSummary: { minHeight: 24, paddingInline: spacing.xs, itemGap: spacing.xxs, emojiGap: 2, minCount: 2 },
} as const;

export type ChatReactionSummaryItem = Readonly<{ id: string; emoji: string; count: number }>;
export type ChatReactionSummary = Readonly<{
  label: string;
  items: readonly ChatReactionSummaryItem[];
  /**
   * Counts only, for readers who cannot react (2026-10-18 Utilverse guests): drawn in the same place beside the time
   * as non-interactive text named by `label`, without the pill surface, so it does not look or act like a control.
   * Default `false` (the pill button that opens the hold menu).
   */
  readOnly?: boolean;
}>;
/**
 * Validates ChatMessage `reactions.summary` and marks which counts are drawn. The label (the button's accessible name)
 * is required; ids are unique and non-empty, emoji non-empty and counts positive integers; a count below
 * `reactionSummary.minCount` shows the emoji alone.
 */
export function resolveChatReactionSummary({ label, items }: ChatReactionSummary): readonly (ChatReactionSummaryItem & Readonly<{ showCount: boolean }>)[] {
  if (!label.trim()) throw new TypeError("Reaction summary requires a localized label");
  const ids = new Set<string>();
  return items.map(item => {
    if (!item.id.trim() || ids.has(item.id)) throw new TypeError("Reaction summary ids must be unique and non-empty");
    if (!item.emoji.trim()) throw new TypeError("Reaction summary items require an emoji");
    if (!Number.isSafeInteger(item.count) || item.count < 1) throw new RangeError("Reaction summary counts must be positive integers");
    ids.add(item.id);
    return { ...item, showCount: item.count >= chatMessageRecipe.reactionSummary.minCount };
  });
}

/**
 * "Someone is typing" row in a chat timeline (2026-10-18 BurnTok DM). It reuses the incoming bubble geometry
 * (chatMessageRecipe) so it reads as the next incoming message; only the dots are its own values. Under reduced
 * motion the dots stay at full opacity instead of pulsing.
 */
export const typingIndicatorRecipe = {
  dotSize: 6,
  dotGap: spacing.xxs,
  /** One pulse of the three dots; each dot starts `staggerMs` after the previous one. */
  cycleMs: 1200,
  staggerMs: 160,
  restOpacity: 0.35,
} as const;

/**
 * Centered date (or time) row between timeline groups (2026-10-18 Utilverse chat, which drew it as a product
 * caption). The next message still owns its own group gap above it, so this row only adds the space before it.
 */
export const chatDateSeparatorRecipe = {
  paddingTop: spacing.sm,
  paddingBottom: spacing.xxs,
  textVariant: "caption",
  tone: "muted",
} as const;

/** Column count for a photo set: pairs read as 2-up, other counts as 3-up; one photo spans the width. */
export function resolveChatMediaColumns(count: number): 1 | 2 | 3 {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Chat media requires at least one item");
  return count === 1 ? 1 : count === 2 || count === 4 ? 2 : 3;
}

/**
 * Paged photo album for ChatMessage `mediaAlbum` and CommentThreadItem `mediaAlbum` (2026-10-18, Utilverse social
 * photos). Only the shown page is rendered, so a product that authorizes each image can fetch one photo at a time
 * instead of every photo in a timeline row. The counter row matches CarouselMotion `navigation="counter"`:
 * previous icon · position · next icon under the page; the frame keeps the host's media width and radius.
 */
export const mediaAlbumRecipe = {
  /** Page frame width / height when the product gives no aspect ratio. */
  defaultAspectRatio: 1,
  /** Space between the page frame and the counter row. */
  controlGap: spacing.xxs,
  /** Previous/next are small ghost IconButtons so the counter row stays compact beside thumbnails. */
  controlSize: "small",
  controlGlyphSize: glyph.sm,
  /**
   * Loading / failed page drawn by `MediaAlbumPageStatus` (2026-10-18 Utilverse: the page frame was one accessible
   * image, so the loading text and retry button inside it were unreachable by screen readers). The status block is
   * centered in the frame (VQ-09); retry is a small secondary Button.
   */
  pageStatus: { gap: spacing.xs, padding: spacing.sm, textVariant: "caption", retryTone: "secondary", retrySize: "small" },
} as const;

export type MediaAlbumPageStatusKind = "loading" | "error";
/** A page status names what the reader is waiting for or what failed; the label is the only copy. */
export function validateMediaAlbumPageStatus(kind: MediaAlbumPageStatusKind, label: string): void {
  if (kind !== "loading" && kind !== "error") throw new TypeError("Media album page status must be loading or error");
  if (!label.trim()) throw new TypeError("Media album page status requires a localized label");
}

/** A controlled index outside the set is a contract error, like Carousel's unknown `currentKey`. */
export function validateMediaAlbum(count: number, index: number): void {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Media album requires at least one page");
  if (!Number.isSafeInteger(index) || index < 0 || index >= count) throw new RangeError("Media album index must point at an existing page");
}

/** One message or comment carries one photo set: either the eager `media` previews or the paged `mediaAlbum`. */
export function validateMediaSetChoice(hasMedia: boolean, hasAlbum: boolean): void {
  if (hasMedia && hasAlbum) throw new TypeError("Pass either media or mediaAlbum, not both");
}

/** Uncontrolled albums keep the nearest page when the product's photo set shrinks (moderation, deletion). */
export function resolveMediaAlbumIndex(count: number, index: number): number {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Media album requires at least one page");
  return Math.min(Math.max(0, Math.trunc(index)), count - 1);
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
  // 2026-10-20 Spint feedback: separate comment blocks and identity/body/action lines for readability.
  lineGap: spacing.xxs,
  rowGap: spacing.lg,
  // Replies align with the parent's text column instead of an arbitrary section inset.
  replyIndent: 32 + spacing.xs,
  // The heart keeps the 44pt touch target even though the measured reference draws a smaller glyph.
  likeColumnWidth: 44,
  // Optional photo/sticker under the body; the measured reference keeps it thumbnail-sized.
  mediaMaxWidth: 160,
  mediaRadius: radius.md,
  // Inline per-comment panel (edit/report/block form) under the action row (2026-10-18, Utilverse): a form reads as its
  // own block, so it sits a full spacing step below the reply line instead of the compact line gap.
  panelGap: spacing.xs,
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
 * What the SearchScreen filter rail does to a result. `narrow` (default) only removes results, so with nothing applied
 * a zero result is the query's and no filter can bring results back. `scope` chooses what is searched (keyword vs
 * address, region, map area): changing it can turn a zero into results even with nothing applied (2026-10-18:
 * choose-window's keyword/address switch is the recovery for a zero result, so it skipped resultSummary entirely).
 */
export type SearchFiltersRole = "narrow" | "scope";
export const searchFiltersRoles = ["narrow", "scope"] as const satisfies readonly SearchFiltersRole[];
/**
 * Whether SearchScreen shows its filter rail (`filters` and the filter sheet trigger). Two-step search shows it only
 * beside results so typing keeps the pinned area short. A query-caused zero hides it only when the filters narrow,
 * because then none of them can fix the zero; scope filters stay as the recovery path. A filter-caused zero always keeps
 * it so the cause can be undone. Both renderers call this so the rule cannot drift between platforms.
 */
export function resolveSearchFilterRailVisible(phase: SearchScreenPhase, twoStep: boolean, cause: SearchEmptyCause, role: SearchFiltersRole = "narrow"): boolean {
  if (!searchFiltersRoles.includes(role)) throw new RangeError("SearchScreen filtersRole must be narrow or scope");
  if (twoStep && phase !== "results") return false;
  return cause !== "query" || role === "scope";
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
const notificationRowGeometry = {
  gap: 12, contentGap: 4, avatarSize: 44, avatarBadgeSize: 20,
  thumbnailSize: 44, unreadSize: 6, previewLines: 2, paddingBlock: 12, paddingInline: 16,
} as const;
export const notificationRowRecipe = {
  ...notificationRowGeometry,
  // Virtualized inboxes provide the section boundary; the shared row owns the text-aligned separator.
  separatorInsetStart: notificationRowGeometry.paddingInline + notificationRowGeometry.avatarSize + notificationRowGeometry.gap,
  interaction: { disabledOpacity: opacity.disabled, pressedOpacity: opacity.pressed },
} as const;

/** Shared profile identity geometry; product owns the avatar content. */
export const profileSummaryRecipe = Object.freeze({
  avatarSize: 72,
  avatarGlyphSize: glyph.xxl,
  actionsLayouts: Object.freeze({
    inline: Object.freeze({ axis: "inline", gap: "xs" } as const),
    stacked: Object.freeze({ axis: "block", gap: "xs" } as const),
  }),
  /**
   * ProfileScreen `editPlacement="summary"` draws the edit action first in the summary's action row. A framed small
   * button reads as the card's own action; the below-summary placement keeps its ghost button (2026-10-15 utilverse
   * account decision: the edit action belongs inside the profile card).
   */
  editAction: Object.freeze({ tone: "secondary", size: "small" } as const),
});

/** Launcher artwork stays above its caption; product overlays may extend beyond the icon frame. */
/**
 * Frame of an IconTile icon (2026-10-18 Utilverse launcher). `surface` draws the shared filled, hairlined frame;
 * `none` leaves product artwork that is already a complete launcher icon unframed. `shape` follows the product's
 * icon theme (squircle on iPhone shells, square on Windows/Linux shells); `size: "fill"` lets the icon span its
 * grid cell between `fillMinSize` and `fillMaxSize` instead of a product computing the cell size.
 */
export type IconTileFrame = "surface" | "none";
export type IconTileShape = "squircle" | "square" | "circle";
export type IconTileSize = "fixed" | "fill";
export const iconTileRecipe = Object.freeze({ iconSize: 64, labelMaxWidth: 72, multilineLabelMaxWidth: 84, multilineLabelMinHeight: 44, ghostOpacity: 0.55, gap: 6, iconRadius: "22%",
  /** Corner radius as a fraction of the icon size; `squircle` keeps the original 22%. */
  shapes: Object.freeze({ squircle: 0.22, square: 0, circle: 0.5 }) as Readonly<Record<IconTileShape, number>>,
  // Standalone tile activation must not add Button face padding around a narrow launcher cell.
  activation: Object.freeze({ minimumTarget: control.minTouchTarget, pressedOpacity: opacity.pressed, disabledOpacity: opacity.disabled }),
  fillMinSize: 48, fillMaxSize: 68,
  defaults: Object.freeze({ frame: "surface" as IconTileFrame, shape: "squircle" as IconTileShape, size: "fixed" as IconTileSize }) });

/**
 * What an IconTile passes to an `icon` render function: the rendered icon edge (`iconSize` for `fixed`, the measured
 * cell-clamped edge for `fill`). Fixed-size artwork (images, generated launcher art) sizes itself from it; Utilverse
 * re-computed the 48–68 clamp from its grid width to size its artwork (2026-10-18).
 */
export type IconTileArtwork = Readonly<{ edge: number }>;

/** The edge a `size="fill"` icon takes in a cell of `cellWidth`, for layout estimates made before the tile measures. */
export function resolveIconTileFillEdge(cellWidth: number): number {
  if (!Number.isFinite(cellWidth) || cellWidth < 0) throw new RangeError("IconTile cell width must be a non-negative finite number");
  return Math.min(iconTileRecipe.fillMaxSize, Math.max(iconTileRecipe.fillMinSize, cellWidth));
}
