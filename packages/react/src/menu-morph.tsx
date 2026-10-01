import { resolveMenuTypeahead } from "./menu-typeahead.js";
import { Menu as Bloom } from "bloom-menu";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "./actions.js";
import { Menu, type MenuItem } from "./overlays.js";
import { useHjmTheme } from "./provider.js";

export type MorphingMenuProps = {
  label: string;
  items: readonly MenuItem[];
  onAction?: (id: string) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Action-only morph presentation. Selection/async menus retain the full Menu. */
export function MorphingMenu({ label, items, onAction, disabled = false, open: controlled, onOpenChange }: MorphingMenuProps) {
  const theme = useHjmTheme();
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlled ?? localOpen;
  const root = useRef<HTMLDivElement>(null);
  const previousOpen = useRef(false);
  const restoreFocus = useRef(true);
  const search = useRef({ value: "", time: 0 });
  const change = (value: boolean) => { if (value) restoreFocus.current = true; setLocalOpen(value); onOpenChange?.(value); };
  if (!label.trim() || !items.length || new Set(items.map(item => item.id)).size !== items.length ||
    items.some(item => !item.id.trim() || !(item.textValue ?? (typeof item.label === "string" ? item.label : "")).trim())) {
    throw new TypeError("MorphingMenu needs a label and unique, named items");
  }
  useEffect(() => {
    const host = root.current;
    if (open) {
      search.current = { value: "", time: 0 };
      host?.querySelector('[role="menu"]')?.setAttribute("aria-label", label);
      host?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
    } else if (previousOpen.current && restoreFocus.current && (host?.contains(document.activeElement) || document.activeElement === document.body)) host?.querySelector<HTMLElement>('[role="button"]')?.focus();
    previousOpen.current = open;
  }, [open, label]);
  // The canonical Menu owns static/RTL behavior; Bloom's left/right geometry is physical.
  if (theme.environment.reducedMotion || theme.environment.direction === "rtl") {
    return <Menu label={label} trigger={<Button tone="secondary">{label}</Button>} items={items} disabled={disabled} open={open}
      onOpenChange={change} {...(onAction ? { onAction } : {})} />;
  }
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      if (!disabled && ["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); change(true); }
      return;
    }
    const nodes = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    let next: number | undefined;
    if (event.key === "ArrowDown") next = (index + 1) % nodes.length;
    if (event.key === "ArrowUp") next = (index - 1 + nodes.length) % nodes.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = nodes.length - 1;
    if (event.key === "Escape" || event.key === "Tab") { if (event.key === "Tab") restoreFocus.current = false; change(false); if (event.key === "Escape") event.preventDefault(); }
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey && event.key !== " ") {
      const result = resolveMenuTypeahead(
        items.filter(item => !item.disabled).map(item => ({
          textValue: item.textValue ?? (typeof item.label === "string" ? item.label : ""),
        })), index, event.key, search.current, Date.now(),
      );
      search.current = result.state;
      next = result.index;
    }
    if (next !== undefined && next >= 0) { event.preventDefault(); event.stopPropagation(); nodes[next]?.focus(); }
  };
  return <div ref={root} className="hjm-menu-morph" onKeyDownCapture={keyDown}>
    {/* Open toward following content; upstream defaults upward and can cover preceding values. */}
    <Bloom.Root direction="bottom" open={open} onOpenChange={change} modal={false}>
      <Bloom.Container buttonSize={{ width: 160, height: 44 }} menuWidth={240}
        style={{ background: theme.palette.theme.bg, color: theme.palette.theme.text }}>
        <Bloom.Trigger disabled={disabled}>{label}</Bloom.Trigger>
        <Bloom.Content>
          {items.map(item => <button type="button" role="menuitem" tabIndex={-1} className="hjm-menu-morph__item" key={item.id} disabled={!open || (item.disabled ?? false)}
            data-tone={item.tone} aria-label={item.textValue}
            onClick={() => { if (!item.disabled) { change(false); onAction?.(item.id); } }}>
            {item.leading}{item.label}{item.trailing}
          </button>)}
        </Bloom.Content>
      </Bloom.Container>
    </Bloom.Root>
  </div>;
}
