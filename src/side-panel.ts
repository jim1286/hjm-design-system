import type { ColorReference } from "./color-references.js";
import type { BehaviorContract } from "./behaviors.js";
import { floatingSurfaceContract, focusIndicatorContract } from "./component-contracts.js";
import {
  backdrop,
  control,
  motionPreset,
  shadow,
  spacing,
  type TextVariant,
} from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/** Logical, RTL-aware docking side. `top`/`bottom` stay Sheet's job — see docs/side-panel.md. */
export type SidePanelEdge = "start" | "end";

/**
 * No `"back"`/`"swipe"`: SidePanel is Web-only (no hardware back, no
 * measured demand for a swipe-to-dismiss drawer). Everything else mirrors
 * `SheetDismissReason` (`src/sheet.ts`) because the *reasons* a panel closes
 * are the same on Web; only which reasons are *permitted* differs by `modal`.
 */
export type SidePanelDismissReason = "close-action" | "escape" | "outside" | "programmatic";

export type SidePanelOpenChangeDetails = Readonly<{
  reason: "trigger" | SidePanelDismissReason;
}>;

export type SidePanelOpenState =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange(open: boolean, detail: SidePanelOpenChangeDetails): void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, detail: SidePanelOpenChangeDetails) => void;
    }>;

/**
 * `modal` is the axis Sheet does not need (Sheet is always modal). A
 * non-modal panel has no backdrop to click "outside" of — the rest of the
 * page stays live and interactive — so `outsideDismiss` is not merely
 * defaulted to `false` there, the type forbids it from existing at all.
 * This is the same "make the invalid combination unrepresentable" move as
 * `SheetOpenState`'s controlled/uncontrolled split.
 */
export type SidePanelDismissPolicy =
  | Readonly<{
      modal: true;
      dismissible: boolean;
      dismissWhileBusy: boolean;
      escapeDismiss: boolean;
      outsideDismiss: boolean;
    }>
  | Readonly<{
      modal: false;
      dismissible: boolean;
      dismissWhileBusy: boolean;
      escapeDismiss: boolean;
      outsideDismiss?: never;
    }>;

export const sidePanelBehaviorDefaults = {
  modal: true,
  dismissible: true,
  dismissWhileBusy: false,
  escapeDismiss: true,
  outsideDismiss: true,
} as const satisfies Extract<SidePanelDismissPolicy, { modal: true }>;

/**
 * Same shape and role as `canDismissSheet`, kept as a separate function
 * because the two owning types are not generic over each other (`sheet.ts`
 * is a shared file this module must not edit) and the `modal` branch is
 * genuine new logic, not a copy.
 */
export function canDismissSidePanel(
  reason: SidePanelDismissReason,
  busy: boolean,
  policy: SidePanelDismissPolicy = sidePanelBehaviorDefaults,
): boolean {
  if (reason === "programmatic") return true;
  if (!policy.dismissible) return false;
  if (busy && !policy.dismissWhileBusy) return false;
  if (reason === "outside") return policy.modal ? policy.outsideDismiss : false;
  if (reason === "escape") return policy.escapeDismiss;
  return true;
}

export type SidePanelSize = "compact" | "regular" | "wide";

/**
 * No `createSidePanelLifecycle` counterpart to `createSheetLifecycle`: that
 * machinery exists solely to make Android's persistently-mounted native
 * Modal settle one visible cycle at a time. SidePanel is Web-only, where a
 * plain CSS `transitionend`/exit-callback (the same pattern `sheetRecipe`
 * and `dialogRecipe` already assume for Web) is the whole story — adding a
 * cycle counter here would solve a problem this platform does not have.
 */
export const sidePanelRecipe = {
  slots: ["backdrop", "positioner", "content", "header", "title", "body", "footer", "close"] as const,
  defaults: { edge: "end", size: "regular" },
  sizes: { compact: 320, regular: 400, wide: 560 },
  backdrop: backdrop.modal,
  content: {
    background: semanticColors.canvas,
    border: semanticColors.border.default,
    borderWidth: floatingSurfaceContract.borderWidth,
    /** Flush to the viewport edge it docks to — unlike Sheet's floating `xl` radius. */
    radius: null,
    shadow: shadow.overlay,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  header: { minHeight: control.minTouchTarget, gap: spacing.sm },
  title: {
    color: semanticColors.content.primary,
    textVariant: "title",
    fontWeight: "700",
  },
  body: {
    color: semanticColors.content.body,
    textVariant: "body",
    gap: spacing.md,
  },
  footer: {
    color: semanticColors.content.body,
    textVariant: "body",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  transition: { enter: motionPreset.enter, exit: motionPreset.exit },
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["backdrop", "positioner", "content", "header", "title", "body", "footer", "close"];
  defaults: { edge: SidePanelEdge; size: SidePanelSize };
  sizes: Record<SidePanelSize, number>;
  backdrop: typeof backdrop.modal;
  content: {
    background: ColorReference;
    border: ColorReference;
    borderWidth: number;
    radius: null;
    shadow: typeof shadow.overlay;
    paddingHorizontal: number;
    paddingTop: number;
    paddingBottom: number;
  };
  header: { minHeight: number; gap: number };
  title: { color: ColorReference; textVariant: TextVariant; fontWeight: string };
  body: { color: ColorReference; textVariant: TextVariant; gap: number };
  footer: { color: ColorReference; textVariant: TextVariant; gap: number; paddingTop: number };
  transition: { enter: typeof motionPreset.enter; exit: typeof motionPreset.exit };
  states: { focus: typeof focusIndicatorContract };
};

/**
 * `web.focus` can only hold one value, but the real behavior branches on
 * `modal`: `"trap"` (default, modal) vs. no trap at all when `modal: false`.
 * The field records the default configuration; the non-modal case is a
 * documented exception in `docs/side-panel.md`, the same way this contract
 * records one representative value elsewhere and pushes edge cases to
 * `scenarios`.
 */
export const sidePanelBehavior = {
  controlled: ["open", "defaultOpen", "onOpenChange", "dismissPolicy"],
  defaults: sidePanelBehaviorDefaults,
  configuration: {
    edge: ["start", "end"],
    modal: ["true", "false"],
  },
  stateAxes: {
    availability: ["enabled", "busy"],
    value: ["open"],
  },
  web: {
    roles: ["dialog"],
    keyboard: ["Tab", "Escape"],
    focus: "trap",
    dismiss: ["escape", "outside"],
  },
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "edge-is-a-logical-start-or-end-direction-never-left-or-right",
    "modal-panels-trap-focus-and-lock-scroll-non-modal-panels-do-neither",
    "non-modal-panels-never-expose-outside-dismiss-the-type-forbids-it",
    "single-dismiss-callback-reports-the-concrete-reason",
    "busy-blocks-user-dismiss-programmatic-owner-close-is-always-allowed",
    "escape-dismisses-in-both-modal-and-non-modal-panels",
    "no-back-or-swipe-dismiss-reason-exists-on-this-web-only-platform",
    "reduced-motion-still-completes-the-exit-callback-once",
  ],
} as const satisfies BehaviorContract;
