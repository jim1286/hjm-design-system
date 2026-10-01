import {
  sidebarDefaults,
  sidebarRecipe,
  validateSidebarDescriptor,
  type SidebarDescriptor,
  type SidebarItemDescriptor,
} from "@hjmds/design-contracts/components/sidebar";
import {
  forwardRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useOptionalHjmTheme } from "./provider.js";
import { classNames, useControllableState } from "./internal.js";

export type SidebarAppearance = "standard" | "bounce" | "hook" | "proximity";

export type SidebarProps<Id extends string = string, GroupId extends string = string> = Readonly<{
  descriptor: SidebarDescriptor<Id, GroupId>;
  /** Decoration only; link hit areas and document-order keyboard navigation stay fixed. */
  appearance?: SidebarAppearance;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Localized names for the collapse control in both states. */
  collapseLabels?: Readonly<{ collapse: string; expand: string }>;
  onNavigate?: (id: Id) => void;
  /** Product-owned icon per item; required for the collapsed rail to stay usable. */
  renderIcon?: (item: SidebarItemDescriptor<Id>) => ReactNode;
  renderBadge?: (count: number, item: SidebarItemDescriptor<Id>) => ReactNode;
  className?: string;
}>;

export const Sidebar = forwardRef(function Sidebar<Id extends string = string, GroupId extends string = string>(
  {
    descriptor,
    appearance = "standard",
    collapsed: controlledCollapsed,
    defaultCollapsed,
    onCollapsedChange,
    collapseLabels,
    onNavigate,
    renderIcon,
    renderBadge,
    className,
  }: SidebarProps<Id, GroupId>,
  forwardedRef: React.Ref<HTMLElement>,
) {
  validateSidebarDescriptor(descriptor);
  const theme = useOptionalHjmTheme();
  const animate = theme !== null && !theme.environment.reducedMotion;
  const [activatedId, setActivatedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useControllableState<boolean>({
    ...(controlledCollapsed === undefined ? {} : { value: controlledCollapsed }),
    defaultValue: defaultCollapsed ?? sidebarDefaults.collapsed,
    ...(onCollapsedChange === undefined ? {} : { onChange: onCollapsedChange }),
  });
  return (
    <nav
      ref={forwardedRef}
      aria-label={descriptor.accessibilityLabel}
      className={classNames("hjm-sidebar", className)}
      data-collapsed={collapsed || undefined}
      data-appearance={appearance}
      data-animate={animate || undefined}
      onPointerMove={event => {
        if (appearance !== "proximity" || !animate || event.pointerType === "touch") return;
        // Only icon decoration responds to distance; moving links would shift click/focus targets.
        for (const item of event.currentTarget.querySelectorAll<HTMLElement>(".hjm-sidebar__item")) {
          const bounds = item.getBoundingClientRect();
          const distance = Math.abs(event.clientY - (bounds.top + bounds.height / 2));
          const proximity = item.getAttribute("aria-disabled") === "true" ? 0 : Math.max(0, 1 - distance / (bounds.height * 2));
          item.style.setProperty("--hjm-sidebar-proximity", String(proximity));
        }
      }}
      onPointerLeave={event => {
        for (const item of event.currentTarget.querySelectorAll<HTMLElement>(".hjm-sidebar__item")) item.style.removeProperty("--hjm-sidebar-proximity");
      }}
      style={{
        "--hjm-sidebar-width": `${collapsed ? sidebarRecipe.widths.collapsed : sidebarRecipe.widths.expanded}px`,
        "--hjm-sidebar-item-height": `${sidebarRecipe.itemMinHeight}px`,
        "--hjm-sidebar-item-radius": `${sidebarRecipe.itemRadius}px`,
        "--hjm-sidebar-gap": `${sidebarRecipe.gap}px`,
        "--hjm-sidebar-group-gap": `${sidebarRecipe.groupGap}px`,
      } as CSSProperties}
    >
      {collapseLabels ? (
        <button
          type="button"
          className="hjm-sidebar__toggle"
          aria-expanded={!collapsed}
          aria-label={collapsed ? collapseLabels.expand : collapseLabels.collapse}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span aria-hidden="true">{collapsed ? "»" : "«"}</span>
        </button>
      ) : null}
      {descriptor.groups.map((group) => (
        <div key={group.id} className="hjm-sidebar__group" role="group" aria-label={group.label}>
          {/*
            Collapsing is density, not content: the group label is hidden
            visually but the group keeps its accessible name.
          */}
          {group.label ? <p className="hjm-sidebar__group-label" aria-hidden="true">{group.label}</p> : null}
          <ul className="hjm-sidebar__list">
            {group.items.map((item) => {
              const current = descriptor.currentId === item.id;
              return (
                <li key={item.id}>
                  <a
                    className="hjm-sidebar__item"
                    href={item.destination?.kind === "internal" ? item.destination.href : item.destination?.href}
                    aria-current={current ? "page" : undefined}
                    data-bounce={current && activatedId === item.id || undefined}
                    aria-disabled={item.disabled || undefined}
                    // Collapsed labels are hidden visually, so the name comes
                    // from the attribute instead of disappearing with the text.
                    aria-label={collapsed ? item.label : undefined}
                    tabIndex={item.disabled ? -1 : undefined}
                    onClick={(event) => {
                      if (item.disabled) { event.preventDefault(); return; }
                      if (appearance === "bounce" && animate) setActivatedId(item.id);
                      onNavigate?.(item.id);
                    }}
                  >
                    {renderIcon ? <span aria-hidden="true" className="hjm-sidebar__icon">{renderIcon(item)}</span> : null}
                    <span className="hjm-sidebar__label">{item.label}</span>
                    {item.badgeCount !== undefined ? (
                      <span className="hjm-sidebar__badge">{renderBadge?.(item.badgeCount, item) ?? item.badgeCount}</span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}) as <Id extends string = string, GroupId extends string = string>(
  props: SidebarProps<Id, GroupId> & { ref?: React.Ref<HTMLElement> },
) => React.ReactElement | null;
