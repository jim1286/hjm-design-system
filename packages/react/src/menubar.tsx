import {
  menubarRecipe,
  resolveMenubarNavigation,
  validateMenubarDescriptor,
  type MenubarDescriptor,
} from "@hjmds/design-contracts/components/menubar";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { classNames, useControllableState } from "./internal.js";

export type MenubarProps<Key extends string = string, MenuKey extends string = string> = Readonly<{
  descriptor: MenubarDescriptor<Key, MenuKey>;
  openMenuId?: MenuKey | null;
  defaultOpenMenuId?: MenuKey | null;
  onOpenMenuIdChange?: (id: MenuKey | null) => void;
  onAction: (id: Key, menuId: MenuKey) => void;
  className?: string;
}>;

export function Menubar<Key extends string = string, MenuKey extends string = string>({
  descriptor,
  openMenuId: controlledOpen,
  defaultOpenMenuId,
  onOpenMenuIdChange,
  onAction,
  className,
}: MenubarProps<Key, MenuKey>) {
  validateMenubarDescriptor(descriptor);
  const [openId, setOpenId] = useControllableState<MenuKey | null>({
    ...(controlledOpen === undefined ? {} : { value: controlledOpen }),
    defaultValue: defaultOpenMenuId ?? null,
    ...(onOpenMenuIdChange === undefined ? {} : { onChange: onOpenMenuIdChange }),
  });
  const enabledMenus = descriptor.menus.filter((menu) => menu.disabled !== true);
  // Roving focus: the bar is one tab stop, so the bar — not each label — owns
  // which menu is reachable by Tab.
  const [focusedId, setFocusedId] = useState<MenuKey>(enabledMenus[0]?.id ?? descriptor.menus[0]!.id);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef(new Map<MenuKey, HTMLButtonElement>());
  const openMenu = descriptor.menus.find((menu) => menu.id === openId) ?? null;
  const openItems = openMenu?.items.filter((item) => item.disabled !== true) ?? [];

  useEffect(() => {
    if (openId === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId, setOpenId]);

  const focusLabel = (id: MenuKey) => {
    setFocusedId(id);
    labelRefs.current.get(id)?.focus();
  };
  const move = (direction: "next" | "previous") => {
    const next = resolveMenubarNavigation(descriptor, focusedId, direction);
    focusLabel(next);
    // Left/right while a menu is open moves to the neighbour already open, which
    // is the whole reason this is a bar and not three independent Menus.
    if (openId !== null) { setOpenId(next); setActiveItemIndex(0); }
  };

  return (
    <div
      ref={rootRef}
      role="menubar"
      aria-label={descriptor.accessibilityLabel}
      className={classNames("hjm-menubar", className)}
      style={{
        "--hjm-menubar-min-height": `${menubarRecipe.minHeight}px`,
        "--hjm-menubar-gap": `${menubarRecipe.gap}px`,
        "--hjm-menubar-padding": `${menubarRecipe.paddingHorizontal}px`,
        "--hjm-menubar-label-padding": `${menubarRecipe.label.paddingHorizontal}px`,
        "--hjm-menubar-label-radius": `${menubarRecipe.label.radius}px`,
      } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); move("next"); return; }
        if (event.key === "ArrowLeft") { event.preventDefault(); move("previous"); return; }
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          const target = (event.key === "Home" ? enabledMenus[0] : enabledMenus.at(-1))?.id;
          if (target !== undefined) { focusLabel(target); if (openId !== null) { setOpenId(target); setActiveItemIndex(0); } }
          return;
        }
        if (event.key === "Escape" && openId !== null) {
          event.preventDefault();
          setOpenId(null);
          focusLabel(focusedId);
          return;
        }
        if (openId === null) {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpenId(focusedId);
            setActiveItemIndex(0);
          }
          return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setActiveItemIndex((previous) => {
            const next = event.key === "ArrowDown" ? previous + 1 : previous - 1;
            return (next + openItems.length) % Math.max(openItems.length, 1);
          });
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const item = openItems[activeItemIndex];
          if (item) {
            onAction(item.id as Key, openId);
            // Activation runs an action and leaves nothing selected — unlike Tabs.
            setOpenId(null);
            focusLabel(openId);
          }
        }
      }}
    >
      {descriptor.menus.map((menu) => {
        const open = menu.id === openId;
        return (
          <div key={menu.id} className="hjm-menubar__menu">
            <button
              type="button"
              ref={(node) => { if (node) labelRefs.current.set(menu.id, node); else labelRefs.current.delete(menu.id); }}
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={open}
              disabled={menu.disabled}
              tabIndex={menu.id === focusedId ? 0 : -1}
              data-open={open || undefined}
              className="hjm-menubar__label"
              onClick={() => {
                setFocusedId(menu.id);
                setOpenId(open ? null : menu.id);
                setActiveItemIndex(0);
              }}
              onMouseEnter={() => {
                // Once one menu is open, hovering the bar switches menus — the
                // desktop convention; with nothing open, hover opens nothing.
                if (openId !== null && menu.disabled !== true) { setOpenId(menu.id); setFocusedId(menu.id); setActiveItemIndex(0); }
              }}
            >
              {menu.label}
            </button>
            {open ? (
              <div role="menu" aria-label={menu.label} className="hjm-menubar__panel">
                {menu.items.map((item) => {
                  const index = openItems.findIndex((candidate) => candidate.id === item.id);
                  return (
                    <div
                      key={item.id}
                      role="menuitem"
                      aria-disabled={item.disabled || undefined}
                      data-active={index === activeItemIndex && item.disabled !== true ? "" : undefined}
                      data-tone={item.tone}
                      className="hjm-menubar__item"
                      onMouseEnter={() => { if (index >= 0) setActiveItemIndex(index); }}
                      onClick={() => {
                        if (item.disabled) return;
                        onAction(item.id as Key, menu.id);
                        setOpenId(null);
                        focusLabel(menu.id);
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut ? <kbd className="hjm-menubar__shortcut">{item.shortcut}</kbd> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
