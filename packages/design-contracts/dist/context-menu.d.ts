import type { MenuItemDescriptor } from "./behaviors.js";
/**
 * 포인터 위치에서 열리는 메뉴 — 우클릭, 그리고 터치의 길게 누르기.
 *
 * `Menu`와 **목록은 같고 앵커가 다르다.** Menu는 트리거 버튼에 붙고, ContextMenu는
 * 이벤트가 일어난 **좌표**에 붙는다. 그 차이가 접근성까지 번진다: 트리거가 없으므로
 * 키보드 사용자에게 열 방법을 따로 줘야 한다(Shift+F10 또는 메뉴 키). 그것을 빼면
 * 마우스 없이는 존재하지 않는 기능이 된다 — 이 계약이 그 규칙을 갖는 이유다.
 *
 * 항목 모양은 `MenuItemDescriptor` 그대로다. 두 번째 항목 타입을 만들지 않는다.
 */
export type ContextMenuItemDescriptor<Key extends string = string> = MenuItemDescriptor<Key>;
export type ContextMenuAnchor = Readonly<{
    /** 뷰포트 기준 좌표. 렌더러가 화면 밖으로 나가지 않게 보정한다. */
    x: number;
    y: number;
}>;
export type ContextMenuOpenReason = "pointer" | "keyboard" | "longPress";
export type ContextMenuCloseReason = "selection" | "escape" | "outside" | "programmatic";
export declare function validateContextMenuAnchor(anchor: ContextMenuAnchor): void;
/**
 * 키보드로 열 때는 좌표가 없다. 그때는 **초점이 있는 요소의 상자**를 앵커로 쓴다 —
 * 화면 구석(0,0)에 띄우면 메뉴가 그 요소와 무관해 보인다.
 */
export declare function resolveContextMenuAnchor(reason: ContextMenuOpenReason, pointer: ContextMenuAnchor | null, focusedRect: Readonly<{
    left: number;
    bottom: number;
}> | null): ContextMenuAnchor;
export declare const contextMenuBehavior: {
    readonly controlled: readonly ["open", "defaultOpen", "onOpenChange"];
    readonly inputs: readonly ["items", "sections", "accessibilityLabel"];
    readonly events: readonly ["onAction"];
    readonly configuration: {
        readonly openReason: readonly ["pointer", "keyboard", "longPress"];
    };
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly interaction: readonly ["idle", "hover", "focusVisible"];
    };
    readonly web: {
        readonly roles: readonly ["menu", "menuitem"];
        readonly keyboard: readonly ["ArrowUp", "ArrowDown", "Home", "End", "Enter", "Space", "Escape", "Typeahead"];
        readonly focus: "activeDescendant";
        readonly dismiss: readonly ["escape", "outside"];
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["a-keyboard-user-can-open-it-or-the-feature-does-not-exist-without-a-mouse", "keyboard-opening-anchors-to-the-focused-elements-box-not-to-the-viewport-origin", "the-item-vocabulary-is-menus-own-there-is-no-second-item-type", "the-browser-context-menu-is-replaced-only-where-the-product-owns-the-surface", "closing-returns-focus-to-the-element-the-menu-was-opened-from"];
};
//# sourceMappingURL=context-menu.d.ts.map