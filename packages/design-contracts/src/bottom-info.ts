import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { spacing, typography } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * 주 행동 **아래** 붙는 작은 안내 — "가입하면 약관에 동의하는 것으로 봅니다",
 * "수수료는 결제 시점에 확정됩니다" 같은 문장. 토스 TDS의 BottomInfo와 같은 자리다.
 *
 * `Notice`와 다르다. Notice는 **지금 생긴 상태**를 알린다(오류·성공·경고). BottomInfo는
 * 화면에 늘 있는 **조건**이라 tone도 아이콘도 없고 사라지지도 않는다. Notice로 쓰면
 * 사용자가 매번 "무슨 문제가 생겼나" 하고 읽게 된다.
 *
 * 문단 하나 이상을 담을 수 있고, 각 문단 안의 링크(약관·자세히 보기)는 제품이 넣는다.
 */
export type BottomInfoTone = "muted" | "emphasis";

export type BottomInfoDescriptor = Readonly<{
  /** 목록으로 읽히는 여러 줄. 한 줄이면 배열 하나. */
  items: readonly string[];
  tone?: BottomInfoTone;
}>;

export function validateBottomInfoDescriptor(descriptor: BottomInfoDescriptor): void {
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
  if (
    descriptor.tone !== undefined &&
    descriptor.tone !== "muted" &&
    descriptor.tone !== "emphasis"
  ) {
    throw new TypeError(`Unsupported BottomInfo tone: ${String(descriptor.tone)}`);
  }
}

export const bottomInfoRecipe = {
  slots: ["root", "item"] as const,
  defaults: { tone: "muted" as BottomInfoTone },
  tones: {
    muted: semanticColors.content.secondary,
    /** 법적 고지처럼 놓치면 안 되는 문장. 여전히 상태가 아니라 조건이다. */
    emphasis: semanticColors.content.body,
  },
  textVariant: "caption" as const,
  gap: spacing.xxs,
  paddingTop: spacing.sm,
  /** 여러 줄일 때만 목록 표식을 쓴다 — 한 줄에 점을 찍으면 오히려 시끄럽다. */
  listMarkerFrom: 2,
} as const satisfies {
  slots: readonly ["root", "item"];
  defaults: { tone: BottomInfoTone };
  tones: Record<BottomInfoTone, ColorReference>;
  textVariant: keyof typeof typography;
  gap: number;
  paddingTop: number;
  listMarkerFrom: number;
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
} as const satisfies BehaviorContract;
