import {
  getIconTransform,
  resolveIconDescriptor,
  semanticIconPaths,
  type IconDescriptor,
  type SemanticIconName,
} from "@hjmds/design-contracts/components/icon";
import {
  imageRecipe,
  resolveImageAspectRatio,
  resolveImageDescriptor,
  resolveImageFallbackAccessibilityLabel,
  type ImageDescriptor,
  type ImageLoadStatus,
} from "@hjmds/design-contracts/components/image";
import {
  counterBadgeRecipe,
  formatCounterBadgeCount,
  iconRecipe,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
} from "@hjmds/design-contracts/recipes";
import {
  forwardRef,
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  type CSSProperties,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactEventHandler,
  type ReactNode,
  type Ref,
  type SVGAttributes,
} from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";


export type IconProps = Omit<
  SVGAttributes<SVGSVGElement>,
  "children" | "color"
> & IconDescriptor & Readonly<{
  /** Optional glyph inside the existing 24-unit SVG frame; HJM owns semantics. */
  renderGlyph?: (props: Readonly<{ name: SemanticIconName; size: number; color: string; strokeWidth: number }>) => ReactNode;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    name,
    size,
    tone,
    weight,
    directionality,
    decorative,
    accessibilityLabel,
    renderGlyph,
    className,
    style,
    layoutStyle,
    ...props
  },
  ref,
) {
  const descriptor = resolveIconDescriptor({
    name,
    ...(size === undefined ? {} : { size }),
    ...(tone === undefined ? {} : { tone }),
    ...(weight === undefined ? {} : { weight }),
    ...(directionality === undefined ? {} : { directionality }),
    ...(decorative === undefined ? {} : { decorative }),
    ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
  } as IconDescriptor);
  const theme = useOptionalHjmTheme();
  const transform = getIconTransform(
    descriptor.directionality,
    theme?.environment.direction ?? "ltr",
  );
  const dimension = iconRecipe.sizes[descriptor.size];
  return (
    <svg
      {...props}
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames("hjm-icon", className)}
      data-name={descriptor.name}
      data-size={descriptor.size}
      data-tone={descriptor.tone}
      data-weight={descriptor.weight}
      data-transform={transform}
      width={dimension}
      height={dimension}
      stroke="currentColor"
      strokeWidth={iconRecipe.weights[descriptor.weight]}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={descriptor.decorative ? undefined : "img"}
      aria-hidden={descriptor.decorative || undefined}
      aria-label={descriptor.decorative ? undefined : descriptor.accessibilityLabel}
      focusable="false"
      style={{ ...style, ...layoutStyle }}
    >
      {renderGlyph?.({ name: descriptor.name, size: 24, color: "currentColor", strokeWidth: iconRecipe.weights[descriptor.weight] }) ?? <path d={semanticIconPaths[descriptor.name]} />}
    </svg>
  );
});

type ImageElementProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | "alt"
  | "aria-hidden"
  | "aria-label"
  | "children"
  | "className"
  | "height"
  | "onError"
  | "onLoad"
  | "role"
  | "src"
  | "style"
  | "width"
>;

/** Canonical props handed to a framework adapter such as `next/image`. */
export type ImageAdapterProps = ImageElementProps &
  Readonly<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    style: CSSProperties;
    "aria-hidden"?: true;
    onLoad: ReactEventHandler<HTMLImageElement>;
    onError: ReactEventHandler<HTMLImageElement>;
    ref?: Ref<HTMLImageElement>;
  }>;

type ImageRootProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | "aria-hidden"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "onError"
  | "onLoad"
  | "role"
>;

export type ImageProps = ImageRootProps &
  ImageDescriptor &
  Readonly<{
    /** Additional native `<img>` props shared with the framework adapter. */
    imageProps?: ImageElementProps &
      Readonly<{ className?: string; style?: CSSProperties }>;
    /**
     * Receives the complete accessible image contract. The adapter must pass
     * these props to its underlying image element so HJM can observe failure.
     */
    renderImage?: (props: ImageAdapterProps) => ReactElement;
    /** Visual content only; HJM keeps the fallback's accessible name. */
    fallback?: ReactNode;
    imageRef?: Ref<HTMLImageElement>;
    onLoad?: ReactEventHandler<HTMLImageElement>;
    onError?: ReactEventHandler<HTMLImageElement>;
    onLoadStatusChange?: (status: Extract<ImageLoadStatus, "loaded" | "error">) => void;
    /** Canonical layout-only placement on the root frame; the aspect ratio stays descriptor-owned. */
    layoutStyle?: HjmCompositionStyleProp;
  }>;

type ImageState = Readonly<{
  generation: object;
  status: Extract<ImageLoadStatus, "loading" | "loaded" | "error">;
}>;

/** Intrinsic-size image with canonical alt semantics and an accessible fallback. */
export const Image = forwardRef<HTMLSpanElement, ImageProps>(function Image(
  {
    src,
    width,
    height,
    fit,
    decorative,
    accessibilityLabel,
    imageProps,
    renderImage,
    fallback,
    imageRef,
    onLoad,
    onError,
    onLoadStatusChange,
    className,
    style,
    layoutStyle,
    ...props
  },
  ref,
) {
  const descriptor = resolveImageDescriptor({
    src,
    width,
    height,
    ...(fit === undefined ? {} : { fit }),
    ...(decorative === undefined ? {} : { decorative }),
    ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
  } as ImageDescriptor);
  // A→B→A is a new request even when the URL repeats. Retire adapter callbacks
  // at commit/unmount so old network events cannot update state or product observers.
  // Responsive source candidates and request policy are part of image identity;
  // a new srcSet must recover even when its fallback src is unchanged.
  const generation = useMemo(() => ({}), [descriptor.src, imageProps?.srcSet, imageProps?.sizes, imageProps?.crossOrigin, imageProps?.referrerPolicy]);
  const activeGeneration = useRef<object | null>(generation);
  useLayoutEffect(() => {
    activeGeneration.current = generation;
    return () => { activeGeneration.current = null; };
  }, [generation]);
  const [state, setState] = useState<ImageState>({ generation, status: "loading" });
  const status = state.generation === generation ? state.status : "loading";
  const {
    className: imageClassName,
    style: imageStyle,
    ...restImageProps
  } = imageProps ?? {};

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    if (activeGeneration.current !== generation) return;
    setState({ generation, status: "loaded" });
    onLoadStatusChange?.("loaded");
    onLoad?.(event);
  };
  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    if (activeGeneration.current !== generation) return;
    setState({ generation, status: "error" });
    onLoadStatusChange?.("error");
    onError?.(event);
  };
  const adapterProps: ImageAdapterProps = {
    ...restImageProps,
    src: descriptor.src,
    alt: descriptor.decorative ? "" : descriptor.accessibilityLabel,
    width: descriptor.width,
    height: descriptor.height,
    className: classNames("hjm-image__asset", imageClassName) ??
      "hjm-image__asset",
    style: { ...imageStyle, objectFit: descriptor.fit },
    ...(descriptor.decorative ? { "aria-hidden": true } : {}),
    onLoad: handleLoad,
    onError: handleError,
    ...(imageRef === undefined ? {} : { ref: imageRef }),
  };

  let visual: ReactNode;
  if (status === "error") {
    const fallbackLabel = resolveImageFallbackAccessibilityLabel(descriptor);
    visual = (
      <span
        className="hjm-image__fallback"
        role={descriptor.decorative ? undefined : "img"}
        aria-label={fallbackLabel}
        aria-hidden={descriptor.decorative || undefined}
      >
        <span className="hjm-image__fallback-icon" aria-hidden="true">
          {fallback ?? (
            <Icon
              name={imageRecipe.fallback.icon.name}
              tone={imageRecipe.fallback.icon.tone}
              decorative
            />
          )}
        </span>
      </span>
    );
  } else if (renderImage === undefined) {
    const { ref: assetRef, ...nativeImageProps } = adapterProps;
    visual = <img {...nativeImageProps} ref={assetRef} />;
  } else {
    visual = renderImage(adapterProps);
  }

  return (
    <span
      {...props}
      ref={ref}
      className={classNames("hjm-image", className)}
      data-fit={descriptor.fit}
      data-status={status}
      style={{
        inlineSize: descriptor.width,
        ...style,
        ...layoutStyle,
        aspectRatio: resolveImageAspectRatio(
          descriptor.width,
          descriptor.height,
        ),
      }}
    >
      {visual}
    </span>
  );
});

export type CounterBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> &
  Readonly<{
    count: number;
    max?: number;
    tone?: CounterBadgeTone;
    size?: CounterBadgeSize;
    variant?: CounterBadgeVariant;
    /**
     * Says "there is something new" without a number. Use it where the count is
     * unknown or not worth reading; inventing a number would be worse than
     * saying none. The accessible name then carries the whole meaning.
     */
    dot?: boolean;
    accessibilityLabel?: string;
      /** Canonical layout-only placement. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;

export const CounterBadge = forwardRef<HTMLSpanElement, CounterBadgeProps>(
  function CounterBadge(
    {
      count,
      max = counterBadgeRecipe.defaults.max,
      tone = counterBadgeRecipe.defaults.tone,
      size = counterBadgeRecipe.defaults.size,
      variant = counterBadgeRecipe.defaults.variant,
      dot = false,
      accessibilityLabel,
      className,
      layoutStyle,
      style,
      ...props
    },
    ref,
  ) {
    const label = formatCounterBadgeCount(count, max);
    if (accessibilityLabel !== undefined && accessibilityLabel.trim().length === 0) {
      throw new TypeError("CounterBadge accessibilityLabel must not be empty");
    }
    if (dot && accessibilityLabel === undefined) {
      // A dot with no name is a decoration that nobody can read.
      throw new TypeError("CounterBadge dot requires an accessibilityLabel");
    }
    if (label === null) return null;
    return (
      <span
        {...props}
        ref={ref}
        className={classNames("hjm-counter-badge", className)}
        data-tone={tone}
        data-size={size}
        data-variant={variant}
        data-dot={dot || undefined}
        style={dot ? { ...style, ...layoutStyle, "--hjm-counter-dot-size": `${counterBadgeRecipe.dotSize}px` } as typeof style : { ...style, ...layoutStyle }}
        aria-hidden={accessibilityLabel === undefined || undefined}
        // A named count needs a semantic role; generic spans cannot carry aria-label.
        role={accessibilityLabel === undefined ? undefined : "img"}
        aria-label={accessibilityLabel}
      >
        {dot ? null : label}
      </span>
    );
  },
);
