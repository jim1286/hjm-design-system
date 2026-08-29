import {
  resolveStepsDescriptor,
  type ComposeStepsAccessibleName,
  type StepStatus,
  type StepsDescriptor,
  type StepsStatusLabels,
} from "@hjmds/design-contracts/components/steps";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { classNames } from "./internal.js";

export type StepsProps<Id extends string = string> = Omit<
  HTMLAttributes<HTMLOListElement>,
  "children"
> & Readonly<{
  descriptor: StepsDescriptor<Id>;
  statusLabels: StepsStatusLabels;
  composeAccessibleName: ComposeStepsAccessibleName;
  renderMark?: (status: StepStatus, position: number) => ReactNode;
}>;

/** Linear, read-only progress steps with one canonical cursor. */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { descriptor, statusLabels, composeAccessibleName, renderMark, className, ...props },
  ref,
) {
  const steps = resolveStepsDescriptor(descriptor, { statusLabels, composeAccessibleName });
  return (
    <ol {...props} ref={ref} className={classNames("hjm-steps", className)}>
      {steps.map((step, index) => (
        <li
          aria-label={step.accessibleName}
          aria-current={step.status === "current" || step.status === "error" ? "step" : undefined}
          className="hjm-steps__step"
          data-status={step.status}
          key={step.id}
        >
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
            <span className="hjm-visually-hidden">{step.statusLabel}</span>
          </div>
        </li>
      ))}
    </ol>
  );
});
