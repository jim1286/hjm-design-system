import { type DescriptionListDescriptor } from "@hjm/design-contracts/components/description-list";
import { type StatisticDescriptor, type StatisticGroupDescriptor } from "@hjm/design-contracts/components/statistic";
import { type TagTone as ContractTagTone } from "@hjm/design-contracts/components/tag";
import { type CounterBadgeSize, type CounterBadgeTone, type CounterBadgeVariant, type StatisticDensity, type StatisticPresentation } from "@hjm/design-contracts/recipes";
import { type ReactNode } from "react";
import { type ImageProps as NativeImageProps, type ImageSourcePropType, type ImageStyle, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { type SurfacePadding, type SurfaceProps } from "./primitives.js";
export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";
export type BadgeProps = Readonly<{
    label: string;
    tone?: StatusTone;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Badge({ label, tone, accessibilityLabel, style }: BadgeProps): import("react").JSX.Element;
export type TagTone = ContractTagTone;
export type TagProps = Readonly<{
    children?: string;
    /** @deprecated Prefer renderer-neutral `children`. */
    label?: string;
    tone?: TagTone;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Tag({ children, label, tone, accessibilityLabel, style, }: TagProps): import("react").JSX.Element;
export type CardProps = Omit<SurfaceProps, "children" | "padding"> & Readonly<{
    children?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    media?: ReactNode;
    actions?: ReactNode;
    selected?: boolean;
    padding?: SurfacePadding;
}>;
export declare function Card({ children, title, description, media, actions, selected, tone, bordered, padding, style, ...props }: CardProps): import("react").JSX.Element;
export type ListRowProps = Omit<PressableProps, "accessibilityLabel" | "accessibilityRole" | "children" | "disabled" | "style"> & Readonly<{
    title: string;
    description?: string;
    leading?: ReactNode;
    trailing?: ReactNode;
    onPress?: PressableProps["onPress"];
    accessibilityLabel?: string;
    accessibilityHint?: string;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}>;
export declare function ListRow({ title, description, leading, trailing, onPress, accessibilityLabel, accessibilityHint, disabled, style, ...props }: ListRowProps): import("react").JSX.Element;
type AccessibleMedia = Readonly<{
    decorative: true;
    accessibilityLabel?: never;
}> | Readonly<{
    decorative?: false;
    accessibilityLabel: string;
}>;
type AvatarBaseProps = Readonly<{
    source?: ImageSourcePropType;
    name: string;
    initials?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
}>;
export type AvatarProps = AvatarBaseProps & AccessibleMedia;
export declare function Avatar({ source, name, initials, size, decorative, accessibilityLabel, style, imageStyle, }: AvatarProps): import("react").JSX.Element;
export type DividerProps = Readonly<{
    orientation?: "horizontal" | "vertical";
    inset?: number;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Divider({ orientation, inset, style }: DividerProps): import("react").JSX.Element;
export type AccordionItem<Value extends string = string> = Readonly<{
    value: Value;
    title: string;
    description?: string;
    content: ReactNode;
    disabled?: boolean;
    accessibilityHint?: string;
    /** Optional localized name for the expanded content region. */
    contentAccessibilityLabel?: string;
}>;
export type AccordionProps<Value extends string = string> = Readonly<{
    label: string;
    items: readonly AccordionItem<Value>[];
    expandedValues?: readonly Value[];
    defaultExpandedValues?: readonly Value[];
    onExpandedValuesChange?: (values: readonly Value[]) => void;
    multiple?: boolean;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Accordion<Value extends string = string>({ label, items, expandedValues, defaultExpandedValues, onExpandedValuesChange, multiple, style, }: AccordionProps<Value>): import("react").JSX.Element;
export type DescriptionListProps<Id extends string = string> = Readonly<{
    label: string;
    descriptor: DescriptionListDescriptor<Id>;
    availableWidth?: number;
    style?: StyleProp<ViewStyle>;
    itemStyle?: StyleProp<ViewStyle>;
}>;
export declare function DescriptionList<Id extends string = string>({ label, descriptor, availableWidth, style, itemStyle, }: DescriptionListProps<Id>): import("react").JSX.Element;
type ImageBaseProps = Omit<NativeImageProps, "accessibilityLabel" | "accessibilityRole" | "accessible" | "onError" | "source" | "style"> & Readonly<{
    source: ImageSourcePropType;
    fallback?: ReactNode;
    onError?: NativeImageProps["onError"];
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}>;
export type ImageProps = ImageBaseProps & AccessibleMedia;
/** Native image with an explicit decorative/label contract and error fallback. */
export declare function Image({ source, fallback, decorative, accessibilityLabel, onError, style, containerStyle, ...props }: ImageProps): import("react").JSX.Element;
export type CounterBadgeProps = Readonly<{
    count: number;
    accessibilityLabel: string;
    max?: number;
    tone?: CounterBadgeTone;
    size?: CounterBadgeSize;
    variant?: CounterBadgeVariant;
    style?: StyleProp<ViewStyle>;
}>;
export declare function CounterBadge({ count, accessibilityLabel, max, tone, size, variant, style, }: CounterBadgeProps): import("react").JSX.Element | null;
export type ListProps = Readonly<{
    label: string;
    children: ReactNode;
    separator?: "none" | "full" | "indented";
    style?: StyleProp<ViewStyle>;
}>;
/** Semantic list container that owns separator rhythm around composed rows. */
export declare function List({ label, children, separator, style, }: ListProps): import("react").JSX.Element;
export type StatisticProps<Id extends string = string> = Readonly<{
    descriptor: StatisticDescriptor<Id>;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    style?: StyleProp<ViewStyle>;
}>;
export declare function Statistic<Id extends string = string>({ descriptor, density, presentation, style, }: StatisticProps<Id>): import("react").JSX.Element;
export type StatisticGroupProps<Id extends string = string> = Readonly<{
    label: string;
    descriptor: StatisticGroupDescriptor<Id>;
    availableWidth?: number;
    density?: StatisticDensity;
    presentation?: StatisticPresentation;
    style?: StyleProp<ViewStyle>;
}>;
export declare function StatisticGroup<Id extends string = string>({ label, descriptor, availableWidth, density, presentation, style, }: StatisticGroupProps<Id>): import("react").JSX.Element;
export {};
//# sourceMappingURL=data-display.d.ts.map