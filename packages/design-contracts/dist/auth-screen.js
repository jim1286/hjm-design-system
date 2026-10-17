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
    slots: ["root", "hero", "mark", "eyebrow", "title", "description", "main", "footer", "notice", "links"],
    defaults: authScreenDefaults,
    maxWidth: 416,
    /** 마크는 아이콘(48)보다 크고 일러스트(120+)보다 작다 — 제품을 알아볼 최소 크기다. */
    markSize: 72,
    markRadius: radius.lg,
    /**
     * 히어로 제목은 LS의 태그라인(24)이다. 2026-10-17 사용자 피드백("굵기랑 크기 줄여"): 예제가
     * 화면 첫 제목용 `Top large`(display 32/40)를 히어로에 넣어 402 폭에서 두 줄로 화면을 눌렀다.
     * 로그인 슬로건은 화면 제목이 아니라 제공자 버튼을 소개하는 한 줄이라 display 단계를 쓰지
     * 않고, 굵기는 제목 단계의 medium(500)을 그대로 따른다. compact는 한 단계 낮춘다(densities).
     */
    title: typography.heading,
    description: typography.body,
    hero: {
        eyebrow: { textVariant: "label", tone: "brand", gapBelow: spacing.xxs },
        title: { tone: "primary" },
        /** LS 설명은 보조 글자색이다 — 본문색이면 태그라인과 같은 무게로 읽힌다. */
        description: { textVariant: "body", tone: "muted", gapAbove: spacing.xs },
    },
    /** 정책 링크는 글자 높이만큼만 누를 수 있으면 44pt 기준에 못 미친다. */
    footerMinTouchTarget: control.minTouchTarget,
    footerText: typography.caption,
    /**
     * 동의 고지와 정책 링크(LS §3: 고지 `caption` 흐린 색, 링크와 gap `xxs`, 링크 `caption` 브랜드색·밑줄,
     * "개인정보 처리방침 · 이용약관"). 2026-10-17 사용자 피드백("간격 줄여"): 예제가 ghost Button 두 개를
     * Stack gap 16으로 놓아 버튼 안쪽 여백 12+12가 더해져 글자 사이가 40~42로 벌어졌다. 보이는 간격은
     * `linkGap` + 구분점 + `linkGap` 하나로 정하고, 44 터치 높이는 보이지 않는 히트 영역(Web 높이·가상
     * 요소, Native minHeight·hitSlop)으로 채운다 — 보이는 여백으로 터치 영역을 만들면 간격이 다시 커진다.
     */
    footer: {
        notice: { textVariant: "caption", tone: "muted" },
        noticeGap: spacing.xxs,
        link: { textVariant: "caption", tone: "brand", underline: true },
        linkGap: spacing.xs,
        separator: "·",
    },
    /** 제공자 버튼 높이는 Provider 계약이 소유한다 — 여기서 다시 정하지 않는다. */
    providerMinHeight: authProviderButtonRecipe.minHeight,
    // 2026-10-01: the action card stays mounted during login so its dimensions and background survive the loader.
    mainCard: { padding: spacing.md, radius: radius.lg },
    densities: {
        regular: {
            heroGap: spacing.md,
            mainGap: spacing.xl,
            footerGap: spacing.xl,
            paddingInline: layout.pagePadding.regular,
            paddingBlock: spacing.xxxl,
            titleVariant: "heading",
        },
        compact: {
            heroGap: spacing.xs,
            mainGap: spacing.md,
            footerGap: spacing.md,
            paddingInline: layout.pagePadding.compact,
            paddingBlock: spacing.lg,
            // 세로가 좁은 화면에서는 제목도 한 단계 낮춰 제공자 버튼을 첫 화면에 남긴다.
            titleVariant: "titleLarge",
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
function assertNonEmpty(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`AuthScreen ${field} must not be empty`);
    }
}
export function validateAuthScreenHeroDescriptor(descriptor) {
    if (descriptor === null || typeof descriptor !== "object") {
        throw new TypeError("AuthScreen hero must be an object");
    }
    assertNonEmpty(descriptor.title, "hero title");
    if (descriptor.eyebrow !== undefined)
        assertNonEmpty(descriptor.eyebrow, "hero eyebrow");
    if (descriptor.description !== undefined)
        assertNonEmpty(descriptor.description, "hero description");
    if (descriptor.headingLevel !== undefined && ![1, 2, 3].includes(descriptor.headingLevel)) {
        throw new TypeError(`Unsupported AuthScreen hero headingLevel: ${String(descriptor.headingLevel)}`);
    }
}
/** LS-04: 약관·개인정보처리방침 링크는 로그인 전에 같은 화면에 있어야 하므로 빈 목록을 받지 않는다. */
export function validateAuthScreenPolicyLinks(links) {
    if (!Array.isArray(links) || links.length === 0) {
        throw new TypeError("AuthScreen footer needs at least one policy link");
    }
    for (const link of links)
        assertNonEmpty(link?.label, "policy link label");
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
        titleVariant: scale.titleVariant,
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
        "the-hero-title-uses-the-recipe-title-step-not-a-display-heading",
        "policy-links-are-separated-by-one-recipe-gap-and-a-dot-while-the-touch-area-stays-invisible",
    ],
};
//# sourceMappingURL=auth-screen.js.map