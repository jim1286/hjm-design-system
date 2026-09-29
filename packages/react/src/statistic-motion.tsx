import NumberFlow from "@number-flow/react";
import { Statistic, type StatisticProps } from "./advanced-display.js";
import { useHjmTheme } from "./provider.js";

export type AnimatedStatisticProps = Omit<StatisticProps, "descriptor" | "renderValue"> & {
  descriptor: Omit<StatisticProps["descriptor"], "value">;
  value: number;
  /** Explicit locale keeps server/client formatting deterministic. */
  locale: string;
  format?: Intl.NumberFormatOptions;
  animated?: boolean;
};

/** NumberFlow stays outside the base Statistic graph and its accessible text. */
export function AnimatedStatistic({ descriptor, value, locale, format, animated = true, ...props }: AnimatedStatisticProps) {
  const theme = useHjmTheme();
  if (!Number.isFinite(value)) throw new TypeError("AnimatedStatistic value must be finite");
  const formatter = new Intl.NumberFormat(locale, format);
  const text = formatter.format(value);
  // Upstream cannot animate non-Latin digits, RTL or exponent notation reliably.
  // Preserve Intl output instead of transliterating the user's number format.
  const canAnimate = animated && !theme.environment.reducedMotion &&
    theme.environment.direction !== "rtl" && formatter.resolvedOptions().numberingSystem === "latn" &&
    !/^(ar|fa|he|ur)(-|$)/i.test(locale) &&
    !["scientific", "engineering"].includes(format?.notation ?? "standard");
  const animatedFormat = { ...format, notation: format?.notation === "compact" ? "compact" as const : "standard" as const };
  return <Statistic {...props} descriptor={{ ...descriptor, value: text }}
    renderValue={() => canAnimate
      ? <NumberFlow value={value} locales={locale} format={animatedFormat} respectMotionPreference />
      : text} />;
}
