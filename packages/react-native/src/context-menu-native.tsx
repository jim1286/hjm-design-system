import * as ContextMenu from "zeego/context-menu";
import type { ReactElement } from "react";

export type NativeContextMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  tone?: "default" | "danger";
};
export type NativeContextMenuProps = {
  /** Pass an accessible native host with the product's localized label. */
  children: ReactElement;
  items: readonly NativeContextMenuItem[];
  onAction: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
};

/** OS-owned long-press actions; the default Menu remains free of native modules. */
export function NativeContextMenu({ children, items, onAction, onOpenChange }: NativeContextMenuProps) {
  if (!items.length || new Set(items.map(item => item.id)).size !== items.length ||
    items.some(item => !item.id.trim() || !item.label.trim())) throw new TypeError("NativeContextMenu needs unique, named items");
  return <ContextMenu.Root {...(onOpenChange ? { onOpenChange } : {})}>
    <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
    <ContextMenu.Content>
      {items.map(item => <ContextMenu.Item key={item.id} textValue={item.label}
        disabled={item.disabled ?? false} destructive={item.tone === "danger"}
        onSelect={() => { if (!item.disabled) onAction(item.id); }}>
        <ContextMenu.ItemTitle>{item.label}</ContextMenu.ItemTitle>
      </ContextMenu.Item>)}
    </ContextMenu.Content>
  </ContextMenu.Root>;
}
