import { focusIndicatorContract } from "./component-contracts.js";
import { control, radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export function validateSkipNavDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("SkipNav descriptor must be an object");
    }
    if (typeof descriptor.targetId !== "string" || descriptor.targetId.trim().length === 0) {
        throw new TypeError("SkipNav targetId must not be empty");
    }
    if (descriptor.targetId.startsWith("#")) {
        /*
          제품이 `#main`을 넘기면 링크가 `##main`이 되어 조용히 깨진다. 잘라내 주는 대신
          거절하는 이유는 두 표기가 섞이면 어느 쪽이 맞는지 아무도 모르게 되기 때문이다.
        */
        throw new TypeError("SkipNav targetId must be a bare id without '#'");
    }
    if (typeof descriptor.label !== "string" || descriptor.label.trim().length === 0) {
        throw new TypeError("SkipNav label must not be empty");
    }
}
export const skipNavRecipe = {
    slots: ["root"],
    minHeight: control.minTouchTarget,
    paddingHorizontal: spacing.md,
    radius: radius.md,
    background: semanticColors.action.brand.background,
    color: semanticColors.action.brand.content,
    /** 포커스를 받으면 화면 좌상단에 겹쳐 나타난다. 레이아웃을 밀지 않는다. */
    offset: spacing.sm,
    states: { focus: focusIndicatorContract },
};
export const skipNavBehavior = {
    controlled: [],
    inputs: ["targetId", "label"],
    stateAxes: { interaction: ["idle", "focusVisible"] },
    web: { roles: ["link"], keyboard: ["Tab", "Enter"], focus: "native" },
    /** No native surface: there is no document flow to bypass. */
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "hidden-until-focused-and-always-visible-once-focused",
        "it-is-the-first-tab-stop-on-the-page-or-it-solves-nothing",
        "activating-it-moves-focus-into-the-target-not-only-the-scroll-position",
        "a-target-id-written-with-a-leading-hash-is-rejected-instead-of-silently-doubled",
    ],
};
//# sourceMappingURL=skip-nav.js.map