import { authProviderButtonRecipe } from "./provider-button.js";
import { control, layout, radius, spacing, typography } from "./foundations.js";
export const authScreenDefaults = {
    density: "regular",
    hasFooter: true,
};
/**
 * 최대 폭 26rem(416)은 `Container`의 reading(720)보다 좁다. 제공자 버튼이 노트북 폭만큼
 * 길어지면 누를 곳이 아니라 띠로 보이기 때문이고, 이 화면의 내용은 버튼 한 줄기뿐이라
 * 읽기 폭을 쓸 이유가 없다.
 */
export const authScreenRecipe = {
    slots: ["root", "hero", "mark", "title", "description", "main", "footer"],
    defaults: authScreenDefaults,
    maxWidth: 416,
    /** 마크는 아이콘(48)보다 크고 일러스트(120+)보다 작다 — 제품을 알아볼 최소 크기다. */
    markSize: 72,
    markRadius: radius.lg,
    title: typography.titleLarge,
    description: typography.body,
    /** 정책 링크는 글자 높이만큼만 누를 수 있으면 44pt 기준에 못 미친다. */
    footerMinTouchTarget: control.minTouchTarget,
    footerText: typography.caption,
    /** 제공자 버튼 높이는 Provider 계약이 소유한다 — 여기서 다시 정하지 않는다. */
    providerMinHeight: authProviderButtonRecipe.minHeight,
    densities: {
        regular: {
            heroGap: spacing.md,
            mainGap: spacing.xl,
            footerGap: spacing.xl,
            paddingInline: layout.pagePadding.regular,
            paddingBlock: spacing.xxxl,
        },
        compact: {
            heroGap: spacing.xs,
            mainGap: spacing.md,
            footerGap: spacing.md,
            paddingInline: layout.pagePadding.compact,
            paddingBlock: spacing.lg,
        },
    },
};
const densities = new Set(["compact", "regular"]);
export function validateAuthScreenDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("AuthScreen descriptor must be an object");
    }
    if (descriptor.density !== undefined && !densities.has(descriptor.density)) {
        throw new TypeError(`Unsupported AuthScreen density: ${String(descriptor.density)}`);
    }
    if (descriptor.hasFooter !== undefined && typeof descriptor.hasFooter !== "boolean") {
        throw new TypeError("AuthScreen hasFooter must be a boolean");
    }
}
export function resolveAuthScreenDescriptor(descriptor = {}) {
    validateAuthScreenDescriptor(descriptor);
    const density = descriptor.density ?? authScreenDefaults.density;
    const scale = authScreenRecipe.densities[density];
    return {
        density,
        hasFooter: descriptor.hasFooter ?? authScreenDefaults.hasFooter,
        heroGap: scale.heroGap,
        mainGap: scale.mainGap,
        footerGap: scale.footerGap,
        paddingInline: scale.paddingInline,
        paddingBlock: scale.paddingBlock,
        maxWidth: authScreenRecipe.maxWidth,
    };
}
export const authScreenBehavior = {
    controlled: [],
    inputs: ["density", "hasFooter"],
    events: [],
    stateAxes: {},
    web: { roles: ["main"], keyboard: [], focus: "none" },
    native: { roles: [], states: [], actions: [] },
    scenarios: [
        "the-hero-and-the-main-action-stay-one-vertically-centred-block",
        "the-footer-sits-at-the-bottom-and-never-overlaps-the-main-action",
        "content-taller-than-the-viewport-scrolls-instead-of-pushing-the-footer-off-screen",
        "the-product-owns-every-string-and-the-mark-asset-while-the-layout-stays-here",
        "provider-button-height-comes-from-the-provider-contract-not-from-this-one",
        "compact-density-shrinks-gaps-without-changing-the-two-region-structure",
        "policy-links-in-the-footer-keep-the-minimum-touch-target",
    ],
};
//# sourceMappingURL=auth-screen.js.map