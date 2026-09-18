import {
  sidebarDefaults,
  sidebarRecipe,
  validateSidebarDescriptor,
  type SidebarDescriptor,
  type SidebarItemDescriptor,
} from "@hjmds/design-contracts/components/sidebar";
import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { classNames, useControllableState } from "./internal.js";

export type SidebarProps<Id extends string = string, GroupId extends string = string> = Readonly<{
  descriptor: SidebarDescriptor<Id, GroupId>;
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
                    aria-disabled={item.disabled || undefined}
                    // Collapsed labels are hidden visually, so the name comes
                    // from the attribute instead of disappearing with the text.
                    aria-label={collapsed ? item.label : undefined}
                    tabIndex={item.disabled ? -1 : undefined}
                    onClick={(event) => {
                      if (item.disabled) { event.preventDefault(); return; }
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
