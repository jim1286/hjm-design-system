import {
  resolveBottomNavigationActivation,
  resolveBottomNavigationConfiguration,
  resolveBottomNavigationDescriptor,
  type BottomNavigationActivation,
  type BottomNavigationConfiguration,
  type BottomNavigationDescriptor,
  type ResolvedBottomNavigationItemDescriptor,
} from "@hjm/design-contracts/components/bottom-navigation";
import {
  bottomNavigationRecipe,
  iconRecipe,
} from "@hjm/design-contracts/recipes";
import {
  forwardRef,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

const virtualKeyboardMinimumOcclusion = 120;

export type BottomNavigationIconRenderProps<
  Key extends string = string,
  IconName extends string = string,
> = Readonly<{
  item: ResolvedBottomNavigationItemDescriptor<Key, IconName>;
  name: IconName;
  selected: boolean;
  color: "currentColor";
  size: number;
  strokeWidth: number;
  scale: number;
}>;

export type BottomNavigationLinkRenderProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Readonly<{
    href: string;
    children: ReactNode;
    "data-state": "idle" | "selected";
  }>;

export type BottomNavigationProps<
  Key extends string = string,
  IconName extends string = string,
> = Omit<
  HTMLAttributes<HTMLElement>,
  "aria-label" | "aria-labelledby" | "children" | "dir" | "onChange" | "role"
> &
  Readonly<{
    descriptor: BottomNavigationDescriptor<Key, IconName>;
    configuration?: BottomNavigationConfiguration;
    getHref: (item: ResolvedBottomNavigationItemDescriptor<Key, IconName>) => string;
    renderIcon: (props: BottomNavigationIconRenderProps<Key, IconName>) => ReactNode;
    /** Framework navigation adapter, for example Next.js Link. */
    renderLink?: (props: BottomNavigationLinkRenderProps) => ReactElement;
    primaryAction?: ReactNode;
    onActivate?: (activation: BottomNavigationActivation<Key>) => void;
  }>;

export function isUnmodifiedPrimaryBottomNavigationClick(
  event: Pick<
    MouseEvent<HTMLAnchorElement>,
    "altKey" | "button" | "ctrlKey" | "defaultPrevented" | "metaKey" | "shiftKey"
  >,
): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function shouldHideBottomNavigationForKeyboard(input: Readonly<{
  behavior: "hide" | "remain";
  layoutViewportHeight: number;
  visualViewportHeight: number;
  visualViewportOffsetTop?: number;
  visualViewportScale?: number;
}>): boolean {
  if (input.behavior !== "hide") return false;
  if ((input.visualViewportScale ?? 1) !== 1) return false;
  const visibleBottom =
    input.visualViewportHeight + (input.visualViewportOffsetTop ?? 0);
  return layoutViewportHeightIsValid(input.layoutViewportHeight) &&
    input.layoutViewportHeight - visibleBottom >= virtualKeyboardMinimumOcclusion;
}

function layoutViewportHeightIsValid(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function getBottomNavigationGridColumn(
  index: number,
  itemCount: number,
  distribution: "equal" | "center-gap",
): number | undefined {
  if (distribution !== "center-gap") return undefined;
  const middle = itemCount / 2;
  return index < middle ? index + 1 : index + 2;
}

function useKeyboardHidden(behavior: "hide" | "remain"): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      setHidden(
        shouldHideBottomNavigationForKeyboard({
          behavior,
          layoutViewportHeight: window.innerHeight,
          visualViewportHeight: viewport.height,
          visualViewportOffsetTop: viewport.offsetTop,
          visualViewportScale: viewport.scale,
        }),
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [behavior]);
  return hidden;
}

function BottomNavigationInner<
  Key extends string = string,
  IconName extends string = string,
>(
  {
    descriptor,
    configuration = {},
    getHref,
    renderIcon,
    renderLink,
    primaryAction,
    onActivate,
    className,
    style,
    ...props
  }: BottomNavigationProps<Key, IconName>,
  ref: ForwardedRef<HTMLElement>,
) {
  const resolved = resolveBottomNavigationDescriptor(descriptor);
  const theme = useOptionalHjmTheme();
  const direction = configuration.direction ?? theme?.environment.direction;
  const presentation = resolveBottomNavigationConfiguration(
    {
      ...configuration,
      ...(direction === undefined ? {} : { direction }),
    },
    resolved.items.length,
  );
  const hidden = useKeyboardHidden(presentation.keyboardBehavior);
  const density = bottomNavigationRecipe.density[presentation.density];
  const presentationRecipe =
    bottomNavigationRecipe.presentations[presentation.presentation];
  const centerGap =
    bottomNavigationRecipe.distributions[presentation.distribution].centerGap;
  const iconSize = iconRecipe.sizes[density.icon];

  if (hidden) return null;

  return (
    <nav
      {...props}
      ref={ref}
      aria-label={resolved.accessibilityLabel}
      className={classNames("hjm-bottom-navigation", className)}
      data-density={presentation.density}
      data-distribution={presentation.distribution}
      data-keyboard-behavior={presentation.keyboardBehavior}
      data-presentation={presentation.presentation}
      dir={presentation.direction}
      style={{
        "--hjm-bottom-navigation-center-gap": `${centerGap}px`,
        "--hjm-bottom-navigation-columns": resolved.items.length,
        "--hjm-bottom-navigation-half-columns": resolved.items.length / 2,
        "--hjm-bottom-navigation-item-gap": `${density.gap}px`,
        "--hjm-bottom-navigation-item-min-height": `${density.itemMinHeight}px`,
        "--hjm-bottom-navigation-item-min-width": `${density.itemMinWidth}px`,
        "--hjm-bottom-navigation-item-padding": `${density.padding}px`,
        "--hjm-bottom-navigation-max-width": presentationRecipe.maxWidth
          ? `${presentationRecipe.maxWidth}px`
          : "none",
        "--hjm-bottom-navigation-outer-inline": `${presentationRecipe.outerPaddingHorizontal}px`,
        "--hjm-bottom-navigation-outer-top": `${presentationRecipe.outerPaddingTop}px`,
        ...style,
      } as CSSProperties}
    >
      <div className="hjm-bottom-navigation__surface">
        <ul className="hjm-bottom-navigation__list">
          {resolved.items.map((item, index) => {
            const selected = item.id === resolved.selectedKey;
            const content = (
              <>
                <span
                  aria-hidden="true"
                  className="hjm-bottom-navigation__indicator"
                  data-state={selected ? "selected" : "idle"}
                >
                  {renderIcon({
                    item,
                    name: item.icon.name,
                    selected,
                    color: "currentColor",
                    size: iconSize,
                    strokeWidth: selected
                      ? bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.selected
                      : bottomNavigationRecipe.icon.selectedEmphasis.strokeWidth.idle,
                    scale: selected
                      ? bottomNavigationRecipe.icon.selectedEmphasis.scale.selected
                      : bottomNavigationRecipe.icon.selectedEmphasis.scale.idle,
                  })}
                  {item.badge ? (
                    <span aria-hidden="true" className="hjm-bottom-navigation__badge">
                      {item.badge.visibleLabel}
                    </span>
                  ) : null}
                </span>
                <span className="hjm-bottom-navigation__label">{item.label}</span>
              </>
            );
            const itemStyle = {
              gridColumn: getBottomNavigationGridColumn(
                index,
                resolved.items.length,
                presentation.distribution,
              ),
            };
            if (item.disabled) {
              return (
                <li key={item.id} style={itemStyle}>
                  <span
                    aria-disabled="true"
                    aria-label={item.resolvedAccessibilityLabel}
                    className="hjm-bottom-navigation__item"
                    data-state="disabled"
                    role="link"
                  >
                    {content}
                  </span>
                </li>
              );
            }
            const href = getHref(item);
            if (!href.trim()) {
              throw new TypeError(`BottomNavigation href must not be empty: ${item.id}`);
            }
            const linkProps: BottomNavigationLinkRenderProps = {
              "aria-current": selected ? "page" : undefined,
              "aria-label": item.resolvedAccessibilityLabel,
              className: "hjm-bottom-navigation__item",
              "data-state": selected ? "selected" : "idle",
              href,
              onClick: (event) => {
                if (!isUnmodifiedPrimaryBottomNavigationClick(event)) return;
                const activation = resolveBottomNavigationActivation(descriptor, item.id);
                if (activation) onActivate?.(activation);
              },
              children: content,
            };
            return (
              <li key={item.id} style={itemStyle}>
                {renderLink ? renderLink(linkProps) : <a {...linkProps} />}
              </li>
            );
          })}
        </ul>
        {primaryAction ? (
          <div className="hjm-bottom-navigation__primary-action">{primaryAction}</div>
        ) : null}
      </div>
    </nav>
  );
}

export const BottomNavigation = forwardRef(BottomNavigationInner) as <
  Key extends string = string,
  IconName extends string = string,
>(
  props: BottomNavigationProps<Key, IconName> & RefAttributes<HTMLElement>,
) => ReactElement | null;
