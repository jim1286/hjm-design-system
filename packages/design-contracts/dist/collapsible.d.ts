/**
 * 접었다 펴는 **한 덩어리**. Accordion과 다른 것은 개수가 아니라 **관계**다.
 *
 * Accordion은 여러 항목이 서로를 안다 — 하나를 열면 다른 것이 닫히는 정책, 항목 사이의
 * 구분선, 그룹 전체의 키보드 이동이 있다. Collapsible은 이웃이 없다. "더 보기",
 * 필터 패널, 접히는 본문처럼 **혼자 있는 disclosure**다.
 *
 * Accordion에 `items.length === 1`로 대신하면 그룹 chrome(구분선·그룹 keyboard)이 따라오고,
 * 그걸 다시 CSS로 지우게 된다. 그래서 별도로 둔다 — 대신 상태 어휘와 모션은 공유한다.
 */
export type CollapsibleOpenState = Readonly<{
    open: boolean;
    defaultOpen?: never;
    onOpenChange(open: boolean): void;
}> | Readonly<{
    open?: never;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}>;
export declare function validateCollapsibleOpenState(state: CollapsibleOpenState): void;
export declare const collapsibleRecipe: {
    readonly slots: readonly ["root", "trigger", "content"];
    readonly gap: 8;
    /** 열고 닫는 것은 같은 자리의 작은 변화라 `enter`/`exit` tier를 쓴다. */
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
export declare const collapsibleBehavior: {
    readonly controlled: readonly ["open", "defaultOpen", "onOpenChange"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled"];
        readonly value: readonly ["open", "closed"];
    };
    readonly web: {
        readonly roles: readonly ["button", "region"];
        readonly keyboard: readonly ["Enter", "Space"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["button"];
        readonly states: readonly ["expanded", "disabled"];
        readonly actions: readonly ["toggle"];
    };
    readonly scenarios: readonly ["the-trigger-reports-aria-expanded-and-points-at-the-region-it-controls", "closed-content-is-removed-from-the-accessibility-tree-not-only-hidden-visually", "one-disclosure-has-no-neighbours-so-there-is-no-group-keyboard-model-here", "accordion-keeps-the-multi-item-case-including-the-one-open-at-a-time-policy"];
};
//# sourceMappingURL=collapsible.d.ts.map