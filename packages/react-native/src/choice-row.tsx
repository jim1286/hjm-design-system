import { useState, type ReactNode } from "react";
import { resolveChoiceRow, type ChoiceRowItem } from "@hjmds/design-contracts/choice-row";
import type { ListRowDensity } from "@hjmds/design-contracts/recipes";
import { ListRow } from "./data-display.js";
import { RadioGroup } from "./inputs.js";
import { Sheet } from "./overlays.js";

export type { ChoiceRowItem } from "@hjmds/design-contracts/choice-row";
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
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Spoken result of activating the row, e.g. "Opens the language list". */
  accessibilityHint?: string;
  /** ListRow density, so the row matches the surrounding settings rows. */
  density?: ListRowDensity;
  disabled?: boolean;
  loading?: boolean;
}>;

export function ChoiceRow<Value extends string = string>(props: ChoiceRowProps<Value>) {
  const { title, items, value, closeLabel, errorLabel, sheetTitle, sheetDescription, placeholder, leading, trailing, accessibilityHint, density, disabled = false, loading = false } = props;
  const { valueLabel } = resolveChoiceRow({ title, items, value, ...(placeholder === undefined ? {} : { placeholder }) });
  if (!closeLabel.trim() || (errorLabel !== undefined && !errorLabel.trim())) throw new TypeError("ChoiceRow text must not be empty");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const choose = (next: Value | null) => {
    if (next === null || next === value || pending) return;
    setFailed(false);
    const result: void | Promise<void> = props.onValueChange(next);
    if (!result) { setOpen(false); return; }
    setPending(true);
    result.then(() => { setPending(false); setOpen(false); }, () => { setPending(false); setFailed(true); });
  };
  return <>
    <ListRow title={title} description={valueLabel} {...(leading === undefined ? {} : { leading })} {...(trailing === undefined ? {} : { trailing })} {...(density === undefined ? {} : { density })} disabled={disabled} loading={loading}
      accessibilityState={{ expanded: open }} {...(accessibilityHint === undefined ? {} : { accessibilityHint })}
      onPress={() => { setFailed(false); setOpen(true); }} />
    <Sheet open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }} title={sheetTitle ?? title} closeLabel={closeLabel} busy={pending}
      // Locale and region lists outgrow the screen; the header stays fixed while the choices scroll.
      scrollable
      {...(sheetDescription === undefined ? {} : { description: sheetDescription })}>
      <RadioGroup accessibilityLabel={sheetTitle ?? title} orientation="vertical" value={value} items={items} disabled={pending}
        {...(failed && errorLabel !== undefined ? { error: errorLabel } : {})} onValueChange={choose} />
    </Sheet>
  </>;
}
