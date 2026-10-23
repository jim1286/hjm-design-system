import { type CornerAccessoryPlacement } from "./component-recipes.js";
import type { MenuItemDescriptor } from "./behaviors.js";
/** Initial load replaces the body; refresh/save errors belong beside retained content. */
export type ScreenContentState = Readonly<{
    kind: "ready";
}> | Readonly<{
    kind: "loading" | "empty" | "error" | "restricted";
    title: string;
    description?: string;
}>;
export declare function resolveScreenContentState(state?: ScreenContentState): {
    readonly kind: "error" | "empty" | "loading" | "ready" | "restricted";
    readonly replacesContent: boolean;
    readonly busy: boolean;
    readonly titleVariant: "body" | "title";
    readonly announcement: "assertive" | "polite";
};
/**
 * Native header band heights. Titled centered headers match the iOS navigation bar (44 control + 4 + 4);
 * icon-only centered headers are compact (2026-10-14 야잘알 tab spacing, 2026-10-17 "상단 여백 줄여").
 * Body top padding shrinks only under a compact header without a notice.
 */
export declare const screenHeaderRecipe: {
    readonly minHeight: 52;
    readonly paddingVertical: 4;
    readonly compactMinHeight: 48;
    readonly compactPaddingVertical: 2;
    readonly compactBodyTop: 4;
    /**
     * Heading levels for the route title, shared by Web and Native (2026-10-17 comparison: Native drew the
     * title as regular-weight Text — 20 start / 18 centered — while Web used bold Heading levels).
     */
    readonly titleLevel: "level3";
    readonly centeredTitleLevel: "level5";
};
/**
 * Leaving a screen (back, close, "설정 나가기") is an icon-only button fixed at the header's leading edge
 * (2026-10-17 user rule: exits had drifted into body text buttons with mixed glyphs). The label is read
 * by assistive tech only. `back` mirrors in RTL; `close` is for modal-style routes.
 */
export type ScreenExitKind = "back" | "close";
export declare const screenExitRecipe: {
    /** Chevron arm length and stroke; close cross arm length. Drawn, not font glyphs, so every platform matches. */
    readonly chevronSize: 10;
    readonly closeSize: 14;
    readonly stroke: 2;
};
export declare function validateScreenExit(exit: Readonly<{
    kind: string;
    label: string;
}>, hasLeading: boolean): void;
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
export declare const screenContentInsets: readonly ["default", "none", "body-edge", "body-bleed"];
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
export declare const initialFocusDefaults: {
    readonly screen: "first-input";
    readonly search: "first-input";
    readonly editor: "first-input";
    readonly chat: "first-input";
    readonly commentThread: "first-input";
    readonly overlay: "single-input";
    readonly auth: "first-input";
};
export declare function resolveInitialFocusTarget<T extends InitialFocusCandidate>(candidates: readonly T[], mode: InitialFocusMode): T | null;
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
Readonly<{
    kind: "activate";
}>
/** The overlay closed or the scope unmounted. */
 | Readonly<{
    kind: "deactivate";
}>
/** The enter transition finished. */
 | Readonly<{
    kind: "enter";
}>
/** A field mounted into the scope (first registration of that field instance). */
 | Readonly<{
    kind: "register";
    field: T;
}>
/** An overlay above the scope closed. */
 | Readonly<{
    kind: "unblock";
}>
/** User touch, pointer, key or wheel input reached the scope. */
 | Readonly<{
    kind: "interact";
}>;
export type EntryFocusFacts<T extends InitialFocusCandidate> = Readonly<{
    mode: InitialFocusMode;
    /** Every field registered in the scope now, including a newly registered one. */
    candidates: readonly T[];
    /** Another overlay is open above this scope. */
    blocked: boolean;
    /** A text field already has focus (the user's or the app's). */
    textEntryFocused: boolean;
}>;
export type EntryFocusResolution<T> = Readonly<{
    phase: EntryFocusPhase;
    target: T | null;
}>;
export declare function resolveEntryFocus<T extends InitialFocusCandidate>(phase: EntryFocusPhase, event: EntryFocusEvent<T>, facts: EntryFocusFacts<T>): EntryFocusResolution<T>;
export declare const screenPatternRecipe: {
    readonly pullDismiss: {
        readonly activationDistance: 6;
        readonly distance: 80;
        readonly flickDistance: 32;
        readonly flickVelocity: 0.65;
        readonly maxOffset: 160;
        readonly settleDuration: 140;
        readonly topTolerance: 1;
    };
    readonly maxWidth: 720;
    readonly padding: 16;
    readonly sectionGap: 24;
    readonly itemGap: 12;
    readonly stateGap: 16;
    readonly headerMinWidth: number;
    readonly messageMaxWidth: "84%";
    readonly attachmentSize: 80;
    readonly attachmentRemoveSize: 24;
    readonly reactionHoldMs: 450;
    readonly reactionMoveTolerance: 10;
    readonly reactionMenuWidth: 320;
    readonly replySwipeDistance: 60;
    readonly composerMinLines: 1;
    readonly composerMaxLines: 5;
    /**
     * In-place room CompositionLayout's loading/empty/error/restricted replacement keeps (`stateHeight`), so the state
     * centers inside a section that has no parent height. 2026-10-23 audit: Yajalal wrapped 13+ layouts in
     * `<View style={{ minHeight: N }}>` + `layoutStyle={{ flex: 1 }}` with 36–220. The steps follow those values:
     * `compact` 96 (rails, inline save errors, share-card rows: 68–96), `regular` 160 (a list/table section's body:
     * 120–180), `large` 220 (a field or chart panel). `fit` keeps the state's own height (an inline loading line).
     * Ready content is never stretched by this floor.
     */
    readonly compositionState: {
        readonly minHeight: {
            readonly fit: null;
            readonly compact: 96;
            readonly regular: 160;
            readonly large: 220;
        };
    };
};
export type CompositionStateHeight = keyof typeof screenPatternRecipe.compositionState.minHeight;
export declare function resolveCompositionStateMinHeight(height?: CompositionStateHeight): number | null;
/**
 * Native host outside the screens: window safe-area insets and the canvas behind them. 2026-10-23 audit: choose-window
 * (`app/_layout.tsx` AppCanvas), Unairplane (`ui/index.tsx` AppScreenHost, FlightLookupScreen, BoardingPassScanner)
 * each wrapped routes in `SafeAreaView edges={["top","left","right"]}` painted `colors.bg`, because ScreenLayout only
 * took top/bottom numbers and its root stops at the reading width, so the window background showed in the notch and
 * beside the column. The bottom stays out of the default: ScreenLayout `safeAreaBottom` pads the last region
 * max(gutter, inset) once, and a host bottom inset would add the gutter on top of it.
 */
export type ScreenHostEdge = "top" | "right" | "bottom" | "left";
export type ScreenHostSurface = "default" | "transparent";
export declare const screenHostDefaults: {
    readonly edges: readonly ["top", "right", "left"];
    readonly surface: "default";
};
/** Padding a ScreenHost applies from window insets; edges outside the list stay 0. */
export declare function resolveScreenHostInsets(edges: readonly ScreenHostEdge[], insets: Readonly<Partial<Record<ScreenHostEdge, number>>>): Readonly<Record<ScreenHostEdge, number>>;
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
export declare function shouldSubmitMessageKey(event: Readonly<{
    key: string;
    shiftKey?: boolean;
    isComposing?: boolean;
    keyCode?: number;
}>, mode?: "newline" | "send"): boolean;
export declare function canSubmitMessage({ value, disabled, pending, attachmentCount }: MessageComposerDescriptor): boolean;
/**
 * Shared timeline geometry. 2026-10-16 user decision: the common chat standard follows the measured
 * KakaoTalk iOS chat room (@3x capture: bubble ~35pt tall, radius ~14, run gap ~6, group gap ~12,
 * avatar ~34, avatar gap 8). Brand colors and artwork are not copied; surfaces stay semantic tokens.
 */
export declare const chatMessageRecipe: {
    readonly avatarSize: 32;
    readonly avatarGap: 8;
    readonly authorGap: 4;
    readonly metaGap: 4;
    readonly bubbleRadius: 14;
    readonly bubblePaddingInline: 10;
    readonly bubblePaddingBlock: 6;
    readonly runGap: 6;
    readonly groupGap: 12;
    readonly tailWidth: 7;
    readonly tailHeight: 10;
    readonly tailCornerRadius: 4;
    readonly jumpToLatestGap: 8;
    readonly timelineInset: 10;
    readonly mediaWidth: 210;
    readonly mediaGap: 2;
    /**
     * Reaction summary pill beside the time (2026-10-18 BurnTok DM): one button that opens the same hold menu.
     * Counts below `minCount` show the emoji alone, as the measured DM references do for a single reaction.
     */
    readonly reactionSummary: {
        readonly minHeight: 24;
        readonly paddingInline: 8;
        readonly itemGap: 4;
        readonly emojiGap: 2;
        readonly minCount: 2;
    };
};
export type ChatReactionSummaryItem = Readonly<{
    id: string;
    emoji: string;
    count: number;
}>;
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
export declare function resolveChatReactionSummary({ label, items }: ChatReactionSummary): readonly (ChatReactionSummaryItem & Readonly<{
    showCount: boolean;
}>)[];
/**
 * "Someone is typing" row in a chat timeline (2026-10-18 BurnTok DM). It reuses the incoming bubble geometry
 * (chatMessageRecipe) so it reads as the next incoming message; only the dots are its own values. Under reduced
 * motion the dots stay at full opacity instead of pulsing.
 */
export declare const typingIndicatorRecipe: {
    readonly dotSize: 6;
    readonly dotGap: 4;
    /** One pulse of the three dots; each dot starts `staggerMs` after the previous one. */
    readonly cycleMs: 1200;
    readonly staggerMs: 160;
    readonly restOpacity: 0.35;
};
/**
 * Centered date (or time) row between timeline groups (2026-10-18 Utilverse chat, which drew it as a product
 * caption). The next message still owns its own group gap above it, so this row only adds the space before it.
 */
export declare const chatDateSeparatorRecipe: {
    readonly paddingTop: 12;
    readonly paddingBottom: 4;
    readonly textVariant: "caption";
    readonly tone: "muted";
};
/** Column count for a photo set: pairs read as 2-up, other counts as 3-up; one photo spans the width. */
export declare function resolveChatMediaColumns(count: number): 1 | 2 | 3;
/**
 * Paged photo album for ChatMessage `mediaAlbum` and CommentThreadItem `mediaAlbum` (2026-10-18, Utilverse social
 * photos). Only the shown page is rendered, so a product that authorizes each image can fetch one photo at a time
 * instead of every photo in a timeline row. The counter row matches CarouselMotion `navigation="counter"`:
 * previous icon · position · next icon under the page; the frame keeps the host's media width and radius.
 */
export declare const mediaAlbumRecipe: {
    /** Page frame width / height when the product gives no aspect ratio. */
    readonly defaultAspectRatio: 1;
    /** Space between the page frame and the counter row. */
    readonly controlGap: 4;
    /** Previous/next are small ghost IconButtons so the counter row stays compact beside thumbnails. */
    readonly controlSize: "small";
    readonly controlGlyphSize: 20;
    /**
     * Loading / failed page drawn by `MediaAlbumPageStatus` (2026-10-18 Utilverse: the page frame was one accessible
     * image, so the loading text and retry button inside it were unreachable by screen readers). The status block is
     * centered in the frame (VQ-09); retry is a small secondary Button.
     */
    readonly pageStatus: {
        readonly gap: 8;
        readonly padding: 12;
        readonly textVariant: "caption";
        readonly retryTone: "secondary";
        readonly retrySize: "small";
    };
};
export type MediaAlbumPageStatusKind = "loading" | "error";
/** A page status names what the reader is waiting for or what failed; the label is the only copy. */
export declare function validateMediaAlbumPageStatus(kind: MediaAlbumPageStatusKind, label: string): void;
/** A controlled index outside the set is a contract error, like Carousel's unknown `currentKey`. */
export declare function validateMediaAlbum(count: number, index: number): void;
/** One message or comment carries one photo set: either the eager `media` previews or the paged `mediaAlbum`. */
export declare function validateMediaSetChoice(hasMedia: boolean, hasAlbum: boolean): void;
/** Uncontrolled albums keep the nearest page when the product's photo set shrinks (moderation, deletion). */
export declare function resolveMediaAlbumIndex(count: number, index: number): number;
/**
 * Long-press menu geometry measured from the Instagram iOS DM hold menu (2026-10-16 @3x capture):
 * full-width reaction strip ~60pt with ~30pt emoji, the pressed bubble itself as preview, and a ~200pt
 * action card aligned to the bubble's side with ~56pt rows. 12pt between the three blocks.
 */
/** Emoji row above a comment composer (Instagram comment sheet, 2026-10-16): evenly spread 44pt targets. */
export declare const composerQuickInsertRecipe: {
    readonly itemSize: 44;
    readonly emojiSize: 26;
    readonly gap: 8;
};
export declare const holdMenuRecipe: {
    readonly inset: 10;
    readonly gap: 12;
    readonly stripHeight: 60;
    readonly stripItemSize: 48;
    readonly emojiSize: 28;
    readonly actionWidth: 200;
    readonly actionRowHeight: 56;
    readonly actionRadius: 18;
    readonly iconSize: 24;
};
/** Position inside a run of consecutive messages from one author within one displayed minute. */
export type ChatMessageGroupPosition = "single" | "first" | "middle" | "last";
/**
 * Runs break when the author or the displayed timestamp changes, so each minute shows its time once
 * and a new minute re-introduces the author (KakaoTalk behavior). Products pass the same localized
 * timestamp string they render; HJM never parses dates.
 */
export declare function resolveChatMessageGroups(items: readonly Readonly<{
    id: string;
    authorId: string;
    timestamp: string;
}>[]): ReadonlyMap<string, ChatMessageGroupPosition>;
/** What one bubble shows for its run position; both renderers read this instead of re-deriving rules. */
export declare function resolveChatMessageGroupDisplay(position?: ChatMessageGroupPosition): {
    readonly showAuthor: boolean;
    readonly showAvatar: boolean;
    readonly showTail: boolean;
    readonly showTimestamp: boolean;
    readonly spacingBefore: 12 | 6;
};
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
export declare function resolvePermissionAction(status: PermissionScreenStatus): "settings" | "request" | "continue" | null;
/** Footer slot of PermissionScreen in display order. */
export type PermissionFooterSlot = "primary" | "recheck" | "alternative" | "skip";
/** Button emphasis per slot: one filled primary, framed same-width secondaries, a quiet skip last. */
export type PermissionFooterEmphasis = "primary" | "secondary" | "ghost";
/**
 * Footer order and hierarchy (2026-10-23). Unairplane's boarding-pass scanner put "check again" and "choose a photo"
 * as Buttons inside `explanation` because the footer had only primary + skip, so their order, width and emphasis
 * differed from the footer. HJM now owns them:
 * 1. primary — request / settings / continue from `resolvePermissionAction`;
 * 2. recheck — re-read the OS permission after the user returns from settings; only while `denied`;
 * 3. alternative — a path that works without the permission (pick a photo, type it in); hidden once `granted`,
 *    where the screen only continues;
 * 4. skip — leave the feature (ghost, last), unchanged.
 * Secondaries are framed and full width like the primary (SELECTION 보조 행동: 주 행동 아래 같은 폭 secondary).
 */
export declare function resolvePermissionFooter(status: PermissionScreenStatus, supplied: Readonly<{
    recheck: boolean;
    alternative: boolean;
    skip: boolean;
}>): readonly Readonly<{
    slot: PermissionFooterSlot;
    emphasis: PermissionFooterEmphasis;
}>[];
export declare function resolveOnboardingStep(total: number, index: number): {
    first: boolean;
    last: boolean;
};
/**
 * Shared comment-row geometry. 2026-10-16 user decision: comments follow the measured Instagram iOS
 * comment sheet (@3x capture: avatar 32 / reply 24, avatar gap 8, like count under the heart,
 * "Reply" as quiet text below the body, replies indented to the text column). Artwork is not copied.
 */
export declare const commentThreadRecipe: {
    readonly avatarSize: 32;
    readonly replyAvatarSize: 24;
    readonly avatarGap: 8;
    readonly lineGap: 4;
    readonly rowGap: 20;
    readonly replyIndent: number;
    readonly likeColumnWidth: 44;
    readonly mediaMaxWidth: 160;
    readonly mediaRadius: 12;
    readonly panelGap: 8;
    readonly menuGlyphSize: 20;
    /**
     * Trailing actions (like, product actions, more) centre their 44 targets on the identity's first line instead of
     * top-aligning the target box (2026-10-17 measured audit: avatar 168 / author line 162 / glyphs 174). The cluster
     * shifts by (first-line height − visible target) / 2 — negative while the line is shorter than the target — and the
     * last control takes IconButton `edge="end"` so its glyph slot ends on the row inset like the avatar starts on it.
     * The first line is the author caption, or the body line when the author runs inline with `bodyText`.
     */
    readonly actionAnchor: {
        readonly authorTextVariant: "caption";
        readonly inlineTextVariant: "body";
    };
};
/**
 * Items of the HJM-owned per-comment "more" menu (2026-10-17: message/comment structure belongs to HJM, review S4#7).
 * Same vocabulary as Menu/ContextMenu; the product supplies only ids, localized labels, tone and availability.
 */
export type CommentMenuItemDescriptor<Key extends string = string> = Pick<MenuItemDescriptor<Key>, "id" | "label" | "disabled" | "tone">;
/** Danger actions (delete, block) always sit last so a destructive row is never the first target; order is otherwise kept. */
export declare function resolveCommentMenuItems<Key extends string>(items: readonly CommentMenuItemDescriptor<Key>[]): readonly CommentMenuItemDescriptor<Key>[];
/** Replies are one level deep; reject orphaned/duplicate records instead of silently losing them. */
export declare function validateCommentThread(items: readonly {
    id: string;
    parentId: string | null;
}[]): void;
/** Source bytes, permission requests, ordering and upload limits remain product-owned. */
export type MessageAttachmentDescriptor = Readonly<{
    id: string;
    removeLabel: string; /** Local preparation can lock removal without locking text entry. */
    disabled?: boolean;
}>;
export declare function validateMessageAttachments(attachments: readonly MessageAttachmentDescriptor[]): void;
/** Require horizontal intent so a timeline scroll cannot accidentally start a reply. */
export declare function isReplySwipe(dx: number, dy: number): boolean;
/** The UI never infers permission or camera availability; product adapters own both. */
export type PhotoSource = "library" | "camera";
export type PhotoSourceLabels = Readonly<{
    title: string;
    library: string;
    camera: string;
    cancel: string;
}>;
export type SavedItem = Readonly<{
    id: string;
    title: string;
}>;
export type SavedCollection = Readonly<{
    id: string;
    title: string;
    itemIds: readonly string[];
}>;
export type SavedItemsLabels = Readonly<{
    allItems: string;
    privateNotice: string;
    back: string;
    empty: string;
    createCollection: string;
}>;
/** Unsave removes an item from every collection view without rewriting product-owned membership. */
export declare function resolveSavedItems<T extends SavedItem>(items: readonly T[], collections: readonly SavedCollection[], collectionId: string | null | undefined, selectedItemId: string | null | undefined): {
    home: boolean;
    collection: Readonly<{
        id: string;
        title: string;
        itemIds: readonly string[];
    }> | undefined;
    visible: readonly T[];
    selected: T | undefined;
};
/**
 * SearchScreen phases (2026-10-06 search redesign, docs/screen-patterns.md#searchscreen-두-단계-검색).
 * Without a committed query (one-step search, the pre-1.13 behavior) any nonblank query is already
 * `results`. With one, typing a different query is `typing`: suggestions replace the results until the
 * user commits (Enter, a suggestion, a recent or suggested query). Comparing trimmed values keeps a
 * trailing space from flipping committed results back into suggestions.
 */
export type SearchScreenPhase = "idle" | "typing" | "results";
export declare function resolveSearchScreenPhase(query: string, committedQuery?: string): SearchScreenPhase;
/**
 * The value a commit records, or `null` when there is nothing to commit. Blank commits are dropped
 * so a stray Enter never writes an empty recent search or fetches "everything".
 */
export declare function resolveSearchCommit(value: string): string | null;
/**
 * Why a committed search shows nothing. `filters` keeps the filter rail and offers "clear all";
 * `query` hides the rail (no filter can fix it) and offers suggested queries instead. Reference
 * services hide the rail on every zero result, which removes the only way to undo a filter.
 * `null` count means the result is still loading, so no cause is reported yet.
 */
export type SearchEmptyCause = "none" | "filters" | "query";
export declare function resolveSearchEmptyCause(count: number | null, appliedFilterCount: number): SearchEmptyCause;
/**
 * What the SearchScreen filter rail does to a result. `narrow` (default) only removes results, so with nothing applied
 * a zero result is the query's and no filter can bring results back. `scope` chooses what is searched (keyword vs
 * address, region, map area): changing it can turn a zero into results even with nothing applied (2026-10-18:
 * choose-window's keyword/address switch is the recovery for a zero result, so it skipped resultSummary entirely).
 */
export type SearchFiltersRole = "narrow" | "scope";
export declare const searchFiltersRoles: readonly ["narrow", "scope"];
/**
 * Whether SearchScreen shows its filter rail (`filters` and the filter sheet trigger). Two-step search shows it only
 * beside results so typing keeps the pinned area short. A query-caused zero hides it only when the filters narrow,
 * because then none of them can fix the zero; scope filters stay as the recovery path. A filter-caused zero always keeps
 * it so the cause can be undone. Both renderers call this so the rule cannot drift between platforms.
 */
export declare function resolveSearchFilterRailVisible(phase: SearchScreenPhase, twoStep: boolean, cause: SearchEmptyCause, role?: SearchFiltersRole): boolean;
/**
 * Index to focus after removing item `removedIndex` from a list that now has `remaining` items:
 * the item that slid into its place, else the new last item, else -1 (move to the fallback target).
 * Removing a focused chip or row would otherwise drop focus to <body>.
 */
export declare function resolveFocusAfterRemoval(removedIndex: number, remaining: number): number;
/** Recipe for the SearchScreen phase sections; geometry stays on shared spacing tokens. */
export declare const searchScreenRecipe: {
    /** Debounced typing delay; explicit submit remains a separate host action. */
    readonly debounceMs: 300;
    /** Recent searches shown before the user types; reference services show 5–10 and let the rest scroll away. */
    readonly recentVisible: 5;
    /** Suggestions under the "search for ‘q’" row. */
    readonly suggestionVisible: 6;
    /** Skeleton rows while the first page of results loads. */
    readonly loadingRows: 4;
    /** Between idle sections (recent, suggested). */
    readonly sectionGap: 24;
    /** Section title to its list, and results header to applied filters. */
    readonly headerGap: 12;
    /** Between chips in applied filters and suggested queries. */
    readonly chipGap: 8;
};
/** Keep finite negative delays at zero; reject values whose timer behavior varies by host. */
export declare function resolveSearchDebounceMs(value?: number): number;
/** Horizontal intent preserves vertical scrolling and uses one reveal distance across renderers. */
export declare function timestampRevealOffset(dx: number, dy: number): number;
export declare const notificationRowRecipe: {
    readonly separatorInsetStart: number;
    readonly interaction: {
        readonly disabledOpacity: 0.5;
        readonly pressedOpacity: 0.86;
    };
    readonly gap: 12;
    readonly contentGap: 4;
    readonly avatarSize: 44;
    readonly avatarBadgeSize: 20;
    readonly thumbnailSize: 44;
    readonly unreadSize: 6;
    readonly previewLines: 2;
    readonly paddingBlock: 12;
    readonly paddingInline: 16;
};
/** Shared profile identity geometry; product owns the avatar content. */
export declare const profileSummaryRecipe: Readonly<{
    avatarSize: 72;
    avatarGlyphSize: 44;
    actionsLayouts: Readonly<{
        inline: Readonly<{
            readonly axis: "inline";
            readonly gap: "xs";
        }>;
        stacked: Readonly<{
            readonly axis: "block";
            readonly gap: "xs";
        }>;
    }>;
    /**
     * ProfileScreen `editPlacement="summary"` draws the edit action first in the summary's action row. A framed small
     * button reads as the card's own action; the below-summary placement keeps its ghost button (2026-10-15 utilverse
     * account decision: the edit action belongs inside the profile card).
     */
    editAction: Readonly<{
        readonly tone: "secondary";
        readonly size: "small";
    }>;
}>;
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
export declare const iconTileRecipe: Readonly<{
    iconSize: 64;
    labelMaxWidth: 72;
    multilineLabelMaxWidth: 84;
    multilineLabelMinHeight: 44;
    ghostOpacity: 0.55;
    gap: 6;
    iconRadius: "22%";
    /** Corner radius as a fraction of the icon size; `squircle` keeps the original 22%. */
    shapes: Readonly<Record<IconTileShape, number>>;
    activation: Readonly<{
        minimumTarget: 44;
        pressedOpacity: 0.86;
        disabledOpacity: 0.5;
    }>;
    fillMinSize: 48;
    fillMaxSize: 68;
    /**
     * `locked`: the tile stays pressable so the product can explain why (sign-in required), drawn at the disabled
     * opacity, and its name gains the product's `lockedLabel`. Utilverse ToolboxScreen dimmed an outer View with
     * activation.disabledOpacity and put the lock badge at `right: -4, top: -4` (2026-10-23); the corner accessory keeps
     * full opacity so the reason mark stays legible.
     */
    locked: Readonly<{
        opacity: 0.5;
    }>;
    /** Corner mark on the icon frame; `offset` is the outward overhang (Asset/Avatar meaning), spacing.xxs 4. */
    accessory: Readonly<{
        offset: 4;
    }>;
    defaults: Readonly<{
        frame: IconTileFrame;
        shape: IconTileShape;
        size: IconTileSize;
        accessoryPlacement: CornerAccessoryPlacement;
    }>;
}>;
/**
 * What an IconTile passes to an `icon` render function: the rendered icon edge (`iconSize` for `fixed`, the measured
 * cell-clamped edge for `fill`). Fixed-size artwork (images, generated launcher art) sizes itself from it; Utilverse
 * re-computed the 48–68 clamp from its grid width to size its artwork (2026-10-18).
 */
export type IconTileArtwork = Readonly<{
    edge: number;
}>;
/** The edge a `size="fill"` icon takes in a cell of `cellWidth`, for layout estimates made before the tile measures. */
export declare function resolveIconTileFillEdge(cellWidth: number): number;
//# sourceMappingURL=screen-patterns.d.ts.map