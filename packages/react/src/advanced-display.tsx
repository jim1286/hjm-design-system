"use client";
import { IdentityAction } from "./internal/identity-action.js";

import { resolveAvatarInitials, type AvatarFallbackContext } from "@hjmds/design-contracts/avatar-fallback";
import { TableSortButton } from "./table-sort-button.js";
import { getNextDataTableSortState } from "@hjmds/design-contracts/components/data-table";
import {
  resolveDescriptionListColumnCount,
  resolveDescriptionListDescriptor,
  type DescriptionItemDescriptor,
  type DescriptionListColumns,
} from "@hjmds/design-contracts/components/description-list";
import {
  getTimelineSelectionTarget,
  resolveTimelineDescriptor,
  timelineDefaults,
  validateTimelineSelection,
  type ComposeTimelineAccessibleName,
  type TimelineItemDescriptor,
} from "@hjmds/design-contracts/components/timeline";
import {
  resolveStatisticDescriptor,
  validateStatisticGroup,
  type ResolvedStatisticDescriptor,
  type StatisticDescriptor,
  type StatisticGroupDescriptor,
} from "@hjmds/design-contracts/components/statistic";
import {
  accordionRecipe,
  avatarRecipe,
  resolveAvatarSize,
  validateAvatarPresentation,
  dividerRecipe,
  listRecipe,
  validateDividerLineStyle,
  type DividerLineStyle,
  statisticRecipe,
  type AccordionDensity,
  type AvatarFrame,
  type AvatarShape,
  type AvatarSize,
  type CornerAccessoryPlacement,
  type StatisticDensity,
  type StatisticPresentation,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  createElement,
  forwardRef,
  Fragment,
  isValidElement,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  type TableHTMLAttributes,
} from "react";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { assignRef, classNames, useControllableState, useElementWidth } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type AccordionItem = Readonly<{
  id: string;
  title: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
  /** Include domain values when a decorative indicator carries more than expansion. */
  accessibilityLabel?: string;
}>;

export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> &
  Readonly<{
    items: readonly AccordionItem[];
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    allowsMultipleExpanded?: boolean;
    density?: AccordionDensity;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    /** Decorative replacement; interaction and expanded state remain owned by Accordion. */
    renderIndicator?: (props: Readonly<{ value: string; expanded: boolean; disabled: boolean }>) => ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function validateAccordionItems(items: readonly AccordionItem[]): void {
  if (items.length === 0) throw new TypeError("Accordion requires at least one item");
  const ids = new Set<string>();
  for (const item of items) {
    if (item.id.trim().length === 0) throw new TypeError("Accordion item id must not be empty");
    if (ids.has(item.id)) throw new TypeError(`Duplicate Accordion item id: ${item.id}`);
    ids.add(item.id);
  }
}

function accordionFocusTarget(
  items: readonly AccordionItem[],
  currentIndex: number,
  key: string,
): number | undefined {
  if (key === "Home") return items.findIndex((item) => !item.disabled);
  if (key === "End") {
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (!items[index]?.disabled) return index;
    }
    return -1;
  }
  const direction = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
  if (direction === 0) return undefined;
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (currentIndex + direction * offset + items.length) % items.length;
    if (!items[index]?.disabled) return index;
  }
  return currentIndex;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      items,
      value: valueProp,
      defaultValue = [],
      onValueChange,
      allowsMultipleExpanded = accordionRecipe.defaults.allowsMultipleExpanded,
      density = accordionRecipe.defaults.density,
      headingLevel = 3,
      renderIndicator,
      className,
      layoutStyle,
      ...props
    },
    ref,
  ) {
    validateAccordionItems(items);
    const [storedValue, setValue] = useControllableState<readonly string[]>({
      ...(valueProp === undefined ? {} : { value: valueProp }),
      defaultValue,
      ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const validIds = new Set(items.map((item) => item.id));
    const committed = useRef(false);
    const value = valueProp === undefined && committed.current ? storedValue.filter(id => validIds.has(id)) : storedValue;
    useLayoutEffect(() => {
      committed.current = true;
      // Removed uncontrolled disclosures retire their expansion; reinsertion starts closed.
      if (value.length !== storedValue.length) setValue(value);
    }, [value, storedValue, setValue]);
    const valueIds = new Set<string>();
    for (const id of value) {
      if (!validIds.has(id)) throw new RangeError(`Unknown Accordion value: ${id}`);
      if (valueIds.has(id)) throw new TypeError(`Duplicate Accordion value: ${id}`);
      valueIds.add(id);
    }
    if (!allowsMultipleExpanded && value.length > 1) {
      throw new RangeError("Accordion only allows one expanded item");
    }
    const baseId = useId().replaceAll(":", "");
    const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
    const host = useRef<HTMLDivElement | null>(null);
    const focused = useRef<{ id: string; index: number; node: HTMLElement } | null>(null);
    useLayoutEffect(() => {
      const previous = focused.current;
      if (!previous) return;
      const index = items.findIndex(item => item.id === previous.id);
      const removed = index < 0;
      const disabledTrigger = index >= 0 && items[index]!.disabled && triggerRefs.current.get(previous.id) === previous.node;
      if (!(removed || disabledTrigger) || (document.activeElement !== previous.node && document.activeElement !== document.body)) return;
      // Restore only the removed/disabled target, never steal a user's external focus.
      const origin = removed ? Math.min(previous.index, items.length - 1) : index + 1;
      const target = Array.from({ length: items.length }, (_, offset) => items[(origin + offset) % items.length]!).find(item => !item.disabled);
      focused.current = null;
      (target ? triggerRefs.current.get(target.id) : host.current)?.focus();
    }, [items]);
    const toggle = (id: string) => {
      const expanded = value.includes(id);
      setValue(
        expanded
          ? value.filter((candidate) => candidate !== id)
          : allowsMultipleExpanded
            ? [...value, id]
            : [id],
      );
    };

    return (
      <div
        {...props}
        style={{ ...props.style, ...layoutStyle }}
        ref={node => { host.current = node; assignRef(ref, node); }}
        tabIndex={-1}
        className={classNames("hjm-accordion", className)}
        data-density={density}
        data-multiple={allowsMultipleExpanded || undefined}
      >
        {items.map((item, index) => {
          const expanded = value.includes(item.id);
          const triggerId = `${baseId}-accordion-trigger-${index}`;
          const panelId = `${baseId}-accordion-panel-${index}`;
          const trigger = (
            <button
              ref={(node) => {
                if (node) triggerRefs.current.set(item.id, node);
                else triggerRefs.current.delete(item.id);
              }}
              id={triggerId}
              type="button"
              className="hjm-accordion__trigger"
              aria-expanded={expanded}
              aria-label={item.accessibilityLabel}
              aria-controls={panelId}
              disabled={item.disabled}
              onClick={() => toggle(item.id)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                const target = accordionFocusTarget(items, index, event.key);
                if (target === undefined || target < 0) return;
                event.preventDefault();
                triggerRefs.current.get(items[target]!.id)?.focus();
              }}
            >
              <span className="hjm-accordion__title">{item.title}</span>
              <span className="hjm-accordion__indicator" aria-hidden="true">
                {renderIndicator ? renderIndicator({ value: item.id, expanded, disabled: item.disabled === true }) : expanded ? "−" : "+"}
              </span>
            </button>
          );
          return (
            <div
              key={item.id}
              onFocusCapture={event => { if (event.target instanceof HTMLElement) focused.current = { id: item.id, index, node: event.target }; }}
              className="hjm-accordion__item"
              data-state={item.disabled ? "disabled" : expanded ? "expanded" : "collapsed"}
            >
              {createElement(`h${headingLevel}`, { className: "hjm-accordion__header" }, trigger)}
              <div
                id={panelId}
                role="region"
                className="hjm-accordion__panel"
                aria-labelledby={triggerId}
                hidden={!expanded}
              >
                {item.panel}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);


/** Props handed to a product image host (`next/image`, a cache-aware loader) that replaces Avatar's `<img>`. */
export type AvatarImageRenderProps = Readonly<{
  src: string;
  /** `""` for a decorative avatar or `alt=""`; otherwise the avatar's accessible name. */
  alt: string;
  /** Diameter in px from the size step. */
  size: number;
  /** Avatar's image class (fill + cover); keep it so the frame's clipping and fit still apply. */
  className: string;
  /** Report a failure for this `src` generation; callbacks from a replaced `src` are ignored. */
  onError: () => void;
}>;

/**
 * Accessibility identity. A meaningful avatar is named by `name` (or `alt`); a decorative one — next to a visible
 * author name, or ornament without a person — is hidden from assistive tech and may omit `name` (2026-10-23:
 * Burntok's decorative avatars had no name to pass).
 */
type AvatarIdentity =
  | Readonly<{ decorative?: false; name: string; alt?: string }>
  | Readonly<{ decorative: true; name?: string; alt?: never }>;

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  AvatarIdentity &
  Readonly<{
    /** Profile navigation; products provide the member route and localized name. */
    action?: Readonly<{ label: string; onPress(): void; disabled?: boolean }>;
    src?: string;
    /** contain preserves the entire picture inside the shaped frame, including its corners. */
    imageFit?: "cover" | "contain";
    fallback?: ReactNode;
    renderFallback?: (context: AvatarFallbackContext) => ReactNode;
    /** Product image host in place of the built-in `<img>`. Exclusive with `imageProps`. */
    renderImage?: (props: AvatarImageRenderProps) => ReactNode;
    size?: AvatarSize;
    shape?: AvatarShape;
    /** Border/background treatment from avatarRecipe.frames; `none` when product artwork fills the frame. */
    frame?: AvatarFrame;
    /** A small mark (team badge, status dot) on a corner of the avatar's box. It is not clipped by the frame. */
    accessory?: ReactNode;
    accessoryPlacement?: CornerAccessoryPlacement;
    imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    action,
    src,
    imageFit = "cover",
    alt: altProp,
    decorative = false,
    fallback,
    renderFallback,
    renderImage,
    size = avatarRecipe.defaults.size,
    shape = avatarRecipe.defaults.shape,
    frame = avatarRecipe.defaults.frame,
    accessory,
    accessoryPlacement = avatarRecipe.defaults.accessoryPlacement,
    imageProps,
    className,
    layoutStyle,
    ...props
  },
  ref,
) {
  if (!decorative && (name === undefined || name.trim().length === 0)) throw new TypeError("Avatar name must not be empty");
  if (renderImage && imageProps) throw new TypeError("Avatar renderImage and imageProps are exclusive; pass image attributes to the host");
  validateAvatarPresentation({ shape, frame, accessoryPlacement });
  const diameter = resolveAvatarSize(size);
  const alt = decorative ? "" : altProp ?? name ?? "";
  const generation = useMemo(() => ({}), [src]);
  const active = useRef<object | null>(generation);
  useLayoutEffect(() => { active.current = generation; return () => { active.current = null; }; }, [generation]);
  const [failed, setFailed] = useState<object | null>(null);
  const imageAvailable = Boolean(src) && failed !== generation;
  const { onError, className: imageClassName, ...restImageProps } = imageProps ?? {};
  const fail = () => { if (active.current === generation) setFailed(generation); };
  const initials = name !== undefined && name.trim().length > 0 ? resolveAvatarInitials(name) : null;
  const avatarNode = (
    <span
      {...props}
      aria-hidden={decorative || props["aria-hidden"]}
      style={{ ...props.style, ...(action ? {} : layoutStyle), "--hjm-avatar-size": `${diameter}px`,
        "--hjm-avatar-contained-ratio": avatarRecipe.containedImageRatio,
        // Absolute children are placed from the padding edge; subtract the frame border so the offset is from the box.
        "--hjm-avatar-accessory-inset": `${0 - avatarRecipe.accessory.offset - avatarRecipe.frames[frame].borderWidth}px` } as CSSProperties}
      ref={ref}
      className={classNames("hjm-avatar", className)}
      data-size={size}
      data-shape={shape}
      data-image-fit={imageFit}
      data-frame={frame}
      data-state={imageAvailable ? "image" : "fallback"}
    >
      {src && imageAvailable ? (
        renderImage ? (
          <Fragment key={src}>{renderImage({ src, alt, size: diameter, className: "hjm-avatar__image", onError: fail })}</Fragment>
        ) : (
          <img
            {...restImageProps}
            key={src}
            src={src}
            alt={alt}
            className={classNames("hjm-avatar__image", imageClassName)}
            onError={(event) => {
              if (active.current !== generation) return;
              setFailed(generation);
              onError?.(event);
            }}
          />
        )
      ) : (
        <span
          className="hjm-avatar__fallback"
          role={alt.length > 0 ? "img" : undefined}
          aria-label={alt.length > 0 ? alt : undefined}
          aria-hidden={alt.length === 0 || undefined}
        >
          {renderFallback?.({ size: diameter, decorative: true }) ?? fallback ?? initials}
        </span>
      )}
      {accessory ? <span className="hjm-avatar__accessory" data-placement={accessoryPlacement}>{accessory}</span> : null}
    </span>
  );
  return action ? <IdentityAction action={action} {...(layoutStyle?{layoutStyle}:{})}>{avatarNode}</IdentityAction> : avatarNode;
});

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  Readonly<{
    /** Required: a pile of faces is meaningless to a screen reader otherwise. */
    label: string;
    children: ReactNode;
    size?: AvatarSize;
    /** Product-composed overflow copy such as "+3"; the count is the product's. */
    overflow?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/**
 * Overlapping avatars. The overlap comes from the recipe ratio rather than a
 * pixel value so it holds across all four sizes, and the group carries one
 * accessible name instead of letting a reader walk five unlabelled images.
 */
export const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { label, children, size = avatarRecipe.defaults.size, overflow, className, layoutStyle, style, ...props },
  ref,
) {
  if (label.trim().length === 0) throw new TypeError("AvatarGroup label must not be empty");
  const offset = Math.round(avatarRecipe.sizes[size] * avatarRecipe.overlapRatio);
  return (
    <span
      {...props}
      ref={ref}
      role="group"
      aria-label={label}
      className={classNames("hjm-avatar-group", className)}
      data-size={size}
      // The caller `style` used to be replaced by the overlap variable; merge it
      // and keep the recipe overlap last so it stays size-derived.
      style={{ ...style, ...layoutStyle, "--hjm-avatar-overlap": `${offset}px` } as CSSProperties}
    >
      {children}
      {overflow ? <span className="hjm-avatar-group__overflow" aria-hidden="true">{overflow}</span> : null}
    </span>
  );
});

export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = keyof typeof dividerRecipe.insets;

export type DividerProps = HTMLAttributes<HTMLElement> &
  Readonly<{
    orientation?: DividerOrientation;
    inset?: DividerInset;
    /** `dashed`: a break inside one surface rather than a new section; dash/gap from dividerRecipe.lineStyles. */
    lineStyle?: DividerLineStyle;
    decorative?: boolean;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = dividerRecipe.defaults.orientation,
    inset = dividerRecipe.defaults.inset,
    lineStyle = dividerRecipe.defaults.lineStyle,
    decorative = false,
    className,
    layoutStyle,
    ...props
  },
  ref,
) {
  validateDividerLineStyle(lineStyle);
  return createElement(orientation === "horizontal" ? "hr" : "div", {
    ...props,
    style: { ...props.style, ...layoutStyle },
    ref,
    className: classNames("hjm-divider", className),
    "data-orientation": orientation,
    "data-inset": inset,
    "data-line-style": lineStyle,
    role: decorative ? "presentation" : "separator",
    "aria-hidden": decorative || undefined,
    "aria-orientation": decorative ? undefined : orientation,
  });
});

export type ListSeparatorProps = Readonly<{
  separator?: keyof typeof listRecipe.separators;
  leading?: boolean;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Decorative separator for a product-owned virtual collection. List owns separators for finite rows. */
export function ListSeparator({ separator = "content", leading = false, layoutStyle }: ListSeparatorProps) {
  if (!listRecipe.separators[separator]) return null;
  return <div aria-hidden="true" role="presentation" className="hjm-list-separator" style={{
    marginInlineStart: `var(--hjm-list-separator-${separator}-${leading ? "leading-start" : "start"})`,
    marginInlineEnd: `var(--hjm-list-separator-${separator}-end)`,
    ...layoutStyle,
  }} />;
}

export type ListAppearance = "grouped" | "plain";

export type ListProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  Readonly<{
    label: string;
    children: ReactNode;
    separator?: keyof typeof listRecipe.separators;
    appearance?: ListAppearance;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

/** Semantic list container that owns separators around composed rows. */
export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  {
    label,
    children,
    separator = listRecipe.defaults.separator,
    appearance = "plain",
    className,
    layoutStyle,
    ...props
  },
  ref,
) {
  if (!label.trim()) throw new TypeError("List label must not be empty");
  const items = Children.toArray(children);
  return (
    <div
      {...props}
      style={{ ...props.style, ...layoutStyle }}
      ref={ref}
      aria-label={label}
      className={classNames("hjm-list", className)}
      data-appearance={appearance}
      data-separator={separator}
      role="list"
    >
      {items.map((item, index) => (
        <div
          className="hjm-list__item"
          key={isValidElement(item) && item.key !== null ? item.key : `hjm-list-${index}`}
          role="listitem"
        >
          {item}
        </div>
      ))}
    </div>
  );
});

export type StatisticTrendMarkRenderProps = Readonly<{
  name: "trendUp" | "trendDown" | "trendFlat";
  color: "currentColor";
  size: number;
}>;

export type ComposeStatisticAccessibilityLabel<Id extends string = string> = (
  input: Readonly<{
    contextLabel?: string;
    descriptor: ResolvedStatisticDescriptor<Id>;
    valueText: string;
  }>,
) => string;

export type StatisticProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & Readonly<{
  descriptor: StatisticDescriptor<Id>;
  density?: StatisticDensity;
  presentation?: StatisticPresentation;
  contextLabel?: string;
  accessibilityLabel?: string;
  composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
  leading?: ReactNode;
  /** Product-owned series/category color; value text and decorative leading share it. */
  valueColor?: string;
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
  /** Optional visual adapter; the descriptor remains the accessible value source. */
  renderValue?: (value: string) => ReactNode;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Statistic<Id extends string = string>(props: StatisticProps<Id>) {
  return <StatisticView {...props} />;
}

function StatisticView<Id extends string = string>({
  descriptor,
  density = "comfortable",
  presentation = "plain",
  contextLabel,
  accessibilityLabel,
  composeAccessibilityLabel,
  leading,
  valueColor,
  bar = false,
  renderTrendMark,
  renderValue,
  className,
  layoutStyle,
  ...props
}: StatisticProps<Id> & { bar?: boolean }) {
  const resolved = resolveStatisticDescriptor(descriptor);
  const valueText = `${resolved.prefix ?? ""}${resolved.value}${resolved.suffix ?? ""}`;
  const announcement = accessibilityLabel ?? composeAccessibilityLabel?.({
    ...(contextLabel === undefined ? {} : { contextLabel }),
    descriptor: resolved,
    valueText,
  }) ?? [contextLabel, resolved.label, valueText, resolved.trend?.label, resolved.hint]
    .filter(Boolean)
    .join(", ");
  if (!announcement.trim()) throw new TypeError("Statistic accessibility label must not be empty");
  const trendName = resolved.trend
    ? statisticRecipe.trend.marks[resolved.trend.direction]
    : undefined;
  return (
    <article
      {...props}
      style={{ ...props.style, ...layoutStyle, ...(valueColor ? { "--hjm-statistic-value-color": valueColor } : {}) } as CSSProperties}
      aria-label={announcement}
      className={classNames("hjm-statistic", className)}
      data-arrangement={bar ? "bar" : undefined}
      data-density={density}
      data-presentation={presentation}
    >
      <span aria-hidden="true" className="hjm-statistic__label">{resolved.label}</span>
      <span aria-hidden="true" className="hjm-statistic__value-row" data-leading={leading === undefined ? undefined : ""}>
        {leading === undefined ? null : <span className="hjm-statistic__leading">{leading}</span>}
        {resolved.prefix ? <span className="hjm-statistic__affix">{resolved.prefix}</span> : null}
        <strong className="hjm-statistic__value">{renderValue?.(resolved.value) ?? resolved.value}</strong>
        {resolved.suffix ? <span className="hjm-statistic__affix">{resolved.suffix}</span> : null}
      </span>
      {resolved.trend ? (
        <span aria-hidden="true" className="hjm-statistic__trend" data-tone={resolved.trend.tone}>
          <span className="hjm-statistic__trend-mark">
            {renderTrendMark?.({ name: trendName!, color: "currentColor", size: 16 }) ?? (
              resolved.trend.direction === "up" ? "↑" : resolved.trend.direction === "down" ? "↓" : "—"
            )}
          </span>
          {resolved.trend.label}
        </span>
      ) : null}
      {resolved.hint ? <span aria-hidden="true" className="hjm-statistic__hint">{resolved.hint}</span> : null}
    </article>
  );
}

export type StatisticGroupProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & Readonly<{
  label: string;
  descriptor: StatisticGroupDescriptor<Id>;
  density?: StatisticDensity;
  presentation?: StatisticPresentation;
  composeAccessibilityLabel?: ComposeStatisticAccessibilityLabel<Id>;
  /** A bar is a single equal-width row for a few short counts; grid retains responsive columns. */
  arrangement?: "grid" | "bar";
  renderLeading?: (item: StatisticDescriptor<Id>, context: { color: string; size: number }) => ReactNode;
  getValueColor?: (item: StatisticDescriptor<Id>) => string | undefined;
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function StatisticGroup<Id extends string = string>({
  label,
  descriptor,
  density,
  presentation,
  composeAccessibilityLabel,
  arrangement = "grid",
  renderLeading,
  getValueColor,
  renderTrendMark,
  className,
  style,
  layoutStyle,
  ...props
}: StatisticGroupProps<Id>) {
  validateStatisticGroup(descriptor);
  if (!label.trim()) throw new TypeError("StatisticGroup label must not be empty");
  return (
    <div
      {...props}
      aria-label={label}
      className={classNames("hjm-statistic-group", className)}
      role="list"
      data-arrangement={arrangement}
      style={{ ...style, ...layoutStyle, "--hjm-statistic-columns": arrangement === "bar" ? descriptor.items.length : descriptor.columns ?? statisticRecipe.defaults.columns } as CSSProperties}
    >
      {descriptor.items.map((item) => {
        const valueColor = getValueColor?.(item);
        return (
        <div key={item.id} role="listitem">
          <StatisticView
            bar={arrangement === "bar"}
            {...(valueColor ? { valueColor } : {})}
            {...(renderLeading ? { leading: renderLeading(item, { color: valueColor ?? "currentColor", size: statisticRecipe.group.bar.iconSize }) } : {})}
            contextLabel={label}
            descriptor={item}
            {...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel })}
            {...(density === undefined ? {} : { density })}
            {...(presentation === undefined ? {} : { presentation })}
            {...(renderTrendMark === undefined ? {} : { renderTrendMark })}
          />
        </div>
      ); })}
    </div>
  );
}

export type DescriptionListProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLDListElement>,
  "children"
> &
  Readonly<{
    items: readonly DescriptionItemDescriptor<Id>[];
    columns?: DescriptionListColumns;
    layout?: "stacked" | "inline";
    /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function DescriptionListInner<Id extends string>(
  { items, columns, layout, className, layoutStyle, style, ...props }: DescriptionListProps<Id>,
  forwardedRef: ForwardedRef<HTMLDListElement>,
) {
  const descriptor = resolveDescriptionListDescriptor({
    items,
    ...(columns === undefined ? {} : { columns }),
    ...(layout === undefined ? {} : { layout }),
  });
  const [width, ref] = useElementWidth(forwardedRef);
  const theme = useOptionalHjmTheme();
  const resolvedColumns = resolveDescriptionListColumnCount(
    width ?? 0,
    descriptor.columns,
    theme?.environment.textScale ?? 1,
  );
  const responsiveStyle = {
    ...style,
    ...layoutStyle,
    "--hjm-description-columns": resolvedColumns,
  } as CSSProperties;
  return (
    <dl
      {...props}
      ref={ref}
      className={classNames("hjm-description-list", className)}
      data-layout={descriptor.layout}
      data-columns={resolvedColumns}
      data-state={resolvedColumns < descriptor.columns ? "collapsed" : "ready"}
      style={responsiveStyle}
    >
      {descriptor.items.map((item) => (
        <div key={item.id} className="hjm-description-list__item">
          <dt className="hjm-description-list__label">{item.label}</dt>
          <dd className="hjm-description-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const DescriptionList = forwardRef(DescriptionListInner) as <Id extends string = string>(
  props: DescriptionListProps<Id> & RefAttributes<HTMLDListElement>,
) => ReactElement;

export type TableSortDirection = "ascending" | "descending";

export type TableColumn<Row> = Readonly<{
  id: string;
  header: ReactNode;
  cell: (row: Row, rowIndex: number) => ReactNode;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  sortDirection?: TableSortDirection;
}>;

export type TableProps<Row> = Omit<TableHTMLAttributes<HTMLTableElement>, "children"> &
  Readonly<{
    columns: readonly TableColumn<Row>[];
    rows: readonly Row[];
    getRowKey: (row: Row, rowIndex: number) => string;
    caption?: ReactNode;
    /** Localized content rendered when rows is empty. */
    emptyState: ReactNode;
    onSortChange?: (columnId: string, direction: TableSortDirection) => void;
    wrapperClassName?: string;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

// Table's callback cannot express null; share the sort policy with a two-state cycle.
function TableInner<Row>(
  {
    columns,
    rows,
    getRowKey,
    caption,
    emptyState,
    onSortChange,
    wrapperClassName,
    className,
    layoutStyle,
    ...props
  }: TableProps<Row>,
  ref: ForwardedRef<HTMLTableElement>,
) {
  if (columns.length === 0) throw new TypeError("Table requires at least one column");
  const ids = new Set<string>();
  for (const column of columns) {
    if (column.id.trim().length === 0) throw new TypeError("Table column id must not be empty");
    if (ids.has(column.id)) throw new TypeError(`Duplicate Table column id: ${column.id}`);
    ids.add(column.id);
    if (column.sortDirection && !column.sortable) {
      throw new TypeError(`Table column ${column.id} has sortDirection but is not sortable`);
    }
  }
  const rowKeys = rows.map((row, rowIndex) => getRowKey(row, rowIndex));
  const seenRowKeys = new Set<string>();
  for (const rowKey of rowKeys) {
    if (rowKey.trim().length === 0) throw new TypeError("Table row key must not be empty");
    if (seenRowKeys.has(rowKey)) throw new TypeError(`Duplicate Table row key: ${rowKey}`);
    seenRowKeys.add(rowKey);
  }
  return (
    // Placement belongs to the scroll wrapper (the visual root); `style` keeps
    // going to the <table>, where it always went.
    <div className={classNames("hjm-table-scroll", wrapperClassName)} style={layoutStyle} tabIndex={0}>
      <table {...props} ref={ref} className={classNames("hjm-table", className)}>
        {caption ? <caption className="hjm-table__caption">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="hjm-table__header"
                data-align={column.align ?? "start"}
                aria-sort={column.sortDirection ?? (column.sortable ? "none" : undefined)}
              >
                {column.sortable ? (
                  <TableSortButton
                    header={column.header}
                    {...(column.sortDirection === undefined ? {} : { direction: column.sortDirection })}
                    glyphs={{ ascending: " ↑", descending: " ↓", none: " ↕" }}
                    className="hjm-table__sort"
                    onSort={() => {
                      const next = getNextDataTableSortState(
                        column.sortDirection ? { columnId: column.id, direction: column.sortDirection } : null,
                        column.id, "two-state",
                      );
                      onSortChange?.(column.id, next!.direction);
                    }} />
                ) : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="hjm-table__empty" colSpan={columns.length}>{emptyState}</td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowKeys[rowIndex]} className="hjm-table__row">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className="hjm-table__cell"
                    data-align={column.align ?? "start"}
                  >
                    {column.cell(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Table = forwardRef(TableInner) as <Row>(
  props: TableProps<Row> & RefAttributes<HTMLTableElement>,
) => ReactElement;

export type TimelineProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLOListElement>,
  "children"
> &
  Readonly<{
    items: readonly TimelineItemDescriptor<Id>[];
    /** Default journal uses unfilled reading rows; selection adds record disclosure. "record" retains the earlier card surface. */
    variant?: "record" | "journal";
    composeAccessibleName: ComposeTimelineAccessibleName;
    renderMetadata?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /** Per-record commands of a passive Timeline. Not allowed together with selection. */
    renderActions?: (item: TimelineItemDescriptor<Id>) => ReactNode;
    /**
     * Makes records selectable (journal disclosure buttons; record variant listbox). `null` = nothing chosen. Supply
     * together with `onSelectedIdChange`; the list then needs `aria-label` or `aria-labelledby`.
     */
    selectedId?: Id | null;
    /** Called with the record chosen by click, Enter/Space or ArrowUp/ArrowDown/Home/End (selection follows focus). */
    onSelectedIdChange?: (id: Id) => void;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function TimelineInner<Id extends string = string>(
  {
    items,
    variant = timelineDefaults.variant,
    composeAccessibleName,
    renderMetadata,
    renderActions,
    selectedId,
    onSelectedIdChange,
    className,
    layoutStyle,
    onKeyDown,
    ...props
  }: TimelineProps<Id>,
  ref: ForwardedRef<HTMLOListElement>,
) {
  validateTimelineSelection(selectedId, onSelectedIdChange, { hasActions: renderActions !== undefined, variant });
  const selectable = onSelectedIdChange !== undefined;
  const journal = variant === "journal";
  // Anchor collapsed state to its selected record. External map/day selection opens the new record immediately.
  const [disclosure, setDisclosure] = useState({ id: selectedId, collapsed: false });
  if (disclosure.id !== selectedId) setDisclosure({ id: selectedId, collapsed: false });
  if (selectable && !props["aria-label"] && !props["aria-labelledby"]) {
    throw new TypeError("A selectable Timeline needs aria-label or aria-labelledby (listbox name)");
  }
  const resolved = resolveTimelineDescriptor(
    selectable ? { items, selectedId: selectedId ?? null } : { items },
    { composeAccessibleName },
  );
  const idPrefix = useId();
  // Roving tab stop: the selected record, or the first one before anything is chosen.
  const tabStopId = selectable ? (selectedId ?? resolved[0]?.id) : undefined;
  const select = (list: HTMLOListElement, id: Id, toggle = false) => {
    if (journal) setDisclosure({ id, collapsed: toggle && id === selectedId && !disclosure.collapsed });
    if (id !== selectedId) onSelectedIdChange?.(id);
    list.querySelector<HTMLElement>(`[data-timeline-id="${CSS.escape(id)}"]`)?.focus();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    onKeyDown?.(event);
    if (!selectable || event.defaultPrevented) return;
    const focusedId = (event.target as HTMLElement).closest<HTMLElement>("[data-timeline-id]")?.dataset.timelineId as Id | undefined;
    if (focusedId === undefined) return;
    if (!journal && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      select(event.currentTarget, focusedId, true);
      return;
    }
    const target = getTimelineSelectionTarget(items, focusedId, event.key);
    if (target === undefined) return;
    event.preventDefault();
    select(event.currentTarget, target);
  };
  return (
    <ol
      {...props}
      style={{ ...props.style, ...layoutStyle }}
      ref={ref}
      className={classNames("hjm-timeline", className)}
      role={selectable && !journal ? "listbox" : props.role}
      aria-orientation={selectable && !journal ? "vertical" : undefined}
      data-selectable={selectable || undefined}
      data-variant={variant}
      onKeyDown={handleKeyDown}
    >
      {resolved.map((item, index) => {
        const actions = renderActions?.(item);
        const detailIds = selectable
          ? [item.description ? `${idPrefix}-${index}-description` : null, item.timestamp ? `${idPrefix}-${index}-timestamp` : null].filter(Boolean).join(" ")
          : "";
        const expanded = !selectable || (item.selected && (disclosure.id !== selectedId || !disclosure.collapsed));
        const body = <>
          <span className="hjm-timeline__rail" aria-hidden="true">
            <span className="hjm-timeline__dot" />
            {index < resolved.length - 1 ? <span className="hjm-timeline__connector" /> : null}
          </span>
          <span className="hjm-timeline__content">
            <span className="hjm-timeline__heading">
              <strong className="hjm-timeline__label">{item.label}</strong>
              {!journal ? renderMetadata?.(item) : selectable ? <span className="hjm-timeline__chevron" aria-hidden="true">⌄</span> : null}
            </span>
            {journal && item.timestamp ? <time className="hjm-timeline__timestamp" dateTime={item.dateTime}>{item.timestamp}</time> : null}
            <span className="hjm-timeline__details" id={`${idPrefix}-${index}-details`} hidden={journal && !expanded}>
              {journal ? renderMetadata?.(item) : null}
              {item.description ? <span className="hjm-timeline__description" id={selectable && !journal ? `${idPrefix}-${index}-description` : undefined}>{item.description}</span> : null}
              {!journal && item.timestamp ? <time className="hjm-timeline__timestamp" dateTime={item.dateTime} id={selectable ? `${idPrefix}-${index}-timestamp` : undefined}>{item.timestamp}</time> : null}
            </span>
          </span>
          {actions ? <div className="hjm-timeline__actions">{actions}</div> : null}
        </>;
        if (journal && selectable) return <li key={item.id}>
          <button type="button" className="hjm-timeline__item" data-tone={item.tone} data-state={item.selected ? "selected" : undefined}
            data-timeline-id={item.id} aria-label={[item.accessibleName, item.timestamp].filter(Boolean).join(", ")}
            aria-expanded={expanded} aria-controls={`${idPrefix}-${index}-details`} aria-describedby={expanded ? `${idPrefix}-${index}-details` : undefined}
            onClick={event => select(event.currentTarget.closest("ol")!, item.id, true)}>{body}</button>
        </li>;
        return <li aria-label={item.accessibleName} className="hjm-timeline__item" data-tone={item.tone}
          data-emphasized={item.emphasized || undefined} key={item.id}
          {...(selectable ? {
            role: "option", "aria-selected": item.selected, "aria-describedby": detailIds || undefined,
            "data-timeline-id": item.id, "data-state": item.selected ? "selected" : undefined,
            tabIndex: item.id === tabStopId ? 0 : -1,
            onClick: (event: { currentTarget: HTMLLIElement }) => select(event.currentTarget.parentElement as HTMLOListElement, item.id),
          } : {})}>{body}</li>
      })}
    </ol>
  );
}

export const Timeline = forwardRef(TimelineInner) as <Id extends string = string>(
  props: TimelineProps<Id> & RefAttributes<HTMLOListElement>,
) => ReactElement;
