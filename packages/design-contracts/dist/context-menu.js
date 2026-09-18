export function validateContextMenuAnchor(anchor) {
    if (!Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) {
        throw new TypeError("ContextMenu anchor must be finite viewport coordinates");
    }
}
/**
 * 키보드로 열 때는 좌표가 없다. 그때는 **초점이 있는 요소의 상자**를 앵커로 쓴다 —
 * 화면 구석(0,0)에 띄우면 메뉴가 그 요소와 무관해 보인다.
 */
export function resolveContextMenuAnchor(reason, pointer, focusedRect) {
    if (reason !== "keyboard" && pointer !== null) {
        validateContextMenuAnchor(pointer);
        return pointer;
    }
    if (focusedRect === null) {
        throw new RangeError("ContextMenu opened by keyboard needs the focused element rect");
    }
    return { x: focusedRect.left, y: focusedRect.bottom };
}
export const contextMenuBehavior = {
    controlled: ["open", "defaultOpen", "onOpenChange"],
    inputs: ["items", "sections", "accessibilityLabel"],
    events: ["onAction"],
    configuration: { openReason: ["pointer", "keyboard", "longPress"] },
    stateAxes: {
        availability: ["enabled", "disabled"],
        interaction: ["idle", "hover", "focusVisible"],
    },
    web: {
        roles: ["menu", "menuitem"],
        keyboard: ["ArrowUp", "ArrowDown", "Home", "End", "Enter", "Space", "Escape", "Typeahead"],
        focus: "activeDescendant",
        dismiss: ["escape", "outside"],
    },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "a-keyboard-user-can-open-it-or-the-feature-does-not-exist-without-a-mouse",
        "keyboard-opening-anchors-to-the-focused-elements-box-not-to-the-viewport-origin",
        "the-item-vocabulary-is-menus-own-there-is-no-second-item-type",
        "the-browser-context-menu-is-replaced-only-where-the-product-owns-the-surface",
        "closing-returns-focus-to-the-element-the-menu-was-opened-from",
    ],
};
//# sourceMappingURL=context-menu.js.map