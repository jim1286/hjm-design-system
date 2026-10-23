"use client";

import { layer } from "@hjmds/design-contracts/foundations";
import {
  menubarRecipe,
  resolveMenubarNavigation,
  validateMenubarDescriptor,
  type MenubarDescriptor,
} from "@hjmds/design-contracts/components/menubar";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { classNames, useControllableState } from "./internal.js";
import { AnchoredPortal, useAnchoredPopup } from "./portal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type MenubarProps<Key extends string = string, MenuKey extends string = string> = Readonly<{
  descriptor: MenubarDescriptor<Key, MenuKey>;
  openMenuId?: MenuKey | null;
  defaultOpenMenuId?: MenuKey | null;
  onOpenMenuIdChange?: (id: MenuKey | null) => void;
  onAction: (id: Key, menuId: MenuKey) => void;
  className?: string;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export function Menubar<Key extends string = string, MenuKey extends string = string>({
  descriptor,
  openMenuId: controlledOpen,
  defaultOpenMenuId,
  onOpenMenuIdChange,
  onAction,
  className,
  layoutStyle,
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
  const focusedNode = useRef<HTMLButtonElement | null>(null);
  const previousMenuIds = useRef(descriptor.menus.map(menu => menu.id));
  const fallbackIndex = Math.min(Math.max(0, previousMenuIds.current.indexOf(focusedId)), Math.max(0, enabledMenus.length - 1));
  const resolvedFocusedId = enabledMenus.some(menu => menu.id === focusedId) ? focusedId : enabledMenus[fallbackIndex]?.id;
  const openMenu = descriptor.menus.find((menu) => menu.id === openId && !menu.disabled) ?? null;
  const effectiveOpenId = openMenu?.id ?? null;
  const openItems = openMenu?.items.filter((item) => item.disabled !== true) ?? [];
  const resolvedItemIndex = Math.min(activeItemIndex, Math.max(0, openItems.length - 1));
  useLayoutEffect(() => {
    previousMenuIds.current = descriptor.menus.map(menu => menu.id);
    if (resolvedFocusedId !== focusedId) {
      if (resolvedFocusedId !== undefined) setFocusedId(resolvedFocusedId);
      // Removing/disabling the focused label must leave a usable keyboard origin.
      if (focusedNode.current && (document.activeElement === document.body || document.activeElement === focusedNode.current)) {
        (resolvedFocusedId === undefined ? rootRef.current : labelRefs.current.get(resolvedFocusedId))?.focus();
      }
    }
    if (openId !== null && effectiveOpenId === null) setOpenId(null);
    if (resolvedItemIndex !== activeItemIndex) setActiveItemIndex(resolvedItemIndex);
  }, [descriptor.menus, resolvedFocusedId, focusedId, openId, effectiveOpenId, setOpenId, resolvedItemIndex, activeItemIndex]);
  // The panel was absolute inside the bar, so any overflow ancestor clipped it
  // (2026-09-30 audit WR-0930-4: at 1100px an item could not be hit). It now uses
  // the same portal + fixed positioning as Menu; focus stays on the bar label.
  const panelId = `${useId().replaceAll(":", "")}-menubar-panel`;
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);
  const setPanelRef = useCallback((node: HTMLDivElement | null) => setPanelNode(node), []);
  const openLabelRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({ get current() { return openId === null ? null : labelRefs.current.get(openId) ?? null; } }),
    [openId],
  );
  const panelPosition = useAnchoredPopup(openLabelRef, panelNode, { gap: 0, zIndex: layer.dropdown });

  useEffect(() => {
    if (openId === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && (rootRef.current?.contains(event.target) || panelNode?.contains(event.target))) return;
      setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId, panelNode, setOpenId]);

  const focusLabel = (id: MenuKey) => {
    setFocusedId(id);
    labelRefs.current.get(id)?.focus();
  };
  const move = (direction: "next" | "previous") => {
    const next = resolveMenubarNavigation(descriptor, resolvedFocusedId ?? focusedId, direction);
    focusLabel(next);
    // Left/right while a menu is open moves to the neighbour already open, which
    // is the whole reason this is a bar and not three independent Menus.
    if (effectiveOpenId !== null) { setOpenId(next); setActiveItemIndex(0); }
  };

  return (
    <div
      ref={rootRef}
      role="menubar"
      tabIndex={enabledMenus.length === 0 ? 0 : undefined}
      aria-label={descriptor.accessibilityLabel}
      className={classNames("hjm-menubar", className)}
      style={{ ...layoutStyle,
        "--hjm-menubar-min-height": `${menubarRecipe.minHeight}px`,
        "--hjm-menubar-gap": `${menubarRecipe.gap}px`,
        "--hjm-menubar-padding": `${menubarRecipe.paddingHorizontal}px`,
        "--hjm-menubar-label-padding": `${menubarRecipe.label.paddingHorizontal}px`,
        // Consume the label sm role through CSS inheritance, retaining standalone recipe geometry.
        "--hjm-menubar-label-radius": `var(--hjm-radius-sm, ${menubarRecipe.label.radius}px)`,
      } as CSSProperties}
      onKeyDown={(event) => {
        if (resolvedFocusedId === undefined) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        if (event.key === "ArrowRight") { event.preventDefault(); move(rtl ? "previous" : "next"); return; }
        if (event.key === "ArrowLeft") { event.preventDefault(); move(rtl ? "next" : "previous"); return; }
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          const target = (event.key === "Home" ? enabledMenus[0] : enabledMenus.at(-1))?.id;
          if (target !== undefined) { focusLabel(target); if (effectiveOpenId !== null) { setOpenId(target); setActiveItemIndex(0); } }
          return;
        }
        if (event.key === "Escape" && effectiveOpenId !== null) {
          event.preventDefault();
          setOpenId(null);
          focusLabel(resolvedFocusedId);
          return;
        }
        if (effectiveOpenId === null) {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpenId(resolvedFocusedId);
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
          const item = openItems[resolvedItemIndex];
          if (item) {
            onAction(item.id as Key, effectiveOpenId);
            // Activation runs an action and leaves nothing selected — unlike Tabs.
            setOpenId(null);
            focusLabel(effectiveOpenId);
          }
        }
      }}
    >
      {descriptor.menus.map((menu) => {
        const open = menu.id === effectiveOpenId;
        return (
          <div key={menu.id} className="hjm-menubar__menu">
            <button
              type="button"
              ref={(node) => { if (node) labelRefs.current.set(menu.id, node); else labelRefs.current.delete(menu.id); }}
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              disabled={menu.disabled}
              tabIndex={menu.id === resolvedFocusedId ? 0 : -1}
              onFocus={(event) => { focusedNode.current = event.currentTarget; setFocusedId(menu.id); }}
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
                if (effectiveOpenId !== null && menu.disabled !== true) { setOpenId(menu.id); setFocusedId(menu.id); setActiveItemIndex(0); }
              }}
            >
              {menu.label}
            </button>
            {open ? (
              <AnchoredPortal anchorRef={openLabelRef} ssrFallback="inline">
              <div ref={setPanelRef} id={panelId} role="menu" aria-label={menu.label} className="hjm-menubar__panel" data-placement={panelPosition.placement} style={panelPosition.style}>
                {menu.items.map((item) => {
                  // Popup positioning can cause mouseenter under a stationary
                  // cursor. Only movement should replace a keyboard choice.
                  const index = openItems.findIndex((candidate) => candidate.id === item.id);
                  return (
                    <div
                      key={item.id}
                      role="menuitem"
                      aria-disabled={item.disabled || undefined}
                      data-active={index === resolvedItemIndex && item.disabled !== true ? "" : undefined}
                      data-tone={item.tone}
                      className="hjm-menubar__item"
                      onMouseMove={() => { if (index >= 0) setActiveItemIndex(index); }}
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
              </AnchoredPortal>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
