/** Why an open Sheet is being asked to close. */
export type SheetDismissReason = "close-action" | "escape" | "back" | "outside" | "swipe" | "programmatic";
/**
 * `trigger` only opens a Sheet. Every close reports the concrete dismiss reason
 * so renderers and product analytics do not have to infer it from platform events.
 */
export type SheetOpenChangeDetails = Readonly<{
    reason: "trigger" | SheetDismissReason;
}>;
/** User-dismiss policy. A controlled owner may always close programmatically. */
export type SheetDismissPolicy = Readonly<{
    dismissible: boolean;
    dismissWhileBusy: boolean;
    outsideDismiss: boolean;
    escapeOrBackDismiss: boolean;
    swipeDismiss: boolean;
}>;
export type SheetOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean, detail: SheetOpenChangeDetails): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, detail: SheetOpenChangeDetails) => void;
}>;
export declare const sheetBehaviorDefaults: {
    readonly dismissible: true;
    readonly dismissWhileBusy: false;
    readonly outsideDismiss: true;
    readonly escapeOrBackDismiss: true;
    readonly swipeDismiss: false;
};
/**
 * Resolves an attempted close without platform knowledge. Programmatic close is
 * intentionally an owner override: a controlled `open={false}` cannot be vetoed
 * by a renderer, even while the Sheet is busy or not user-dismissible.
 */
export declare function canDismissSheet(reason: SheetDismissReason, busy: boolean, policy?: SheetDismissPolicy): boolean;
export type SheetLifecycle = Readonly<{
    open(): number;
    beginDismiss(): number | null;
    requestClose(reason: SheetDismissReason, busy: boolean, policy?: SheetDismissPolicy): boolean;
    completeDismiss(cycle: number): boolean;
}>;
/**
 * Makes persistent native Modal renderers settle each visible cycle once.
 * Platform adapters still decide when native dismissal has actually completed.
 */
export declare function createSheetLifecycle(initiallyVisible?: boolean): SheetLifecycle;
/**
 * 사용자가 시트 높이를 바꾸는 축이다. `sheetRecipe.sizes`는 제품이 여는 높이를 정하고,
 * 이것은 열린 뒤 **사용자가** 단계를 옮기는 문제다 — 지도 위 목록처럼 "조금 보기 ↔ 크게
 * 보기"가 필요한 화면이 그 자리다.
 *
 * `auto`는 단계에 들어가지 않는다. 내용이 정하는 높이라 "다음 단계"가 정의되지 않는다.
 *
 * **드래그 물리는 여기 없다.** 이 계약은 단계 목록과 "다음/이전 단계가 무엇인가"만 갖고,
 * 손가락 속도·관성·고무줄은 넣지 않았다 — 실제 제품 화면 없이 그 값을 정하면 기기에서
 * 다시 다 고치게 된다. 대신 **핸들이 접근 가능한 컨트롤**이라 키보드·보조기기에서도
 * 단계를 옮길 수 있다. 제스처는 제품이 얹고, 결과를 같은 `onDetentChange`로 보낸다.
 */
export type SheetDetent = "medium" | "large" | "full";
export declare const sheetDetentOrder: readonly ["medium", "large", "full"];
export declare function validateSheetDetents(detents: readonly SheetDetent[]): void;
export declare function resolveNextSheetDetent(detents: readonly SheetDetent[], current: SheetDetent, direction: "expand" | "collapse"): SheetDetent | null;
//# sourceMappingURL=sheet.d.ts.map