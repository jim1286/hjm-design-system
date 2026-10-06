import { resolveGooeyIndicator, type TabsAppearance, type GooeyIndicatorRect } from "@hjmds/design-contracts/gooey-navigation";
export type { TabsAppearance };
import {
  getTabNavigationIntent,
  getTabNavigationTarget,
  resolveInitialTabValue,
  tabsBehaviorDefaults,
  type TabsActivationMode,
  type TabsDirection,
  type TabsMountPolicy,
  type TabsOrientation,
  type TabsPanelMode,
} from "@hjmds/design-contracts/behaviors";
import {
  iconRecipe,
  tabsRecipe,
  type TabSize,
  type TabsLayout,
  type TabsOverflow,
} from "@hjmds/design-contracts/recipes";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { classNames, useControllableState } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type TabLeadingRenderProps = Readonly<{
  selected: boolean;
  disabled: boolean;
  color: "currentColor";
  /** Pixel size resolved from `tabsRecipe.icon.glyph`. */
  size: number;
}>;

export type TabItem = Readonly<{
  id: string;
  label: ReactNode;
  panel?: ReactNode;
  renderLeading?: (state: TabLeadingRenderProps) => ReactNode;
  disabled?: boolean;
}>;

type TabsSelection =
  | Readonly<{
      value: string;
      defaultValue?: never;
      onValueChange(value: string): void;
    }>
  | Readonly<{
      value?: never;
      defaultValue?: string;
      onValueChange?: (value: string) => void;
    }>;

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "dir" | "onChange"> &
  TabsSelection &
  Readonly<{
    label: string;
    items: readonly TabItem[];
    activationMode?: TabsActivationMode;
    mountPolicy?: TabsMountPolicy;
    panelMode?: TabsPanelMode;
    appearance?: TabsAppearance;
    orientation?: TabsOrientation;
    direction?: TabsDirection;
    loop?: boolean;
    size?: TabSize;
    layout?: TabsLayout;
    overflow?: TabsOverflow;
    /** Set false when panels are rendered separately with `TabPanel`. */
    renderPanels?: boolean;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function validateItems(items: readonly TabItem[]): void {
  if (items.length === 0) throw new TypeError("Tabs requires at least one item");
  const ids = new Set<string>();
  for (const item of items) {
    if (item.id.trim().length === 0) throw new TypeError("Tabs item id must not be empty");
    if (ids.has(item.id)) throw new TypeError(`Duplicate Tabs item id: ${item.id}`);
    ids.add(item.id);
  }
  if (!items.some((item) => !item.disabled)) {
    throw new TypeError("Tabs requires at least one enabled item");
  }
}

const panelFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type TabPanelHostProps = HTMLAttributes<HTMLDivElement> & Readonly<{
  id: string;
  labelledBy: string;
  selected: boolean;
  dynamic: boolean;
  children: ReactNode;
}>;

function TabPanelHost({
  id,
  labelledBy,
  selected,
  dynamic,
  children,
  className,
  ...props
}: TabPanelHostProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasFocusableContent, setHasFocusableContent] = useState(false);
  useEffect(() => {
    setHasFocusableContent(
      ref.current?.querySelector(panelFocusableSelector) !== null,
    );
  }, [children]);

  return (
    <div
      {...props}
      ref={ref}
      id={id}
      role="tabpanel"
      className={classNames("hjm-tabs__panel", className)}
      aria-labelledby={labelledBy}
      tabIndex={selected && !hasFocusableContent ? 0 : undefined}
      hidden={!selected}
      inert={selected ? undefined : true}
      data-state={selected ? "active" : "inactive"}
      data-panel-mode={dynamic ? "dynamic" : "keyed"}
    >
      {children}
    </div>
  );
}

function encodedTabId(value: string): string {
  return encodeURIComponent(value);
}

export function getTabId(tabsId: string, value: string): string {
  return `${tabsId}-tab-${encodedTabId(value)}`;
}

export function getTabPanelId(
  tabsId: string,
  value: string,
  mode: TabsPanelMode = "keyed",
): string {
  return mode === "dynamic"
    ? `${tabsId}-panel`
    : `${tabsId}-panel-${encodedTabId(value)}`;
}

export function getDynamicTabPanelId(tabsId: string): string {
  return getTabPanelId(tabsId, "", "dynamic");
}

type ExternalTabPanelBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> &
  Readonly<{
    tabsId: string;
    activeValue: string;
    children: ReactNode;
    /** Canonical layout-only placement on the panel element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export type TabPanelProps = ExternalTabPanelBaseProps &
  (
    | Readonly<{
        mode: "dynamic";
        value?: never;
        mountPolicy?: never;
      }>
    | Readonly<{
        mode?: "keyed";
        value: string;
        mountPolicy?: TabsMountPolicy;
      }>
  );

/** External panel host for products that keep routing, query, or scroll state outside Tabs. */
export function TabPanel(props: TabPanelProps) {
  const { tabsId, activeValue, children } = props;
  const dynamic = props.mode === "dynamic";
  const value = dynamic ? activeValue : props.value;
  const selected = value === activeValue;
  const mountPolicy = dynamic ? "active" : props.mountPolicy ?? tabsBehaviorDefaults.mountPolicy;
  let hostProps: Omit<HTMLAttributes<HTMLDivElement>, "id">;
  if (props.mode === "dynamic") {
    const {
      tabsId: _tabsId,
      activeValue: _activeValue,
      children: _children,
      mode: _mode,
      layoutStyle,
      ...htmlProps
    } = props;
    hostProps = { ...htmlProps, style: { ...htmlProps.style, ...layoutStyle } };
  } else {
    const {
      tabsId: _tabsId,
      activeValue: _activeValue,
      children: _children,
      mode: _mode,
      value: _value,
      mountPolicy: _mountPolicy,
      layoutStyle,
      ...htmlProps
    } = props;
    hostProps = { ...htmlProps, style: { ...htmlProps.style, ...layoutStyle } };
  }
  const [visited, setVisited] = useState(selected);
  useEffect(() => {
    if (selected) setVisited(true);
  }, [selected]);
  const mounted =
    dynamic ||
    selected ||
    mountPolicy === "always" ||
    (mountPolicy === "visited" && visited);
  if (!mounted) return null;
  return (
    <TabPanelHost
      {...hostProps}
      id={getTabPanelId(tabsId, value, dynamic ? "dynamic" : "keyed")}
      labelledBy={getTabId(tabsId, dynamic ? activeValue : value)}
      selected={selected}
      dynamic={dynamic}
    >
      {children}
    </TabPanelHost>
  );
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  props,
  ref,
) {
  const {
    label,
    items,
    activationMode = tabsBehaviorDefaults.activationMode,
    mountPolicy = tabsBehaviorDefaults.mountPolicy,
    panelMode = tabsBehaviorDefaults.panelMode,
    appearance = "standard",
    orientation = tabsBehaviorDefaults.orientation,
    direction: directionProp,
    loop = tabsBehaviorDefaults.loop,
    size = tabsRecipe.defaults.size,
    layout = tabsRecipe.defaults.layout,
    overflow = tabsRecipe.defaults.overflow,
    renderPanels = true,
    className,
    id,
    value: valueProp,
    defaultValue,
    onValueChange,
    layoutStyle,
    ...rest
  } = props;
  validateItems(items);
  if (label.trim().length === 0) throw new TypeError("Tabs label must not be empty");
  if (panelMode === "dynamic" && mountPolicy !== "active") {
    throw new TypeError("Tabs dynamic panelMode requires active mountPolicy");
  }
  const descriptors = items.map((item) => ({
    id: item.id,
    label: item.id,
    ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
  }));
  const initialValueRef = useRef<Readonly<{ value: string }> | null>(null);
  if (initialValueRef.current === null) {
    const resolved = resolveInitialTabValue(descriptors, defaultValue);
    if (resolved === undefined) throw new TypeError("Tabs requires an enabled item");
    initialValueRef.current = { value: resolved };
  }
  const initialValue = initialValueRef.current.value;
  const collectionFallback = items.find((item) => !item.disabled)?.id;
  if (collectionFallback === undefined) throw new TypeError("Tabs requires an enabled item");
  const [storedValue, setValue] = useControllableState({
    ...(valueProp === undefined ? {} : { value: valueProp }),
    defaultValue: initialValue,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const controlled = valueProp !== undefined;
  const storedSelectionIsValid = items.some(
    (item) => item.id === storedValue && !item.disabled,
  );
  if (controlled && !storedSelectionIsValid) {
    throw new RangeError(`Tabs value must identify an enabled item: ${storedValue}`);
  }
  const value = storedSelectionIsValid ? storedValue : collectionFallback;
  const [focusValue, setFocusValue] = useState(value);
  const resolvedFocusValue = items.some(
    (item) => item.id === focusValue && !item.disabled,
  )
    ? focusValue
    : value;
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([value]));
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const generatedId = useId().replaceAll(":", "");
  const baseId = id ?? `hjm-${generatedId}`;
  const theme = useOptionalHjmTheme();
  const direction = directionProp ?? theme?.environment.direction ?? tabsBehaviorDefaults.direction;
  const gooey = appearance === "gooey" && orientation === "horizontal";
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const previousIndicator = useRef<{ value: string; rect: GooeyIndicatorRect } | null>(null);
  useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const tab = tabRefs.current.get(value);
    if (!gooey || !indicator || !tab) { previousIndicator.current = null; return; }
    let animation: Animation | undefined;
    const place = (animate: boolean) => {
      animation?.cancel();
      const rect = { x: tab.offsetLeft, width: tab.offsetWidth };
      if (rect.width <= 0) return;
      indicator.style.left = `${rect.x}px`;
      indicator.style.width = `${rect.width}px`;
      const previous = previousIndicator.current;
      if (animate && previous && previous.value !== value && !theme?.environment.reducedMotion && !document.hidden) {
        const recipe = resolveGooeyIndicator(previous.rect, rect);
        animation = indicator.animate(recipe.input.map((offset, index) => ({ offset, left: `${recipe.x[index]}px`, width: `${recipe.width[index]}px` })), { duration: recipe.duration, easing: "ease-out" });
      }
      previousIndicator.current = { value, rect };
    };
    place(true);
    // Font loading, resizing and large text change measurements without changing selection.
    const observer = new ResizeObserver(() => {
      const previous = previousIndicator.current?.rect;
      if (previous?.x !== tab.offsetLeft || previous.width !== tab.offsetWidth) place(false);
    });
    const list = tab.parentElement!;
    for (const child of list.children) if (child !== indicator) observer.observe(child);
    const visibility = () => { if (document.hidden) animation?.cancel(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { animation?.cancel(); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [gooey, value, items, theme?.environment.reducedMotion]);


  useEffect(() => {
    if (!controlled && !storedSelectionIsValid) setValue(collectionFallback);
  }, [collectionFallback, controlled, setValue, storedSelectionIsValid]);
  useEffect(() => {
    if (!items.some((item) => item.id === focusValue && !item.disabled)) {
      setFocusValue(value);
    }
  }, [focusValue, items, value]);
  useEffect(() => {
    setVisited((current) => {
      const known = new Set(items.map((item) => item.id));
      const next = new Set([...current].filter((id) => known.has(id)));
      next.add(value);
      if (
        next.size === current.size &&
        [...next].every((id) => current.has(id))
      ) return current;
      return next;
    });
  }, [items, value]);

  const focusItem = (id: string) => {
    setFocusValue(id);
    if (activationMode === "automatic") setValue(id);
    queueMicrotask(() => {
      const node = tabRefs.current.get(id);
      if (!node) return;
      node.focus();
      // The tab strip is horizontally scrollable; keyboard focus must bring an offscreen roving tab into view.
      // `auto` preserves the consumer's scroll behavior, while `instant` prevents CSS smooth scrolling under reduced motion.
      node.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: theme?.environment.reducedMotion ? "instant" : "auto",
      });
    });
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const intent = getTabNavigationIntent(
      event.key === " " ? "Space" : event.key as Parameters<typeof getTabNavigationIntent>[0],
      orientation,
      direction,
    );
    if (intent !== undefined) {
      const target = getTabNavigationTarget(descriptors, id, intent, loop);
      if (target !== undefined) {
        event.preventDefault();
        focusItem(target);
      }
      return;
    }
    if (
      activationMode === "manual" &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      setValue(id);
    }
  };
  const panelId = (value: string) => getTabPanelId(baseId, value, panelMode);

  return (
    <div
      {...rest}
      style={{ ...rest.style, ...layoutStyle }}
      ref={ref}
      id={baseId}
      className={classNames("hjm-tabs", className)}
      data-size={size}
      data-layout={layout}
      data-overflow={overflow}
      data-appearance={gooey ? "gooey" : "standard"}
      data-orientation={orientation}
      data-mount-policy={mountPolicy}
      data-panel-mode={panelMode}
      data-state="ready"
      dir={direction}
    >
      <div
        className="hjm-tabs__list"
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
      >
        {gooey ? <span ref={indicatorRef} aria-hidden="true" className="hjm-tabs__gooey" /> : null}
        {items.map((item) => {
          const selected = item.id === value;
          const tabId = getTabId(baseId, item.id);
          const leadingSize = iconRecipe.sizes[tabsRecipe.icon.glyph];
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              id={tabId}
              type="button"
              role="tab"
              className="hjm-tabs__tab"
              data-state={selected ? "selected" : "idle"}
              aria-selected={selected}
              aria-controls={panelId(item.id)}
              tabIndex={item.id === resolvedFocusValue ? 0 : -1}
              disabled={item.disabled}
              onClick={() => {
                setFocusValue(item.id);
                setValue(item.id);
              }}
              onKeyDown={(event) => handleKeyDown(event, item.id)}
            >
              {item.renderLeading ? (
                <span aria-hidden="true" className="hjm-tabs__leading">
                  {item.renderLeading({
                    selected,
                    disabled: item.disabled ?? false,
                    color: "currentColor",
                    size: leadingSize,
                  })}
                </span>
              ) : null}
              {item.label}
            </button>
          );
        })}
      </div>
      {!renderPanels ? null : panelMode === "dynamic" ? (
        <TabPanelHost
          id={panelId(value)}
          labelledBy={getTabId(baseId, value)}
          selected
          dynamic
        >
          {items.find((item) => item.id === value)?.panel}
        </TabPanelHost>
      ) : items.map((item) => {
        const selected = item.id === value;
        const mounted = mountPolicy === "always" ||
          (mountPolicy === "visited" && (visited.has(item.id) || selected)) ||
          (mountPolicy === "active" && selected);
        return mounted ? (
          <TabPanelHost
            key={item.id}
            id={panelId(item.id)}
            labelledBy={getTabId(baseId, item.id)}
            selected={selected}
            dynamic={false}
          >
            {item.panel}
          </TabPanelHost>
        ) : null;
      })}
    </div>
  );
});
