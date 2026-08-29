import {
  emptyStateRecipe,
  noticeRecipe,
  progressRecipe,
  skeletonRecipe,
  spinnerRecipe,
  type NoticeTone,
  type ProgressSize,
  type ProgressTone,
  type SpinnerSize,
  type SpinnerTone,
} from "@hjmds/design-contracts/recipes";
import {
  resolveResultDescriptor,
  type ResultDescriptor,
} from "@hjmds/design-contracts/components/result";
import {
  forwardRef,
  type HTMLAttributes,
  type ProgressHTMLAttributes,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";
import { Button } from "./actions.js";

export type NoticeProps = HTMLAttributes<HTMLElement> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    tone?: NoticeTone;
  }>;

export const Notice = forwardRef<HTMLElement, NoticeProps>(function Notice(
  {
    title,
    description,
    action,
    icon,
    tone = noticeRecipe.defaults.tone,
    className,
    ...props
  },
  ref,
) {
  const urgent = tone === "danger";
  return (
    <section
      {...props}
      ref={ref}
      className={classNames("hjm-notice", className)}
      data-tone={tone}
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
    >
      {icon ? <div className="hjm-notice__icon" aria-hidden="true">{icon}</div> : null}
      <div className="hjm-notice__content">
        <strong className="hjm-notice__title">{title}</strong>
        {description ? <div className="hjm-notice__description">{description}</div> : null}
      </div>
      {action ? <div className="hjm-notice__action">{action}</div> : null}
    </section>
  );
});

type EmptyStateDensity = keyof typeof emptyStateRecipe.density;

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    density?: EmptyStateDensity;
  }>;

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      title,
      description,
      action,
      icon,
      density = emptyStateRecipe.defaults.density,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <div
        {...props}
        ref={ref}
        className={classNames("hjm-empty-state", className)}
        data-density={density}
        role="status"
      >
        {icon ? <div className="hjm-empty-state__icon" aria-hidden="true">{icon}</div> : null}
        <strong className="hjm-empty-state__title">{title}</strong>
        {description ? <div className="hjm-empty-state__description">{description}</div> : null}
        {action ? <div className="hjm-empty-state__action">{action}</div> : null}
      </div>
    );
  },
);

export type ResultProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> &
  ResultDescriptor &
  Readonly<{
    headingLevel?: 1 | 2;
    /** Optional product glyph; its meaning is already carried by title/status. */
    icon?: ReactNode;
  }>;

/** A terminal flow outcome. EmptyState remains reserved for fillable content. */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(
  {
    status,
    title,
    description,
    actions,
    headingLevel = 2,
    icon,
    className,
    role,
    ...props
  },
  ref,
) {
  const result = resolveResultDescriptor({
    status,
    title,
    ...(description === undefined ? {} : { description }),
    ...(actions === undefined ? {} : { actions }),
  });
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div
      {...props}
      ref={ref}
      className={classNames("hjm-result", className)}
      data-status={result.status}
      role={role ?? (result.status === "failure" ? "alert" : "status")}
    >
      <span className="hjm-result__icon" aria-hidden="true">
        {icon}
      </span>
      <Heading className="hjm-result__title">{result.title}</Heading>
      {result.description ? (
        <p className="hjm-result__description">{result.description}</p>
      ) : null}
      {result.primaryAction || result.secondaryAction ? (
        <div className="hjm-result__actions">
          {result.primaryAction ? (
            <Button
              aria-label={result.primaryAction.accessibilityLabel}
              onClick={result.primaryAction.onAction}
            >
              {result.primaryAction.label}
            </Button>
          ) : null}
          {result.secondaryAction ? (
            <Button
              aria-label={result.secondaryAction.accessibilityLabel}
              onClick={result.secondaryAction.onAction}
              tone="secondary"
            >
              {result.secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export type ProgressProps = Omit<
  ProgressHTMLAttributes<HTMLProgressElement>,
  "children" | "max" | "size" | "value"
> &
  Readonly<{
    label: ReactNode;
    value?: number;
    max?: number;
    valueText?: string;
    size?: ProgressSize;
    tone?: ProgressTone;
  }>;

export const Progress = forwardRef<HTMLProgressElement, ProgressProps>(
  function Progress(
    {
      label,
      value,
      valueText,
      max = 100,
      size = progressRecipe.defaults.size,
      tone = progressRecipe.defaults.tone,
      className,
      ...props
    },
    ref,
  ) {
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
      throw new RangeError("Progress max must be a positive finite number");
    }
    if (
      value !== undefined &&
      (!Number.isFinite(value) || value < 0 || value > max)
    ) {
      throw new RangeError("Progress value must be between zero and max");
    }
    return (
      <div
        className={classNames("hjm-progress", className)}
        data-size={size}
        data-tone={tone}
        data-state={value === undefined ? "indeterminate" : "determinate"}
      >
        <span className="hjm-progress__copy">
          <span>{label}</span>
          {valueText ? <span>{valueText}</span> : null}
        </span>
        <progress
          {...props}
          ref={ref}
          className="hjm-progress__native"
          max={max}
          {...(value === undefined ? {} : { value })}
          aria-valuetext={typeof valueText === "string" ? valueText : undefined}
        />
      </div>
    );
  },
);

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> &
  Readonly<{
    label: string;
    size?: SpinnerSize;
    tone?: SpinnerTone;
  }>;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    label,
    size = spinnerRecipe.defaults.size,
    tone = spinnerRecipe.defaults.tone,
    className,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={classNames("hjm-spinner", className)}
      data-size={size}
      data-tone={tone}
      role="status"
      aria-live="polite"
    >
      <span className="hjm-spinner__glyph" aria-hidden="true" />
      <span className="hjm-visually-hidden">{label}</span>
    </span>
  );
});

type SkeletonShape = keyof typeof skeletonRecipe.shapes;

export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    width?: string | number;
    height?: string | number;
  }>;

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  function Skeleton(
    {
      shape = skeletonRecipe.defaults.shape,
      animated = skeletonRecipe.defaults.animated,
      width,
      height,
      className,
      style,
      ...props
    },
    ref,
  ) {
    return (
      <span
        {...props}
        ref={ref}
        className={classNames("hjm-skeleton", className)}
        data-shape={shape}
        data-animated={animated}
        aria-hidden="true"
        style={{ width, height, ...style }}
      />
    );
  },
);
