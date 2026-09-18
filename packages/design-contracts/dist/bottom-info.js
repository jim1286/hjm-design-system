import { spacing, typography } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export function validateBottomInfoDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("BottomInfo descriptor must be an object");
    }
    if (!Array.isArray(descriptor.items) || descriptor.items.length === 0) {
        throw new RangeError("BottomInfo must contain at least one item");
    }
    for (const item of descriptor.items) {
        if (typeof item !== "string" || item.trim().length === 0) {
            throw new TypeError("BottomInfo items must not be empty");
        }
    }
    if (descriptor.tone !== undefined &&
        descriptor.tone !== "muted" &&
        descriptor.tone !== "emphasis") {
        throw new TypeError(`Unsupported BottomInfo tone: ${String(descriptor.tone)}`);
    }
}
export const bottomInfoRecipe = {
    slots: ["root", "item"],
    defaults: { tone: "muted" },
    tones: {
        muted: semanticColors.content.secondary,
        /** 법적 고지처럼 놓치면 안 되는 문장. 여전히 상태가 아니라 조건이다. */
        emphasis: semanticColors.content.body,
    },
    textVariant: "caption",
    gap: spacing.xxs,
    paddingTop: spacing.sm,
    /** 여러 줄일 때만 목록 표식을 쓴다 — 한 줄에 점을 찍으면 오히려 시끄럽다. */
    listMarkerFrom: 2,
};
export const bottomInfoBehavior = {
    controlled: [],
    inputs: ["items", "tone"],
    stateAxes: {},
    web: { roles: ["list", "listitem"], keyboard: [], focus: "none" },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "it-states-a-standing-condition-not-a-state-change-so-it-has-no-tone-of-alarm",
        "a-single-line-renders-without-a-list-marker-and-several-lines-render-as-a-list",
        "the-text-wraps-and-is-never-truncated-because-it-is-usually-a-legal-notice",
        "links-inside-the-copy-belong-to-the-product-not-to-this-contract",
    ],
};
//# sourceMappingURL=bottom-info.js.map