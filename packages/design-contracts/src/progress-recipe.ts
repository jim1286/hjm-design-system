import type { ColorReference } from "./color-references.js";
import { radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

export const progressRecipe = {
  slots: ["root", "track", "indicator", "label", "value"] as const,
  // Shared max default (Web was 100, Native 1): see docs/progress.md.
  defaults: { size: "medium", tone: "brand", shape: "linear", max: 100, showValue: true },
  sizes: { small: 4, medium: 8, large: 12 },
  /*
    같은 값을 원으로 그리는 변형이다. 새 컴포넌트가 아닌 이유는 의미가 완전히 같기
    때문이다 — min/max/now, 값 없는 진행, 발표 문구, tone이 전부 선형과 공유된다.
    따로 만들면 "어느 쪽이 접근성 계약을 갖는가"가 둘로 갈린다.

    지름은 linear의 두께와 다른 축이다: 선형은 굵기만 정하면 되지만 원은 지름과
    획 두께를 함께 정해야 같은 tone에서 같은 무게로 읽힌다. Diairy가 ProgressRing을
    직접 만든 자리이고, 그때 필요했던 값이 이 둘이다.
  */
  segmented: { gap: spacing.xxs },
  circular: {
    sizes: { small: 24, medium: 40, large: 64 },
    strokeWidth: { small: 3, medium: 4, large: 6 },
  },
  tones: {
    brand: semanticColors.content.brand,
    success: semanticColors.feedback.success.foreground,
    warning: semanticColors.feedback.warning.foreground,
    danger: semanticColors.content.danger,
  },
  track: semanticColors.surface.sunken,
  radius: "full",
} as const satisfies {
  radius: keyof typeof radius;
  slots: readonly string[];
  defaults: {
    size: "small" | "medium" | "large";
    tone: "brand" | "success" | "warning" | "danger";
    shape: "linear" | "circular";
    max: number;
    showValue: boolean;
  };
  sizes: Record<"small" | "medium" | "large", number>;
  segmented: { gap: number };
  circular: {
    sizes: Record<"small" | "medium" | "large", number>;
    strokeWidth: Record<"small" | "medium" | "large", number>;
  };
  tones: Record<"brand" | "success" | "warning" | "danger", ColorReference>;
  track: ColorReference;
};

export type ProgressSize = keyof typeof progressRecipe.sizes;
export type ProgressTone = keyof typeof progressRecipe.tones;
export type ProgressShape = "linear" | "circular";

/** Same determinate quantity, painted in equal units (Diairy activity days); never a step-navigation engine. */
export function resolveProgressSegments(value: number | undefined, max: number, count: number | undefined, shape: ProgressShape): readonly number[] | undefined {
  if (count === undefined) return undefined;
  if (!Number.isInteger(count) || count < 2) throw new RangeError("Progress segments must be an integer of at least two");
  if (shape !== "linear" || value === undefined) throw new TypeError("Progress segments require determinate linear progress");
  if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value) || value < 0 || value > max) throw new RangeError("Progress value must be between zero and a positive finite max");
  return Array.from({ length: count }, (_, index) => Math.max(0, Math.min(1, value / max * count - index)));
}
