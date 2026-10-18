import type { ReactNode } from "react";

/**
 * One error contract for every Field-based control (Field, TextField, TextArea, Select, NumberField,
 * CheckboxGroup, RadioGroup and the composers built on them).
 *
 * A live region only announces changes to content it already contains, so the region is mounted before
 * the first error and stays mounted: each new or changed error is announced assertively, matching
 * Native's FieldMessage (Android live region, iOS announcement). The region carries the error id, so
 * `aria-describedby` on the control reads the same node when it is focused.
 *
 * The visible copy is hidden from assistive technology: before 1.31 MessageComposer added its own hidden
 * alert next to the visible error and browse mode read the text twice (2026-10-18). The region is
 * visually hidden and absolutely positioned, so it adds no row or gap to the field grid.
 */
export function FieldError({ id, error }: Readonly<{ id?: string | undefined; error?: ReactNode }>) {
  const hasError = error !== undefined && error !== null && error !== false && error !== "";
  return (
    <>
      {hasError ? <div className="hjm-field__error" aria-hidden="true">{error}</div> : null}
      <span {...(id === undefined ? {} : { id })} role="alert" className="hjm-visually-hidden" data-hjm-field-error="">
        {hasError ? error : null}
      </span>
    </>
  );
}
