"use client";

import { useState, type ReactNode } from "react";
import { resolveChoiceRow, type ChoiceRowItem as ChoiceRowItemContract } from "@hjmds/design-contracts/choice-row";
import type { ListRowDensity } from "@hjmds/design-contracts/recipes";
import { ListRow } from "./display.js";
import { Sheet } from "./overlays.js";
import { RadioGroup } from "./selection.js";

/**
 * A choice. `leading` is the product picture for that choice (theme artwork, flag); the sheet draws it in the
 * recipe-owned box (choiceRowRecipe.itemLeading) and the row shows the confirmed choice's picture unless the row
 * gets its own `leading` (2026-10-23 utilverse shell theme row).
 */
export type ChoiceRowItem<Value extends string = string> = ChoiceRowItemContract<Value> & Readonly<{ leading?: ReactNode }>;
/** A synchronous save closes the sheet at once. Only an async save can fail inside the sheet, so only it needs
 * `errorLabel`; a rejected promise keeps the sheet open with that message (2026-10-23 product adoption). */
export type ChoiceRowSave<Value extends string = string> =
  | Readonly<{ onValueChange: (value: Value) => void; errorLabel?: never }>
  | Readonly<{ onValueChange: (value: Value) => Promise<void>; errorLabel: string }>;
export type ChoiceRowProps<Value extends string = string> = ChoiceRowSave<Value> & Readonly<{
  title: string;
  items: readonly ChoiceRowItem<Value>[];
  /** The product-confirmed value; update it only after the save succeeds. */
  value: Value | null;
  closeLabel: string;
  sheetTitle?: string;
  sheetDescription?: string;
  placeholder?: string;
  /** Row picture; defaults to the confirmed item's `leading`. */
  leading?: ReactNode;
  trailing?: ReactNode;
  /** ListRow density, so the row matches the surrounding settings rows. */
  density?: ListRowDensity;
  disabled?: boolean;
  loading?: boolean;
}>;

export function ChoiceRow<Value extends string = string>(props: ChoiceRowProps<Value>) {
  const { title, items, value, closeLabel, errorLabel, sheetTitle, sheetDescription, placeholder, leading, trailing, density, disabled = false, loading = false } = props;
  const { selected, valueLabel } = resolveChoiceRow({ title, items, value, ...(placeholder === undefined ? {} : { placeholder }) });
  if (!closeLabel.trim() || (errorLabel !== undefined && !errorLabel.trim())) throw new TypeError("ChoiceRow text must not be empty");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const choose = (raw: string) => {
    // RadioGroup only offers the values passed in `items`, so the string is one of `Value`.
    const next = raw as Value;
    if (next === value || pending) return;
    setFailed(false);
    const result: void | Promise<void> = props.onValueChange(next);
    if (!result) { setOpen(false); return; }
    setPending(true);
    result.then(() => { setPending(false); setOpen(false); }, () => { setPending(false); setFailed(true); });
  };
  const rowLeading = leading ?? items.find((item) => item.value === selected?.value)?.leading;
  const pictured = items.some((item) => item.leading != null);
  const byValue = new Map(items.map((item) => [item.value as string, item]));
  return <>
    <ListRow title={title} description={valueLabel} {...(rowLeading == null ? {} : { leading: rowLeading })} {...(trailing === undefined ? {} : { trailing })} {...(density === undefined ? {} : { density })} disabled={disabled} loading={loading}
      aria-haspopup="dialog" aria-expanded={open}
      onClick={() => { setFailed(false); setOpen(true); }} />
    <Sheet open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }} title={sheetTitle ?? title} closeLabel={closeLabel} busy={pending}
      {...(sheetDescription === undefined ? {} : { description: sheetDescription })}>
      <RadioGroup accessibilityLabel={sheetTitle ?? title} orientation="vertical" value={value} items={items} disabled={pending}
        {...(failed && errorLabel !== undefined ? { error: errorLabel } : {})} onValueChange={choose}
        {...(pictured ? { renderLeading: (item: { value: string }) => <span className="hjm-choice-row__item-leading">{byValue.get(item.value)?.leading}</span> } : {})} />
    </Sheet>
  </>;
}
