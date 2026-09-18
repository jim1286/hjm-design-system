import { heading, spacing, typography } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";
export const topDefaults = {
    size: "large",
    headingLevel: 1,
};
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`Top ${field} must not be empty`);
    }
}
export function validateTopDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("Top descriptor must be an object");
    }
    assertNonEmpty(descriptor.title, "title");
    if (descriptor.eyebrow !== undefined)
        assertNonEmpty(descriptor.eyebrow, "eyebrow");
    if (descriptor.description !== undefined) {
        assertNonEmpty(descriptor.description, "description");
    }
    if (descriptor.size !== undefined && descriptor.size !== "medium" && descriptor.size !== "large") {
        throw new TypeError(`Unsupported Top size: ${String(descriptor.size)}`);
    }
    if (descriptor.headingLevel !== undefined &&
        ![1, 2, 3].includes(descriptor.headingLevel)) {
        throw new TypeError(`Unsupported Top headingLevel: ${String(descriptor.headingLevel)}`);
    }
}
/**
 * `large`는 화면의 첫 제목, `medium`은 시트·모달 안의 첫 제목이다. 두 단계뿐인 이유는
 * 세 번째가 필요해지는 자리가 곧 `Section`이기 때문이다 — 크기를 더 늘리는 대신 다른
 * 컴포넌트를 쓰라는 신호로 둔다.
 */
export const topRecipe = {
    slots: ["root", "eyebrow", "title", "description", "trailing"],
    defaults: { size: topDefaults.size },
    sizes: {
        medium: { title: typography.titleLarge, paddingTop: spacing.md, paddingBottom: spacing.sm },
        large: { title: heading.level2, paddingTop: spacing.xl, paddingBottom: spacing.md },
    },
    eyebrow: {
        color: semanticColors.content.brand,
        textVariant: "label",
        marginBottom: spacing.xxs,
    },
    title: { color: semanticColors.content.primary },
    description: {
        color: semanticColors.content.body,
        textVariant: "body",
        marginTop: spacing.xs,
    },
    /** 제목 줄 오른쪽 보조 행동. 본문이므로 TopBar처럼 아이콘 전용을 강제하지 않는다. */
    trailing: { gap: spacing.xs },
    gap: spacing.xs,
};
export const topBehavior = {
    /** 상태 축이 없다 — 화면이 제목을 바꾸면 그냥 다른 문자열을 넘긴다. */
    controlled: [],
    inputs: ["title", "eyebrow", "description", "size", "headingLevel"],
    stateAxes: {},
    web: { roles: ["heading"], keyboard: [], focus: "none" },
    native: { roles: ["header"], states: [], actions: [] },
    scenarios: [
        "the-title-is-a-real-heading-element-at-the-declared-level-not-styled-text",
        "top-is-body-content-that-scrolls-away-while-topbar-is-fixed-chrome",
        "description-wraps-instead-of-truncating-so-large-text-never-hides-the-question",
        "a-trailing-action-shares-the-title-row-and-drops-below-it-when-space-runs-out",
        "eyebrow-never-carries-information-the-title-does-not-repeat-in-some-form",
    ],
};
//# sourceMappingURL=top.js.map