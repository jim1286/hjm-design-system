import {
  getNextSplitterValue,
  resolveSplitterBoundaryValue,
  resolveSplitterDragValue,
  resolveSplitterSeparatorOrientation,
  splitterDefaults,
  splitterRecipe,
  validateSplitterDescriptor,
  type SplitterAxis,
} from "@hjmds/design-contracts/components/splitter";
import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { classNames, composeRefs, useControllableState } from "./internal.js";

export type SplitterProps = Readonly<{
  /** Required accessible name for the separator. */
  label: string;
  min: number;
  max: number;
  step?: number;
  axis?: SplitterAxis;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires once when a drag settles, for owners that persist the size. */
  onValueChangeEnd?: (value: number) => void;
  /** Product-owned announcement of the current size, e.g. "35%" or "320px". */
  getValueText?: (value: number) => string;
  disabled?: boolean;
  /** The pane the value sizes, and the pane that takes the remaining space. */
  primaryPane: ReactNode;
  secondaryPane: ReactNode;
  className?: string;
  style?: CSSProperties;
}>;

/*
  The value is a percentage of the root box: `min`/`max`/`step` stay in the
  product's own unit as the contract requires, but the pointer has to be turned
  into that unit somehow, and only a fraction of the container is meaningful
  without knowing the product's unit. Products that size in px pass min/max in
  px and read the same fraction back through their own formatting.
*/
function fractionFromPointer(root: HTMLElement, axis: SplitterAxis, clientX: number, clientY: number): number {
  const box = root.getBoundingClientRect();
  const horizontal = axis === "horizontal";
  const span = horizontal ? box.width : box.height;
  if (span === 0) return 0;
  const offset = horizontal ? clientX - box.left : clientY - box.top;
  // Logical, not physical: in RTL the primary pane starts at the right edge.
  const flipped = horizontal && getComputedStyle(root).direction === "rtl";
  return (flipped ? span - offset : offset) / span;
}

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(function Splitter(
  {
    label,
    min,
    max,
    step,
    axis = splitterDefaults.axis,
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    getValueText,
    disabled = false,
    primaryPane,
    secondaryPane,
    className,
    style,
  },
  forwardedRef,
) {
  const [value, setValue] = useControllableState<number>({
    ...(controlledValue === undefined ? {} : { value: controlledValue }),
    defaultValue: defaultValue ?? min,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const descriptor = {
    value,
    min,
    max,
    ...(step === undefined ? {} : { step }),
    axis,
    label,
    ...(getValueText === undefined ? {} : { valueText: getValueText(value) }),
  };
  validateSplitterDescriptor(descriptor);
  const rootRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const commit = (next: number) => {
    if (next !== value) setValue(next);
    return next;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const root = rootRef.current;
    const flipped = axis === "horizontal" && root !== null && getComputedStyle(root).direction === "rtl";
    const intent = arrowIntent(event.key, axis, flipped);
    const next =
      event.key === "Home" || event.key === "End"
        ? resolveSplitterBoundaryValue(descriptor, event.key === "Home" ? "min" : "max")
        : intent === undefined
          ? undefined
          : getNextSplitterValue(descriptor, intent);
    if (next === undefined) return;
    event.preventDefault();
    // Keyboard resize settles immediately: there is no drag to release, but an
    // owner persisting the size still needs the same end signal a drag gives.
    if (next === value) return;
    // Commit before notifying, never as the argument of an optional call:
    // `onValueChangeEnd?.(commit(next))` skips the argument entirely when no
    // handler is passed, so keyboard resize would silently do nothing.
    commit(next);
    // A step already at the boundary changes nothing, so it is not a settlement
    // — an owner persisting on every end would otherwise write a no-op.
    onValueChangeEnd?.(next);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const resize = (event: PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!dragging || !root) return;
    const fraction = fractionFromPointer(root, axis, event.clientX, event.clientY);
    commit(resolveSplitterDragValue(descriptor, min + fraction * (max - min)));
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    onValueChangeEnd?.(value);
  };

  const fraction = max === min ? 0 : (value - min) / (max - min);
  return (
    <div
      ref={composeRefs(rootRef, forwardedRef)}
      className={classNames("hjm-splitter", className)}
      data-axis={axis}
      data-dragging={dragging || undefined}
      style={{ ...style, "--hjm-splitter-primary": `${fraction * 100}%` } as CSSProperties}
    >
      <div className="hjm-splitter__pane" data-pane="primary">{primaryPane}</div>
      <div
        role="separator"
        // Perpendicular by contract: side-by-side panes have a vertical bar.
        aria-orientation={resolveSplitterSeparatorOrientation(axis)}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={descriptor.valueText}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className="hjm-splitter__separator"
        style={{ "--hjm-splitter-hit-target": `${splitterRecipe.separator.hitTarget}px`, "--hjm-splitter-thickness": `${splitterRecipe.separator.thickness}px` } as CSSProperties}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={resize}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="hjm-splitter__handle" aria-hidden="true" />
      </div>
      <div className="hjm-splitter__pane" data-pane="secondary">{secondaryPane}</div>
    </div>
  );
});

function arrowIntent(
  key: string,
  axis: SplitterAxis,
  flipped: boolean,
): "increment" | "decrement" | undefined {
  // Only the axis the panes are arranged along resizes; the other pair of arrow
  // keys belongs to whatever the pane content does with them. `flipped` keeps the
  // keyboard on the same logical direction the drag uses: in RTL the primary pane
  // grows toward the left, so ArrowLeft is the increment.
  if (axis === "horizontal") {
    if (key === (flipped ? "ArrowLeft" : "ArrowRight")) return "increment";
    if (key === (flipped ? "ArrowRight" : "ArrowLeft")) return "decrement";
    return undefined;
  }
  if (key === "ArrowDown") return "increment";
  if (key === "ArrowUp") return "decrement";
  return undefined;
}
