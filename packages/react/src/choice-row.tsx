import { useState, type ReactNode } from "react";
import { resolveChoiceRow, type ChoiceRowItem } from "@hjmds/design-contracts/choice-row";
import { ListRow } from "./display.js";
import { Sheet } from "./overlays.js";
import { RadioGroup } from "./selection.js";

export type { ChoiceRowItem } from "@hjmds/design-contracts/choice-row";
export type ChoiceRowProps<Value extends string = string> = Readonly<{
  title: string;
  items: readonly ChoiceRowItem<Value>[];
  /** The product-confirmed value; update it only after the save succeeds. */
  value: Value | null;
  /** A returned promise keeps the sheet open and busy; rejection keeps it open with `errorLabel`. */
  onValueChange: (value: Value) => void | Promise<void>;
  closeLabel: string;
  errorLabel: string;
  sheetTitle?: string;
  sheetDescription?: string;
  placeholder?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}>;

export function ChoiceRow<Value extends string = string>({ title, items, value, onValueChange, closeLabel, errorLabel, sheetTitle, sheetDescription, placeholder, leading, trailing, disabled = false, loading = false }: ChoiceRowProps<Value>) {
  const { valueLabel } = resolveChoiceRow({ title, items, value, ...(placeholder === undefined ? {} : { placeholder }) });
  if (!closeLabel.trim() || !errorLabel.trim()) throw new TypeError("ChoiceRow text must not be empty");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const choose = (raw: string) => {
    // RadioGroup only offers the values passed in `items`, so the string is one of `Value`.
    const next = raw as Value;
    if (next === value || pending) return;
    setFailed(false);
    const result = onValueChange(next);
    if (!result) { setOpen(false); return; }
    setPending(true);
    result.then(() => { setPending(false); setOpen(false); }, () => { setPending(false); setFailed(true); });
  };
  return <>
    <ListRow title={title} description={valueLabel} {...(leading === undefined ? {} : { leading })} {...(trailing === undefined ? {} : { trailing })} disabled={disabled} loading={loading}
      onClick={() => { setFailed(false); setOpen(true); }} />
    <Sheet open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }} title={sheetTitle ?? title} closeLabel={closeLabel} busy={pending}
      {...(sheetDescription === undefined ? {} : { description: sheetDescription })}>
      <RadioGroup accessibilityLabel={sheetTitle ?? title} orientation="vertical" value={value} items={items} disabled={pending}
        {...(failed ? { error: errorLabel } : {})} onValueChange={choose} />
    </Sheet>
  </>;
}
