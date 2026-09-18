import {
  reconcileToggleGroupSelection,
  toggleGroupRecipe,
  toggleGroupSelection,
  validateToggleGroupDescriptor,
  type ToggleGroupDescriptor,
  type ToggleGroupSize,
} from "@hjmds/design-contracts/components/toggle-group";
import { forwardRef, useMemo, type CSSProperties } from "react";
import { classNames, useControllableState } from "./internal.js";

export type ToggleGroupProps<Id extends string = string> = Readonly<{
  descriptor: ToggleGroupDescriptor<Id>;
  pressedIds?: ReadonlySet<Id>;
  defaultPressedIds?: ReadonlySet<Id>;
  onPressedIdsChange?: (ids: ReadonlySet<Id>) => void;
  size?: ToggleGroupSize;
  className?: string;
}>;

export const ToggleGroup = forwardRef(function ToggleGroup<Id extends string = string>(
  {
    descriptor,
    pressedIds: controlledPressed,
    defaultPressedIds,
    onPressedIdsChange,
    size = toggleGroupRecipe.defaults.size,
    className,
  }: ToggleGroupProps<Id>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  validateToggleGroupDescriptor(descriptor);
  const [rawPressed, setPressed] = useControllableState<ReadonlySet<Id>>({
    ...(controlledPressed === undefined ? {} : { value: controlledPressed }),
    defaultValue: defaultPressedIds ?? new Set<Id>(),
    ...(onPressedIdsChange === undefined ? {} : { onChange: onPressedIdsChange }),
  });
  const pressed = useMemo(
    () => reconcileToggleGroupSelection(descriptor, rawPressed),
    [descriptor, rawPressed],
  );
  const metrics = toggleGroupRecipe.sizes[size];
  return (
    <div
      ref={forwardedRef}
      role="group"
      aria-label={descriptor.accessibilityLabel}
      className={classNames("hjm-toggle-group", className)}
      data-size={size}
      style={{
        "--hjm-toggle-min-height": `${metrics.minHeight}px`,
        "--hjm-toggle-padding": `${metrics.paddingHorizontal}px`,
        "--hjm-toggle-gap": `${toggleGroupRecipe.gap}px`,
        "--hjm-toggle-radius": `${toggleGroupRecipe.radius}px`,
      } as CSSProperties}
    >
      {descriptor.items.map((item) => (
        <button
          key={item.id}
          type="button"
          // The pressed state rides on aria-pressed, never on color alone.
          aria-pressed={pressed.has(item.id)}
          aria-disabled={item.disabled || undefined}
          disabled={item.disabled}
          className="hjm-toggle-group__item"
          onClick={() => setPressed(toggleGroupSelection(descriptor, pressed, item.id))}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}) as <Id extends string = string>(
  props: ToggleGroupProps<Id> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
