import {
  reconcileAgreementSelection,
  resolveAgreementState,
  toggleAgreementAll,
  toggleAgreementItem,
  validateAgreementDescriptor,
  type AgreementDescriptor,
  type AgreementState,
} from "@hjmds/design-contracts/components/agreement";
import { forwardRef, useId, useMemo } from "react";
import { classNames, useControllableState } from "./internal.js";

export type AgreementProps<Id extends string = string> = Readonly<{
  descriptor: AgreementDescriptor<Id>;
  checkedIds?: ReadonlySet<Id>;
  defaultCheckedIds?: ReadonlySet<Id>;
  onCheckedIdsChange?: (ids: ReadonlySet<Id>) => void;
  /** Fires the derived state on every change, for a submit button to read. */
  onStateChange?: (state: AgreementState<Id>) => void;
  /** Called when an item's full text is requested and it carries no href. */
  onDetail?: (id: Id) => void;
  /** Localized suffix marking a required row, supplied by the product. */
  requiredLabel: string;
  /** Localized suffix marking an optional row, supplied by the product. */
  optionalLabel: string;
  className?: string;
}>;

function Mark({ state }: { state: boolean | "mixed" }) {
  return (
    <span aria-hidden="true" className="hjm-agreement__mark" data-state={String(state)}>
      {state === true ? "✓" : state === "mixed" ? "–" : ""}
    </span>
  );
}

export const Agreement = forwardRef(function Agreement<Id extends string = string>(
  {
    descriptor,
    checkedIds: controlledChecked,
    defaultCheckedIds,
    onCheckedIdsChange,
    onStateChange,
    onDetail,
    requiredLabel,
    optionalLabel,
    className,
  }: AgreementProps<Id>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  validateAgreementDescriptor(descriptor);
  const [rawChecked, setChecked] = useControllableState<ReadonlySet<Id>>({
    ...(controlledChecked === undefined ? {} : { value: controlledChecked }),
    defaultValue: defaultCheckedIds ?? new Set<Id>(),
    ...(onCheckedIdsChange === undefined ? {} : { onChange: onCheckedIdsChange }),
  });
  // An item that left the list must not keep an orphan consent behind it.
  const checked = useMemo(
    () => reconcileAgreementSelection(descriptor, rawChecked),
    [descriptor, rawChecked],
  );
  const state = resolveAgreementState(descriptor, checked);
  const id = `${useId().replaceAll(":", "")}-agreement`;

  const commit = (next: ReadonlySet<Id>) => {
    setChecked(next);
    onStateChange?.(resolveAgreementState(descriptor, next));
  };

  return (
    <div
      ref={forwardedRef}
      role="group"
      aria-label={descriptor.accessibilityLabel}
      className={classNames("hjm-agreement", className)}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={state.all === "mixed" ? "mixed" : String(state.all === true) as "true" | "false"}
        className="hjm-agreement__all"
        onClick={() => commit(toggleAgreementAll(descriptor, checked))}
      >
        <Mark state={state.all} />
        <span>{descriptor.allLabel}</span>
      </button>
      <div className="hjm-agreement__list">
        {descriptor.items.map((item) => {
          const itemChecked = checked.has(item.id);
          return (
            <div key={item.id} className="hjm-agreement__item" data-disabled={item.disabled || undefined}>
              <button
                type="button"
                role="checkbox"
                id={`${id}-${item.id}`}
                aria-checked={itemChecked}
                aria-disabled={item.disabled || undefined}
                aria-describedby={item.description ? `${id}-${item.id}-description` : undefined}
                className="hjm-agreement__toggle"
                onClick={() => { if (!item.disabled) commit(toggleAgreementItem(descriptor, checked, item.id)); }}
              >
                <Mark state={itemChecked} />
                <span className="hjm-agreement__copy">
                  {/*
                    Required/optional rides inside the control's own name: a
                    visual-only marker would leave a screen reader unable to
                    tell which rows block the submit button.
                  */}
                  <span>{item.label}</span>
                  <span className="hjm-agreement__required" data-required={item.required || undefined}>
                    {item.required ? requiredLabel : optionalLabel}
                  </span>
                </span>
              </button>
              {item.description ? (
                <p id={`${id}-${item.id}-description`} className="hjm-agreement__description">{item.description}</p>
              ) : null}
              {/*
                A separate tab stop that never toggles consent — opening the
                text and agreeing to it are different acts.
              */}
              {item.detail ? (
                item.detail.href ? (
                  <a className="hjm-agreement__detail" href={item.detail.href}>{item.detail.label}</a>
                ) : (
                  <button type="button" className="hjm-agreement__detail" onClick={() => onDetail?.(item.id)}>
                    {item.detail.label}
                  </button>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}) as <Id extends string = string>(
  props: AgreementProps<Id> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

