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
export declare const isWebRenderer: boolean;
type WebProps = Record<string, unknown>;
/**
 * React Native's `PressableProps` cannot express `aria-*` or `onKeyDown`.
 * Widening at the single spread site keeps the cast out of every component.
 */
export declare function webOnly(props: WebProps): Record<never, never>;
export declare function webDisclosureProps(expanded: boolean, disabled: boolean): WebProps;
type ChoiceKind = "radio" | "checkbox";
/**
 * Space activation for both kinds, plus the WAI-ARIA radio-group arrow
 * contract: arrows move focus and selection together within one group.
 */
export declare function webChoiceProps({ kind, checked, disabled, readOnly, onActivate, tabIndex, }: Readonly<{
    kind: ChoiceKind;
    checked: boolean | "mixed";
    disabled: boolean;
    readOnly: boolean;
    /** Receives the focused element so a caller can re-enter its own DOM click path. */
    onActivate: (element: WebElementLike) => void;
    tabIndex?: number;
}>): WebProps;
export type TabFocusIntent = "next" | "previous" | "first" | "last";
/**
 * Roving tabindex plus the WAI-ARIA tab-list keyboard contract. The next and
 * previous keys follow orientation and resolved direction, so an RTL tab list
 * moves with the reading order rather than against it.
 */
export declare function webTabProps({ selected, disabled, controls, focused, orientation, direction, onActivate, onMoveFocus, }: Readonly<{
    selected: boolean;
    disabled: boolean;
    controls: string | undefined;
    focused: boolean;
    orientation: "horizontal" | "vertical";
    direction: "ltr" | "rtl";
    onActivate: () => void;
    onMoveFocus: (intent: TabFocusIntent) => void;
}>): WebProps;
type WebElementLike = Readonly<{
    closest(selector: string): WebElementLike | null;
    querySelectorAll(selector: string): Iterable<WebElementLike>;
    getAttribute(name: string): string | null;
    getClientRects(): Readonly<{
        length: number;
    }>;
    focus(): void;
    click(): void;
}>;
export {};
//# sourceMappingURL=web-a11y.d.ts.map