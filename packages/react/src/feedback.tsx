import {
  emptyStateRecipe,
  noticeRecipe,
  progressRecipe,
  skeletonRecipe,
  type NoticeTone,
  type ProgressShape,
  type ProgressSize,
  type ProgressTone,
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
  type CSSProperties,
} from "react";
import { classNames } from "./internal.js";
import { Button } from "./actions.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

// The HTML `title` attribute (tooltip string) shares its name with the heading slot.
// Left in the intersection, `string & ReactNode` collapses the slot to `string`, so
// consumers had to cast heading elements (BurnTok, 2026-09-27 audit). Omit it like
// Result/Card/Section already do.
export type NoticeProps = Omit<HTMLAttributes<HTMLElement>, "title"> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    tone?: NoticeTone;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Notice = forwardRef<HTMLElement, NoticeProps>(function Notice(
  {
    title,
    description,
    action,
    icon,
    tone = noticeRecipe.defaults.tone,
    className,
    layoutStyle,
    ...props
  },
  ref,
) {
  const urgent = tone === "danger";
  return (
    <section
      {...props}
      style={{ ...props.style, ...layoutStyle }}
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

export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> &
  Readonly<{
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    density?: EmptyStateDensity;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
      layoutStyle,
      ...props
    },
    ref,
  ) {
    return (
      <div
        {...props}
        style={{ ...props.style, ...layoutStyle }}
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
    layoutStyle,
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
      style={{ ...props.style, ...layoutStyle }}
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
          {/* Button row rule (usage/components/button.md): secondary → primary, so the main action ends the row
              like Dialog footers. Until 2026-10-06 Result drew primary first, the reverse of every other action row. */}
          {result.secondaryAction ? (
            <Button
              aria-label={result.secondaryAction.accessibilityLabel}
              onClick={result.secondaryAction.onAction}
              tone="secondary"
            >
              {result.secondaryAction.label}
            </Button>
          ) : null}
          {result.primaryAction ? (
            <Button
              aria-label={result.primaryAction.accessibilityLabel}
              onClick={result.primaryAction.onAction}
            >
              {result.primaryAction.label}
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
    /**
     * `circular` draws the same value as a ring. It is a shape, not a second
     * component: min/max/now, the indeterminate case and the announcement are
     * identical, so the accessibility contract stays in one place.
     */
    shape?: ProgressShape;
    /** Content inside the ring — a percentage, a count, an icon. Ignored when linear. */
    children?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

export const Progress = forwardRef<HTMLProgressElement, ProgressProps>(
  function Progress(
    {
      label,
      value,
      valueText,
      max = progressRecipe.defaults.max,
      size = progressRecipe.defaults.size,
      tone = progressRecipe.defaults.tone,
      shape = progressRecipe.defaults.shape,
      children,
      className,
      layoutStyle,
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
    const diameter = progressRecipe.circular.sizes[size];
    const strokeWidth = progressRecipe.circular.strokeWidth[size];
    return (
      <div
        className={classNames("hjm-progress", className)}
        data-size={size}
        data-tone={tone}
        data-shape={shape}
        data-state={value === undefined ? "indeterminate" : "determinate"}
        // `layoutStyle` lands on this frame, not on the native <progress> that
        // receives the rest props, so placement moves the label and bar together.
        style={shape === "circular" ? ({
          ...layoutStyle,
          "--hjm-progress-diameter": `${diameter}px`,
          "--hjm-progress-stroke": `${strokeWidth}px`,
          // Conic sweep instead of an SVG arc: the same token drives both
          // shapes and no second color pipeline appears.
          "--hjm-progress-sweep": value === undefined ? "25%" : `${(value / max) * 100}%`,
        } as CSSProperties) : layoutStyle}
      >
        <span className="hjm-progress__copy">
          <span>{label}</span>
          {valueText ? <span>{valueText}</span> : null}
        </span>
        {shape === "circular" ? (
          <span className="hjm-progress__ring" aria-hidden="true">
            {children ? <span className="hjm-progress__ring-content">{children}</span> : null}
          </span>
        ) : null}
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

export { Spinner, type SpinnerProps } from "./internal/spinner.js";

type SkeletonShape = keyof typeof skeletonRecipe.shapes;

export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  Readonly<{
    shape?: SkeletonShape;
    animated?: boolean;
    width?: string | number;
    height?: string | number;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
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
      layoutStyle,
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
        style={{ width, height, ...style, ...layoutStyle }}
      />
    );
  },
);
