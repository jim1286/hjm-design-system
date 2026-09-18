/**
 * Popover is the third corner of a triangle with Tooltip and Menu — all three
 * are "a floating surface anchored to a trigger." Tooltip is explicitly
 * plain-text and never receives focus (docs/tooltip.md: "interactive
 * Popover로 확장하지 않는다"). Menu is a collection of actionable items with
 * its own role/keyboard table (behaviorRegistry.menu). Popover is what is left:
 * arbitrary *interactive* content (a small form, rich text with a link, a
 * mixed layout) that is neither a single plain sentence nor an item list.
 * Focus entering the surface is the decisive, testable difference from
 * Tooltip — everything else here (dismiss reasons, non-modal posture) follows
 * from that one fact.
 */
export type PopoverPlacement = "top" | "bottom" | "start" | "end";
export type PopoverAlign = "start" | "center" | "end";
/**
 * Popover is non-modal: it does not trap focus like Dialog/Sheet and does not
 * block the rest of the page. So its dismiss vocabulary is deliberately
 * narrower than SheetDismissReason — no "back" or "swipe" (this is a web-only
 * surface), but it adds "outside-focus" because, unlike a modal, Tab can
 * legitimately carry focus out of a non-modal surface and that departure is
 * itself a dismiss signal distinct from a pointer click outside.
 */
export type PopoverDismissReason = "close-action" | "outside-pointer" | "outside-focus" | "escape" | "programmatic";
/**
 * 여는 사유는 `"trigger"`다. Sheet·SidePanel·CommandPalette가 모두 이 이름을 쓰고,
 * `"trigger-activation"`은 `src/tooltip.ts`에서 **닫는** 사유(열려 있는 툴팁의
 * 트리거를 눌러 닫는다)로 이미 쓰이고 있다. 한 문자열이 여는 뜻과 닫는 뜻을 겸하면
 * 렌더러가 조용히 반대로 처리한다 — 컴파일러는 둘 다 유효한 문자열로만 본다.
 */
export type PopoverOpenChangeReason = "trigger" | PopoverDismissReason;
export type PopoverOpenChangeDetails = Readonly<{
    reason: PopoverOpenChangeReason;
}>;
export type PopoverDescriptor = Readonly<{
    placement?: PopoverPlacement;
    align?: PopoverAlign;
    /**
     * Optional explicit accessible name. A renderer must connect its visible
     * heading with aria-labelledby; a heading alone does not name a dialog.
     */
    accessibilityLabel?: string;
}>;
export type ResolvedPopoverDescriptor = Readonly<{
    placement: PopoverPlacement;
    align: PopoverAlign;
    accessibilityLabel?: string;
}>;
export declare const popoverDescriptorDefaults: {
    readonly placement: "bottom";
    readonly align: "start";
};
/**
 * A controlled owner's programmatic close always wins, exactly like
 * SheetDismissPolicy/canDismissSheet. Popover has no `busy` axis: unlike
 * Sheet/AlertDialog it is not modal, so there is no global "block every
 * dismiss" state to defend — a form inside the content that wants to ignore
 * Escape while submitting makes that call itself, at the content level.
 */
export type PopoverDismissPolicy = Readonly<{
    dismissible: boolean;
    outsideDismiss: boolean;
    escapeDismiss: boolean;
    focusOutDismiss: boolean;
}>;
/**
 * 무엇이 popover를 여는가. `press`가 기본이고 `hover`는 **읽기 전용 미리보기**
 * (다른 시스템의 HoverCard)를 위한 축이다.
 *
 * 별도 컴포넌트를 만들지 않은 이유: 표면·초점·dismiss·충돌 회피가 전부 같고 다른 것은
 * 여는 방법 하나뿐이다. 두 컴포넌트로 나누면 그 네 가지가 두 벌이 된다.
 *
 * 대신 `hover`에는 제약이 붙는다 — hover로만 열리는 내용에 **행동을 두면 안 된다**.
 * 포인터가 없는 사용자는 그 행동에 닿을 수 없기 때문이다. 미리보기는 읽기 전용이다.
 */
export type PopoverOpenOn = "press" | "hover";
export declare const popoverBehaviorDefaults: {
    readonly openOn: PopoverOpenOn;
    readonly dismissible: true;
    readonly outsideDismiss: true;
    readonly escapeDismiss: true;
    readonly focusOutDismiss: true;
};
/** hover로 열 때의 지연. 지나가는 포인터마다 열리면 화면이 깜빡인다. */
export declare const popoverHoverDelay: {
    readonly open: 300;
    readonly close: 150;
};
export type ControlledPopoverOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, details: PopoverOpenChangeDetails): void;
}>;
export type UncontrolledPopoverOpenState = Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
}>;
export type PopoverOpenState = ControlledPopoverOpenState | UncontrolledPopoverOpenState;
/** Products own what page-change caused this; Popover only needs "did it happen and how." */
export type PopoverChangeHandler = PopoverOpenState["onOpenChange"];
export declare function validatePopoverDescriptor(descriptor: PopoverDescriptor): void;
export declare function resolvePopoverDescriptor(descriptor: PopoverDescriptor): ResolvedPopoverDescriptor;
export declare function validatePopoverOpenState(state: PopoverOpenState): void;
/**
 * Resolves an attempted close without platform knowledge, mirroring
 * canDismissSheet. Programmatic close is always an owner override.
 */
export declare function canDismissPopover(reason: PopoverDismissReason, policy?: PopoverDismissPolicy): boolean;
/**
 * Positioning boundary is identical to Tooltip's: HJM owns preferred
 * placement, spacing, and motion; DOM measurement, portal, flip/shift, and
 * RTL logical-to-physical translation stay in the product Web renderer's
 * private AnchoredOverlay (see docs/tooltip.md "Positioning boundary"). This
 * module never exposes that internal tool, so Popover cannot regress Tooltip's
 * "no public collision/portal API" boundary.
 */
export declare const popoverRecipe: {
    readonly slots: readonly ["trigger", "content", "arrow", "closeAction"];
    readonly surface: {
        readonly background: Readonly<{
            source: "theme";
            key: "bg";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly borderWidth: 1;
        readonly radius: "md";
        readonly shadow: {
            readonly color: "#000000";
            readonly opacity: 0.12;
            readonly radius: 12;
            readonly offsetY: 4;
        };
        readonly padding: 8;
    };
    readonly arrow: {
        readonly size: 4;
        readonly offset: 4;
    };
    readonly sideOffset: 8;
    readonly collisionPadding: 8;
    readonly minWidth: 240;
    readonly maxWidth: 360;
    readonly transition: {
        readonly enter: {
            readonly duration: 200;
            readonly easing: "enter";
            readonly reducedMotion: "opacity";
        };
        readonly exit: {
            readonly duration: 120;
            readonly easing: "exit";
            readonly reducedMotion: "instant";
        };
    };
};
/**
 * Literal scenario names for behaviorRegistry.popover (lead wires into
 * src/behaviors.ts). Kept here, not there, so this module stays self-contained
 * per the authoring brief.
 */
export declare const popoverBehaviorScenarios: readonly ["focus-enters-surface-on-open", "escape-closes-and-restores-trigger-focus", "outside-pointer-close-does-not-cancel-the-original-interaction", "tabbing-past-last-focusable-child-closes-without-trapping", "controlled-owner-programmatic-close-always-wins", "close-action-inside-content-closes-exactly-once", "trigger-while-open-does-not-reopen", "one-visible-popover-per-trigger"];
//# sourceMappingURL=popover.d.ts.map