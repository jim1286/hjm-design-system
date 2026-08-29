import {
  resolveDescriptionListColumnCount,
  resolveDescriptionListDescriptor,
  type DescriptionItemDescriptor,
  type DescriptionListColumns,
} from "@hjmds/design-contracts/components/description-list";
import {
  resolveTimelineDescriptor,
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
  dividerRecipe,
  listRecipe,
  statisticRecipe,
  type AccordionDensity,
  type AvatarShape,
  type AvatarSize,
  type StatisticDensity,
  type StatisticPresentation,
} from "@hjmds/design-contracts/recipes";
import {
  Children,
  createElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
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
import { classNames, useControllableState, useElementWidth } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type AccordionItem = Readonly<{
  id: string;
  title: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
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
      className,
      ...props
    },
    ref,
  ) {
    validateAccordionItems(items);
    const [value, setValue] = useControllableState<readonly string[]>({
      ...(valueProp === undefined ? {} : { value: valueProp }),
      defaultValue,
      ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
    });
    const validIds = new Set(items.map((item) => item.id));
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
        ref={ref}
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
                {expanded ? "−" : "+"}
              </span>
            </button>
          );
          return (
            <div
              key={item.id}
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

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  Readonly<{
    name: string;
    src?: string;
    alt?: string;
    fallback?: ReactNode;
    size?: AvatarSize;
    shape?: AvatarShape;
    imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">;
  }>;

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    src,
    alt = name,
    fallback,
    size = avatarRecipe.defaults.size,
    shape = avatarRecipe.defaults.shape,
    imageProps,
    className,
    ...props
  },
  ref,
) {
  if (name.trim().length === 0) throw new TypeError("Avatar name must not be empty");
  const [imageAvailable, setImageAvailable] = useState(Boolean(src));
  useEffect(() => setImageAvailable(Boolean(src)), [src]);
  const { onError, className: imageClassName, ...restImageProps } = imageProps ?? {};
  return (
    <span
      {...props}
      ref={ref}
      className={classNames("hjm-avatar", className)}
      data-size={size}
      data-shape={shape}
      data-state={imageAvailable ? "image" : "fallback"}
    >
      {src && imageAvailable ? (
        <img
          {...restImageProps}
          src={src}
          alt={alt}
          className={classNames("hjm-avatar__image", imageClassName)}
          onError={(event) => {
            setImageAvailable(false);
            onError?.(event);
          }}
        />
      ) : (
        <span
          className="hjm-avatar__fallback"
          role={alt.length > 0 ? "img" : undefined}
          aria-label={alt.length > 0 ? alt : undefined}
          aria-hidden={alt.length === 0 || undefined}
        >
          {fallback ?? initials(name)}
        </span>
      )}
    </span>
  );
});

export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = keyof typeof dividerRecipe.insets;

export type DividerProps = HTMLAttributes<HTMLElement> &
  Readonly<{
    orientation?: DividerOrientation;
    inset?: DividerInset;
    decorative?: boolean;
  }>;

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = dividerRecipe.defaults.orientation,
    inset = dividerRecipe.defaults.inset,
    decorative = false,
    className,
    ...props
  },
  ref,
) {
  return createElement(orientation === "horizontal" ? "hr" : "div", {
    ...props,
    ref,
    className: classNames("hjm-divider", className),
    "data-orientation": orientation,
    "data-inset": inset,
    role: decorative ? "presentation" : "separator",
    "aria-hidden": decorative || undefined,
    "aria-orientation": decorative ? undefined : orientation,
  });
});

export type ListAppearance = "grouped" | "plain";

export type ListProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  Readonly<{
    label: string;
    children: ReactNode;
    separator?: keyof typeof listRecipe.separators;
    appearance?: ListAppearance;
  }>;

/** Semantic list container that owns separators around composed rows. */
export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  {
    label,
    children,
    separator = listRecipe.defaults.separator,
    appearance = "plain",
    className,
    ...props
  },
  ref,
) {
  if (!label.trim()) throw new TypeError("List label must not be empty");
  const items = Children.toArray(children);
  return (
    <div
      {...props}
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
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
}>;

export function Statistic<Id extends string = string>({
  descriptor,
  density = "comfortable",
  presentation = "plain",
  contextLabel,
  accessibilityLabel,
  composeAccessibilityLabel,
  renderTrendMark,
  className,
  ...props
}: StatisticProps<Id>) {
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
      aria-label={announcement}
      className={classNames("hjm-statistic", className)}
      data-density={density}
      data-presentation={presentation}
    >
      <span aria-hidden="true" className="hjm-statistic__label">{resolved.label}</span>
      <span aria-hidden="true" className="hjm-statistic__value-row">
        {resolved.prefix ? <span className="hjm-statistic__affix">{resolved.prefix}</span> : null}
        <strong className="hjm-statistic__value">{resolved.value}</strong>
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
  renderTrendMark?: (props: StatisticTrendMarkRenderProps) => ReactNode;
}>;

export function StatisticGroup<Id extends string = string>({
  label,
  descriptor,
  density,
  presentation,
  composeAccessibilityLabel,
  renderTrendMark,
  className,
  style,
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
      style={{ ...style, "--hjm-statistic-columns": descriptor.columns ?? statisticRecipe.defaults.columns } as CSSProperties}
    >
      {descriptor.items.map((item) => (
        <div key={item.id} role="listitem">
          <Statistic
            contextLabel={label}
            descriptor={item}
            {...(composeAccessibilityLabel === undefined ? {} : { composeAccessibilityLabel })}
            {...(density === undefined ? {} : { density })}
            {...(presentation === undefined ? {} : { presentation })}
            {...(renderTrendMark === undefined ? {} : { renderTrendMark })}
          />
        </div>
      ))}
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
  }>;

function DescriptionListInner<Id extends string>(
  { items, columns, className, style, ...props }: DescriptionListProps<Id>,
  forwardedRef: ForwardedRef<HTMLDListElement>,
) {
  const descriptor = resolveDescriptionListDescriptor({
    items,
    ...(columns === undefined ? {} : { columns }),
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
    "--hjm-description-columns": resolvedColumns,
  } as CSSProperties;
  return (
    <dl
      {...props}
      ref={ref}
      className={classNames("hjm-description-list", className)}
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
  }>;

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
    <div className={classNames("hjm-table-scroll", wrapperClassName)} tabIndex={0}>
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
                  <button
                    type="button"
                    className="hjm-table__sort"
                    onClick={() =>
                      onSortChange?.(
                        column.id,
                        column.sortDirection === "ascending" ? "descending" : "ascending",
                      )
                    }
                  >
                    {column.header}
                    <span aria-hidden="true">
                      {column.sortDirection === "ascending"
                        ? " ↑"
                        : column.sortDirection === "descending"
                          ? " ↓"
                          : " ↕"}
                    </span>
                  </button>
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
    composeAccessibleName: ComposeTimelineAccessibleName;
  }>;

function TimelineInner<Id extends string = string>(
  {
    items,
    composeAccessibleName,
    className,
    ...props
  }: TimelineProps<Id>,
  ref: ForwardedRef<HTMLOListElement>,
) {
  const resolved = resolveTimelineDescriptor(
    { items },
    { composeAccessibleName },
  );
  return (
    <ol
      {...props}
      ref={ref}
      className={classNames("hjm-timeline", className)}
    >
      {resolved.map((item, index) => (
        <li
          aria-label={item.accessibleName}
          className="hjm-timeline__item"
          data-tone={item.tone}
          key={item.id}
        >
          <span className="hjm-timeline__rail" aria-hidden="true">
            <span className="hjm-timeline__dot" />
            {index < resolved.length - 1 ? (
              <span className="hjm-timeline__connector" />
            ) : null}
          </span>
          <span className="hjm-timeline__content">
            <span className="hjm-timeline__heading">
              <strong className="hjm-timeline__label">{item.label}</strong>
              {item.timestamp ? (
                <time className="hjm-timeline__timestamp">{item.timestamp}</time>
              ) : null}
            </span>
            {item.description ? (
              <span className="hjm-timeline__description">{item.description}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

export const Timeline = forwardRef(TimelineInner) as <Id extends string = string>(
  props: TimelineProps<Id> & RefAttributes<HTMLOListElement>,
) => ReactElement;
