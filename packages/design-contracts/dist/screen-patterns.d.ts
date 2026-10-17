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
 */
export type ScreenContentInset = "default" | "none" | "body-edge";
export declare const screenContentInsets: readonly ["default", "none", "body-edge"];
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
export declare const initialFocusDefaults: {
    readonly screen: "none";
    readonly search: "first-input";
    readonly editor: "first-input";
    readonly chat: "none";
    readonly commentThread: "none";
    readonly overlay: "single-input";
    readonly auth: "none";
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
 *   이후에는 `initialFocusTarget`을 준 칸이 새로 나타날 때만 그 칸을 포커스한다 — 검색 열기·단계 이동처럼 사용자
 *   행동으로 드러난 주 입력이다. 이 규칙은 `initialFocus` 모드와 무관하다(`none` 화면의 검색 칸도 드러날 때 포커스).
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
};
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
};
/** Column count for a photo set: pairs read as 2-up, other counts as 3-up; one photo spans the width. */
export declare function resolveChatMediaColumns(count: number): 1 | 2 | 3;
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
    readonly lineGap: 2;
    readonly rowGap: 12;
    readonly replyIndent: number;
    readonly likeColumnWidth: 44;
    readonly mediaMaxWidth: 160;
    readonly mediaRadius: 12;
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
/** Notification previews need an actor/type badge and a separate subject thumbnail.
 * Keep this geometry shared so inboxes do not recreate the same row per product. */
export declare const notificationRowRecipe: {
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
}>;
/** Launcher artwork stays above its caption; product overlays may extend beyond the icon frame. */
export declare const iconTileRecipe: Readonly<{
    iconSize: 64;
    labelMaxWidth: 72;
    multilineLabelMaxWidth: 84;
    multilineLabelMinHeight: 44;
    ghostOpacity: 0.55;
    gap: 6;
    iconRadius: "22%";
}>;
//# sourceMappingURL=screen-patterns.d.ts.map