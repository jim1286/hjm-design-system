import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { fontFamily, radius, spacing, typography } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * `Text` 하나로는 만들 수 없는 **의미 있는 글자 조각들**이다 — 단축키, 코드, 인용.
 * 도움말·개발자 문서·약관 본문이 반복해서 필요로 하고, 지금까지는 제품이 `<kbd>`에
 * 직접 CSS를 붙여 만들었다.
 *
 * 왜 `Text`의 variant가 아닌가: 이들은 **크기가 아니라 요소**다. `<kbd>`, `<code>`,
 * `<blockquote>`는 각자 의미를 가진 HTML 요소이고 보조기기가 다르게 읽는다. variant로
 * 두면 `<span>`에 코드처럼 보이는 스타일만 입히게 되고, 그 차이가 사라진다.
 */
export type TextFormatKind = "kbd" | "code" | "quote";

export const textFormatRecipe = {
  slots: ["root"] as const,
  kbd: {
    fontFamily: fontFamily.code,
    textVariant: "label" as const,
    paddingHorizontal: spacing.xxs,
    radius: radius.sm,
    background: semanticColors.surface.sunken,
    color: semanticColors.content.body,
    border: semanticColors.border.default,
  },
  code: {
    fontFamily: fontFamily.code,
    textVariant: "body" as const,
    paddingHorizontal: spacing.xxs,
    radius: radius.sm,
    background: semanticColors.surface.sunken,
    color: semanticColors.content.primary,
  },
  quote: {
    textVariant: "body" as const,
    paddingInlineStart: spacing.md,
    borderWidth: 2,
    border: semanticColors.border.default,
    color: semanticColors.content.body,
  },
} as const satisfies {
  slots: readonly ["root"];
  kbd: {
    fontFamily: typeof fontFamily.code;
    textVariant: keyof typeof typography;
    paddingHorizontal: number;
    radius: number;
    background: ColorReference;
    color: ColorReference;
    border: ColorReference;
  };
  code: {
    fontFamily: typeof fontFamily.code;
    textVariant: keyof typeof typography;
    paddingHorizontal: number;
    radius: number;
    background: ColorReference;
    color: ColorReference;
  };
  quote: {
    textVariant: keyof typeof typography;
    paddingInlineStart: number;
    borderWidth: number;
    border: ColorReference;
    color: ColorReference;
  };
};

export const textFormatBehavior = {
  controlled: [],
  inputs: ["kind"],
  configuration: { kind: ["kbd", "code", "quote"] },
  stateAxes: {},
  web: { roles: [], keyboard: [], focus: "none" },
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "each-kind-emits-its-own-html-element-so-assistive-technology-reads-it-as-what-it-is",
    "these-are-elements-not-text-sizes-which-is-why-they-are-not-a-text-variant",
    "a-key-name-is-product-copy-because-the-same-key-is-called-different-things-per-platform",
  ],
} as const satisfies BehaviorContract;
