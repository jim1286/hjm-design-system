import { type StatisticProps } from './data-display.js';
export type AnimatedStatisticProps = Omit<StatisticProps, 'descriptor'> & Readonly<{
    descriptor: Omit<StatisticProps['descriptor'], 'value'>;
    value: number;
    locale: string;
    format?: Intl.NumberFormatOptions;
    animated?: boolean;
}>;
/** Native presents a short whole-statistic transition; Intl and Statistic own the final spoken value. */
export declare function AnimatedStatistic({ descriptor, value, locale, format, animated, ...props }: AnimatedStatisticProps): import("react").JSX.Element;
//# sourceMappingURL=statistic-motion.d.ts.map