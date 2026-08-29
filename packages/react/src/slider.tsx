import {
  getSliderStepTarget,
  resolveSliderDescriptor,
  resolveSliderFillFraction,
  resolveSliderValue,
  type SliderStepIntent,
} from "@hjmds/design-contracts/components/slider";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { classNames, useControllableState } from "./internal.js";

type NativeSliderInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "aria-label"
  | "aria-orientation"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "aria-valuetext"
  | "children"
  | "className"
  | "defaultValue"
  | "max"
  | "min"
  | "onChange"
  | "readOnly"
  | "size"
  | "step"
  | "type"
  | "value"
>;

export type SliderProps = NativeSliderInputProps &
  Readonly<{
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueChangeEnd?: (value: number) => void;
    /** Product-owned visible and accessible value formatting. */
    getValueText?: (value: number) => string;
    className?: string;
    inputClassName?: string;
    style?: CSSProperties;
  }>;

type SliderInteraction = "keyboard" | "pointer";

const sliderKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

function intentForKey(key: string): SliderStepIntent | undefined {
  if (key === "ArrowRight" || key === "ArrowUp") return "increment";
  if (key === "ArrowLeft" || key === "ArrowDown") return "decrement";
  if (key === "Home") return "first";
  if (key === "End") return "last";
  if (key === "PageUp") return "increment-page";
  if (key === "PageDown") return "decrement-page";
  return undefined;
}

type SliderRootStyle = CSSProperties & Readonly<{ "--hjm-slider-fill": string }>;

/** Native range semantics with HJM visuals and explicit change-end behavior. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    id,
    label,
    min,
    max,
    step,
    value,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    getValueText,
    disabled = false,
    className,
    inputClassName,
    style,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onLostPointerCapture,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const controlId = id ?? `hjm-slider-${generatedId.replaceAll(":", "")}`;
  const labelId = `${controlId}-label`;
  const valueId = `${controlId}-value`;
  const controlled = value !== undefined;
  const controlledAtMount = useRef(controlled);
  if (controlledAtMount.current !== controlled) {
    throw new Error("HJM components cannot switch between controlled and uncontrolled state");
  }
  const [currentValue, setCurrentValue] = useControllableState<number>({
    ...(value === undefined ? {} : { value }),
    defaultValue: defaultValue ?? min,
    ...(onValueChange === undefined ? {} : { onChange: onValueChange }),
  });
  const valueText = getValueText?.(currentValue);
  const descriptor = resolveSliderDescriptor({
    label,
    value: currentValue,
    min,
    max,
    ...(step === undefined ? {} : { step }),
    ...(valueText === undefined ? {} : { valueText }),
  });
  const interactionRef = useRef<SliderInteraction | null>(null);
  const lastInteractionValueRef = useRef(currentValue);
  const [interaction, setInteraction] = useState<SliderInteraction | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (interactionRef.current === null) lastInteractionValueRef.current = currentValue;
  }, [currentValue]);

  const beginInteraction = (kind: SliderInteraction) => {
    interactionRef.current = kind;
    lastInteractionValueRef.current = currentValue;
    setInteraction(kind);
  };
  const publish = (next: number) => {
    const previous = interactionRef.current === null
      ? currentValue
      : lastInteractionValueRef.current;
    lastInteractionValueRef.current = next;
    if (!Object.is(next, previous)) setCurrentValue(next);
  };
  const finishInteraction = () => {
    if (interactionRef.current === null) return;
    const finalValue = lastInteractionValueRef.current;
    interactionRef.current = null;
    setInteraction(null);
    onValueChangeEnd?.(finalValue);
  };

  useEffect(() => {
    if (disabled) finishInteraction();
  }, [disabled]);

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    finishInteraction();
    onBlur?.(event);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const intent = intentForKey(event.key);
    if (intent === undefined) return;
    event.preventDefault();
    if (interactionRef.current !== "keyboard") beginInteraction("keyboard");
    publish(getSliderStepTarget(descriptor, intent));
  };
  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyUp?.(event);
    if (!sliderKeys.has(event.key)) return;
    finishInteraction();
  };
  const handlePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || disabled) return;
    beginInteraction("pointer");
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerUp = (event: PointerEvent<HTMLInputElement>) => {
    onPointerUp?.(event);
    finishInteraction();
  };
  const handlePointerCancel = (event: PointerEvent<HTMLInputElement>) => {
    onPointerCancel?.(event);
    finishInteraction();
  };
  const handleLostPointerCapture = (event: PointerEvent<HTMLInputElement>) => {
    onLostPointerCapture?.(event);
    finishInteraction();
  };

  const fill = resolveSliderFillFraction(descriptor);
  const rootStyle: SliderRootStyle = {
    ...style,
    "--hjm-slider-fill": `${fill * 100}%`,
  };
  const visibleValue = valueText ?? String(currentValue);

  return (
    <div
      className={classNames("hjm-slider", className)}
      data-disabled={disabled ? "true" : "false"}
      data-focused={focused ? "true" : "false"}
      data-interaction={interaction ?? "idle"}
      style={rootStyle}
    >
      <div className="hjm-slider__header">
        <label className="hjm-slider__label" id={labelId} htmlFor={controlId}>{label}</label>
        <output className="hjm-slider__value" id={valueId} htmlFor={controlId}>
          {visibleValue}
        </output>
      </div>
      <div className="hjm-slider__control">
        <div className="hjm-slider__interactive">
          <div aria-hidden="true" className="hjm-slider__track">
            <div className="hjm-slider__filled-track" />
          </div>
          <div aria-hidden="true" className="hjm-slider__thumb" />
          <input
            {...inputProps}
            ref={forwardedRef}
            id={controlId}
            type="range"
            className={classNames("hjm-slider__input", inputClassName)}
            min={min}
            max={max}
            step="any"
            value={currentValue}
            disabled={disabled}
            aria-labelledby={labelId}
            aria-orientation="horizontal"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            {...(valueText === undefined ? {} : { "aria-valuetext": valueText })}
            onChange={(event) => {
              if (disabled) return;
              const next = resolveSliderValue(
                descriptor,
                event.currentTarget.valueAsNumber,
              );
              const atomic = interactionRef.current === null;
              publish(next);
              if (atomic) onValueChangeEnd?.(next);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handleLostPointerCapture}
          />
        </div>
      </div>
    </div>
  );
});
