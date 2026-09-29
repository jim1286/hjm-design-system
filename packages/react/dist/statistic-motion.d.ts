import { type StatisticProps } from "./advanced-display.js";
export type AnimatedStatisticProps = Omit<StatisticProps, "descriptor" | "renderValue"> & {
    descriptor: Omit<StatisticProps["descriptor"], "value">;
    value: number;
    /** Explicit locale keeps server/client formatting deterministic. */
    locale: string;
    format?: Intl.NumberFormatOptions;
    animated?: boolean;
};
/** NumberFlow stays outside the base Statistic graph and its accessible text. */
export declare function AnimatedStatistic({ descriptor, value, locale, format, animated, ...props }: AnimatedStatisticProps): import("react").JSX.Element;
//# sourceMappingURL=statistic-motion.d.ts.map