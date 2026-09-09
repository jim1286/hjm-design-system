import { Platform } from "react-native";

/**
 * DOM accessibility props for the React Native renderer running on web
 * (react-native-web).
 *
 * `accessibilityRole` and `accessibilityState` are translated by
 * react-native-web into `role` and a subset of ARIA, but not the state
 * attributes below: an expanded accordion header, a checked choice row, a
 * selected tab and a disabled control all reach the DOM without the attribute
 * a screen reader needs. The keyboard contracts are likewise DOM-only —
 * `onPress` alone gives a `Pressable` no Space activation and no arrow-key
 * traversal inside a radio group or tab list.
 *
 * The builders below are pure so they can be unit-tested directly. `webOnly()`
 * is the single gate: it drops the whole object on a native platform, so a
 * native build carries neither the attributes nor the handlers. React Native's
 * prop types also do not model DOM props, so the widening cast lives there too.
 */
export const isWebRenderer = Platform.OS === "web";

type WebProps = Record<string, unknown>;

/**
 * React Native's `PressableProps` cannot express `aria-*` or `onKeyDown`.
 * Widening at the single spread site keeps the cast out of every component.
 */
export function webOnly(props: WebProps): Record<never, never> {
  return (isWebRenderer ? props : {}) as Record<never, never>;
}

export function webDisclosureProps(
  expanded: boolean,
  disabled: boolean,
): WebProps {
  return { "aria-expanded": expanded, "aria-disabled": disabled };
}

type ChoiceKind = "radio" | "checkbox";

const nextArrowKeys = ["ArrowDown", "ArrowRight"];
const previousArrowKeys = ["ArrowUp", "ArrowLeft"];

/**
 * Space activation for both kinds, plus the WAI-ARIA radio-group arrow
 * contract: arrows move focus and selection together within one group.
 */
export function webChoiceProps({
  kind,
  checked,
  disabled,
  readOnly,
  onActivate,
  tabIndex,
}: Readonly<{
  kind: ChoiceKind;
  checked: boolean | "mixed";
  disabled: boolean;
  readOnly: boolean;
  /** Receives the focused element so a caller can re-enter its own DOM click path. */
  onActivate: (element: WebElementLike) => void;
  tabIndex?: number;
}>): WebProps {
  return {
    "aria-checked": checked,
    "aria-disabled": disabled || readOnly,
    ...(tabIndex === undefined ? {} : { tabIndex }),
    onKeyDown(event: KeyboardEventLike) {
      if (
        event.defaultPrevented
        || event.target !== event.currentTarget
        || disabled
        || readOnly
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
      ) return;
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        if (!event.repeat) onActivate(event.currentTarget);
        return;
      }
      if (kind !== "radio") return;
      const forward = nextArrowKeys.includes(event.key);
      if (!forward && !previousArrowKeys.includes(event.key)) return;
      const group = event.currentTarget.closest('[role="radiogroup"]');
      // A toolbar group has a focus-only arrow contract, so selection must not follow.
      if (!group || group.closest('[role="toolbar"]')) return;
      const options = Array.from(group.querySelectorAll('[role="radio"]')).filter(
        (option) =>
          option.closest('[role="radiogroup"]') === group
          && option.getAttribute("aria-disabled") !== "true"
          && option.getClientRects().length > 0,
      );
      const index = options.indexOf(event.currentTarget);
      if (index < 0) return;
      event.preventDefault();
      const next = options[(index + (forward ? 1 : -1) + options.length) % options.length];
      next?.focus();
      next?.click();
    },
  };
}

export type TabFocusIntent = "next" | "previous" | "first" | "last";

/**
 * Roving tabindex plus the WAI-ARIA tab-list keyboard contract. The next and
 * previous keys follow orientation and resolved direction, so an RTL tab list
 * moves with the reading order rather than against it.
 */
export function webTabProps({
  selected,
  disabled,
  controls,
  focused,
  orientation,
  direction,
  onActivate,
  onMoveFocus,
}: Readonly<{
  selected: boolean;
  disabled: boolean;
  controls: string | undefined;
  focused: boolean;
  orientation: "horizontal" | "vertical";
  direction: "ltr" | "rtl";
  onActivate: () => void;
  onMoveFocus: (intent: TabFocusIntent) => void;
}>): WebProps {
  return {
    "aria-selected": selected,
    "aria-disabled": disabled,
    ...(controls === undefined ? {} : { "aria-controls": controls }),
    tabIndex: !disabled && focused ? 0 : -1,
    onKeyDown(event: KeyboardEventLike) {
      if (
        event.defaultPrevented
        || event.target !== event.currentTarget
        || disabled
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
      ) return;
      if (event.key === " " || event.key === "Spacebar" || event.key === "Enter") {
        event.preventDefault();
        if (!event.repeat) onActivate();
        return;
      }
      const nextKey = orientation === "vertical"
        ? "ArrowDown"
        : direction === "rtl" ? "ArrowLeft" : "ArrowRight";
      const previousKey = orientation === "vertical"
        ? "ArrowUp"
        : direction === "rtl" ? "ArrowRight" : "ArrowLeft";
      const intent: TabFocusIntent | null = event.key === nextKey
        ? "next"
        : event.key === previousKey
          ? "previous"
          : event.key === "Home"
            ? "first"
            : event.key === "End"
              ? "last"
              : null;
      if (intent === null) return;
      event.preventDefault();
      onMoveFocus(intent);
    },
  };
}

/** The DOM subset these helpers touch; the renderer has no DOM lib types. */
type KeyboardEventLike = Readonly<{
  key: string;
  repeat: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  defaultPrevented: boolean;
  target: unknown;
  currentTarget: WebElementLike;
  preventDefault(): void;
}>;

type WebElementLike = Readonly<{
  closest(selector: string): WebElementLike | null;
  querySelectorAll(selector: string): Iterable<WebElementLike>;
  getAttribute(name: string): string | null;
  getClientRects(): Readonly<{ length: number }>;
  focus(): void;
  click(): void;
}>;
