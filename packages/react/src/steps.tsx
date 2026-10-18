import {
  resolveStepsDescriptor,
  stepsRecipe,
  type ComposeStepsAccessibleName,
  type StepStatus,
  type StepsDescriptor,
  type StepsStatusLabels,
} from "@hjmds/design-contracts/components/steps";
import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";

import { classNames } from "./internal.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type StepsProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLOListElement>,
  "children"
> & Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
  /**
   * Return to a step before the cursor (2026-10-18, spint compose). Only those steps become buttons; the cursor and
   * later steps stay static so the flow never skips forward past validation. Omit it while the flow is locked.
   */
  onStepPress?: (id: Id) => void;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Linear progress steps with one canonical cursor; steps before it can be pressed to go back. */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { descriptor, statusLabels, composeAccessibleName, renderMark, onStepPress, className, layoutStyle, ...props },
  ref,
) {
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  const statusId = useId();
  return (
    <ol {...props} style={{ ["--hjm-steps-press-target" as string]: `${stepsRecipe.press.minTouchTarget}px`, ...props.style, ...layoutStyle }} ref={ref} className={classNames("hjm-steps", className)}>
      {steps.map((step, index) => {
        const content = <>
          <div className="hjm-steps__rail" aria-hidden="true">
            <span className="hjm-steps__indicator">
              {renderMark?.(step.status, step.position) ?? (
                step.status === "complete" ? "✓" : step.status === "error" ? "!" : step.position
              )}
            </span>
            {index === steps.length - 1 ? null : <span className="hjm-steps__connector" />}
          </div>
          <div className="hjm-steps__copy">
            <span className="hjm-steps__label">{step.label}</span>
            {step.description === undefined ? null : (
              <span className="hjm-steps__description">{step.description}</span>
            )}
            <span className="hjm-visually-hidden" id={`${statusId}-${index}`}>{step.statusLabel}</span>
          </div>
        </>;
        // A pressable step is one named button; its status stays a description so the name keeps order + label.
        return step.revisitable && onStepPress ? (
          <li className="hjm-steps__step" data-status={step.status} key={step.id}>
            <button type="button" className="hjm-steps__press" aria-label={step.accessibleName} aria-describedby={`${statusId}-${index}`}
              onClick={() => onStepPress(step.id)}>{content}</button>
          </li>
        ) : (
          <li
            aria-label={step.accessibleName}
            aria-current={step.status === "current" || step.status === "error" ? "step" : undefined}
            className="hjm-steps__step"
            data-status={step.status}
            key={step.id}
          >{content}</li>
        );
      })}
    </ol>
  );
});
