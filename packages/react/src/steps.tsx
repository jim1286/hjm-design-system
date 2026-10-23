"use client";

import {
  resolveStepsDescriptor, stepsDefaults, stepsRecipe, validateStepsPresentation,
  type ComposeStepsAccessibleName, type StepStatus, type StepsDescriptor,
  type StepsPresentation, type StepsStatusLabels,
} from "@hjmds/design-contracts/components/steps";
import { forwardRef, useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type StepsProps<Id extends string = string> = Omit<HTMLAttributes<HTMLOListElement>, "children"> & Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  /** Focus rail is the default; compact reveals its overview, vertical expands the cursor's content. */
  presentation?: StepsPresentation;
  /** Required localized toggle label for compact presentation. */
  overviewLabel?: string;
  /** Vertical-only content slot. Products keep drafts outside this unmounted step content. */
  renderStepContent?: (id: Id) => ReactNode;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
  /** Backward-only in linear forms; free reading permits any step. Omit while locked. */
  onStepPress?: (id: Id) => void;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Presentation never changes the shared single-cursor state or validation/navigation policy. */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { descriptor, statusLabels, composeAccessibleName, presentation = stepsDefaults.presentation, overviewLabel,
    renderStepContent, renderMark, onStepPress, className, layoutStyle, ...props }, ref,
) {
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  validateStepsPresentation(presentation, overviewLabel);
  if (renderStepContent && presentation !== "vertical") throw new TypeError("Steps renderStepContent requires vertical presentation");
  const statusId = useId();
  const [expanded, setExpanded] = useState(false);
  const compact = presentation === "compact";
  const vertical = presentation === "vertical" || (compact && expanded);
  const current = steps.find(step => step.id === descriptor.currentStepId)!;
  const markerSize = renderMark ? stepsRecipe.indicator.customSize : stepsRecipe.indicator.size;
  const list = <ol {...props} ref={ref} id={props.id ?? `${statusId}-list`}
    data-presentation={presentation} data-expanded={compact ? expanded : undefined} data-custom-mark={renderMark ? true : undefined}
    style={{ ["--hjm-steps-inset" as string]: `${stepsRecipe.paddingInline}px`, ["--hjm-steps-indicator-size" as string]: `${markerSize}px`,
      ["--hjm-steps-count" as string]: steps.length, ["--hjm-steps-connector-count" as string]: steps.length - 1,
      ["--hjm-steps-press-target" as string]: `${stepsRecipe.press.minTouchTarget}px`,
      ["--hjm-steps-duration" as string]: `${stepsRecipe.transitionDuration}ms`,
      ["--hjm-steps-segment-height" as string]: `${stepsRecipe.segmentHeight}px`, ...props.style, ...(!compact ? layoutStyle : {}) }}
    className={classNames("hjm-steps", className)}>
    {steps.map((step, index) => {
      const cursor = step.id === descriptor.currentStepId;
      const isCurrent = step.status === "current" || step.status === "error";
      const pressable = (!compact || expanded) && (descriptor.navigationMode === "free" || step.revisitable) && onStepPress;
      const content = <>
        <div className="hjm-steps__rail" aria-hidden="true">
          {!vertical && index === steps.length - 1 ? <span className="hjm-steps__connector" data-reached={steps[index - 1]?.status === "complete" || undefined} /> : null}
          <span className="hjm-steps__indicator">{renderMark?.(step.status, step.position) ?? (step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position)}</span>
          {vertical || index === steps.length - 1 ? null : <span className="hjm-steps__connector" />}
        </div>
        <div className="hjm-steps__copy">
          <span className="hjm-steps__label">{step.label}</span>
          {step.description !== undefined && (!vertical || cursor) ? <span className="hjm-steps__description">{step.description}</span> : null}
          {vertical ? <span className="hjm-steps__status" aria-hidden="true">{step.statusLabel}</span> : null}
          <span className="hjm-visually-hidden" id={`${statusId}-${index}`}>{step.statusLabel}</span>
        </div>
      </>;
      return <li className="hjm-steps__step" data-status={step.status} key={step.id}>
        {pressable ? <button type="button" className="hjm-steps__press" aria-label={step.accessibleName} aria-describedby={`${statusId}-${index}`}
          aria-current={isCurrent ? "step" : undefined} onClick={() => onStepPress(step.id)}>{content}</button>
          : <div className="hjm-steps__item" aria-label={step.accessibleName} aria-describedby={`${statusId}-${index}`} aria-current={isCurrent ? "step" : undefined}>{content}</div>}
        {presentation === "vertical" && cursor && renderStepContent ? <div className="hjm-steps__body">{renderStepContent(step.id)}</div> : null}
      </li>;
    })}
  </ol>;
  return compact ? <div className="hjm-steps-compact" style={layoutStyle}>
    <div className="hjm-steps-compact__header">
      <span aria-hidden="true">{current.position} / {current.total} · {current.label}<span className="hjm-steps__status"> · {current.statusLabel}</span></span>
      <button type="button" className="hjm-steps-compact__toggle" aria-expanded={expanded} aria-controls={props.id ?? `${statusId}-list`} onClick={() => setExpanded(value => !value)}>
        {overviewLabel}<span aria-hidden="true">{expanded ? "⌃" : "⌄"}</span>
      </button>
    </div>{list}
  </div> : list;
});
