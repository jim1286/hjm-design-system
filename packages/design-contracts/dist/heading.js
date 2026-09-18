import { heading, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
const levelNumbers = {
    level1: 1,
    level2: 2,
    level3: 3,
    level4: 4,
    level5: 5,
};
export function validateHeadingDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("Heading descriptor must be an object");
    }
    if (!Object.prototype.hasOwnProperty.call(heading, descriptor.level)) {
        throw new TypeError(`Unsupported Heading level: ${String(descriptor.level)}`);
    }
    if (descriptor.semanticLevel !== undefined &&
        ![1, 2, 3, 4, 5, 6].includes(descriptor.semanticLevel)) {
        throw new TypeError(`Unsupported Heading semanticLevel: ${String(descriptor.semanticLevel)}`);
    }
}
/** 시각적 단계에서 문서 단계를 뽑되, 명시된 값이 있으면 그것이 이긴다. */
export function resolveHeadingSemanticLevel(descriptor) {
    validateHeadingDescriptor(descriptor);
    return descriptor.semanticLevel ?? levelNumbers[descriptor.level];
}
export const headingRecipe = {
    slots: ["root"],
    defaults: { level: "level3" },
    levels: heading,
    color: semanticColors.content.primary,
    /** 제목 아래 간격은 제목이 아니라 그것을 담는 블록이 정한다. */
    marginBottom: spacing.xs,
};
export const headingBehavior = {
    controlled: [],
    inputs: ["level", "semanticLevel"],
    stateAxes: {},
    web: { roles: ["heading"], keyboard: [], focus: "none" },
    native: { roles: ["header"], states: [], actions: [] },
    scenarios: [
        "visual-size-and-document-level-are-separate-axes-that-may-disagree-on-purpose",
        "the-element-is-a-real-heading-so-the-rotor-and-skip-links-find-it",
        "no-new-type-sizes-are-introduced-the-existing-heading-scale-is-what-is-exposed",
        "heading-owns-no-surrounding-layout-the-block-that-contains-it-does",
    ],
};
//# sourceMappingURL=heading.js.map