import {
  getIconTransform,
  resolveIconDescriptor,
  type IconDescriptor,
  type SemanticIconName,
} from "@hjm/design-contracts/components/icon";
import {
  imageRecipe,
  resolveImageAspectRatio,
  resolveImageDescriptor,
  resolveImageFallbackAccessibilityLabel,
  type ImageDescriptor,
  type ImageLoadStatus,
} from "@hjm/design-contracts/components/image";
import {
  counterBadgeRecipe,
  formatCounterBadgeCount,
  iconRecipe,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
} from "@hjm/design-contracts/recipes";
import {
  forwardRef,
  useState,
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

/** Internal, dependency-free semantic glyph registry. All marks share one 24px stroke grid. */
const iconPaths = {
  add: "M12 5v14M5 12h14",
  ai: "M12 2l1.2 4.1L17 8l-3.8 1.9L12 14l-1.2-4.1L7 8l3.8-1.9L12 2ZM19 14l.7 2.3L22 17.5l-2.3 1.2L19 21l-.7-2.3-2.3-1.2 2.3-1.2L19 14Z",
  alert: "M12 3 2.7 20h18.6L12 3Zm0 6v4m0 3h.01",
  back: "M15 18 9 12l6-6M9 12h10",
  calendar: "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2-2v4m10-4v4M3 9h18",
  check: "m5 12 4 4L19 6",
  chevronDown: "m6 9 6 6 6-6",
  chevronEnd: "m9 6 6 6-6 6",
  chevronStart: "m15 6-6 6 6 6",
  chevronUp: "m6 15 6-6 6 6",
  close: "M6 6l12 12M18 6 6 18",
  compare: "M8 7h11m0 0-3-3m3 3-3 3M16 17H5m0 0 3-3m-3 3 3 3",
  copy: "M8 8h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8Zm8 0V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3",
  delete: "M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6",
  download: "M12 3v12m0 0 5-5m-5 5-5-5M4 19v2h16v-2",
  edit: "m4 16-1 5 5-1L19 9l-4-4L4 16Zm9-9 4 4",
  error: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v5m0 3h.01",
  favorite: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  filter: "M3 5h18l-7 8v6l-4 2v-8L3 5Z",
  forward: "m9 6 6 6-6 6m6-6H5",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-3-13a3 3 0 1 1 4.7 2.5c-1 .7-1.7 1.2-1.7 2.5m0 3h.01",
  home: "m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01",
  lock: "M6 10h12v11H6V10Zm3 0V7a3 3 0 0 1 6 0v3",
  menu: "M4 6h16M4 12h16M4 18h16",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  notifications: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
  pause: "M8 5v14m8-14v14",
  play: "m8 5 11 7-11 7V5Z",
  refresh: "M20 7v5h-5M4 17v-5h5m10.5-3A8 8 0 0 0 6 6l-2 2m.5 7A8 8 0 0 0 18 18l2-2",
  search: "m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.4-3.5 2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-1.2L14.7 4h-4l-.4 2.8A8 8 0 0 0 8 8L5.6 7l-2 3.5 2 1.5a8 8 0 0 0 0 2l-2 1.5 2 3.5L8 18a8 8 0 0 0 2.3 1.2l.4 2.8h4l.3-2.8A8 8 0 0 0 17 18l2.4 1 2-3.5-2-1.5a8 8 0 0 0 0-2Z",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 16.5l6.8 4M15.4 6.5l-6.8 4",
  success: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-5-10 3 3 7-7",
  trendDown: "M3 7l7 7 4-4 7 7m0 0v-6m0 6h-6",
  trendFlat: "M4 12h16m0 0-4-4m4 4-4 4",
  trendUp: "M3 17l7-7 4 4 7-7m0 0v6m0-6h-6",
  upload: "M12 21V9m0 0-5 5m5-5 5 5M4 5V3h16v2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0m1-16a4 4 0 0 1 0 7m0 3a6 6 0 0 1 5 6",
  visibility: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  visibilityOff: "m3 3 18 18M10.6 5.2A9 9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-2.1 3M6.6 6.6C3.8 8.5 2 12 2 12s4 7 10 7a9 9 0 0 0 3.4-.7M9.9 9.9a3 3 0 0 0 4.2 4.2",
  warning: "M12 3 2.7 20h18.6L12 3Zm0 6v4m0 3h.01",
} as const satisfies Record<SemanticIconName, string>;

export type IconProps = Omit<
  SVGAttributes<SVGSVGElement>,
  "children" | "color"
> & IconDescriptor;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    name,
    size,
    tone,
    weight,
    directionality,
    decorative,
    accessibilityLabel,
    className,
    style,
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
      style={style}
    >
      <path d={iconPaths[descriptor.name]} />
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
  }>;

type ImageState = Readonly<{
  src: string;
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
  const [state, setState] = useState<ImageState>({
    src: descriptor.src,
    status: "loading",
  });
  const status = state.src === descriptor.src ? state.status : "loading";
  const {
    className: imageClassName,
    style: imageStyle,
    ...restImageProps
  } = imageProps ?? {};

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    setState({ src: descriptor.src, status: "loaded" });
    onLoadStatusChange?.("loaded");
    onLoad?.(event);
  };
  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    setState({ src: descriptor.src, status: "error" });
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
    accessibilityLabel?: string;
  }>;

export const CounterBadge = forwardRef<HTMLSpanElement, CounterBadgeProps>(
  function CounterBadge(
    {
      count,
      max = counterBadgeRecipe.defaults.max,
      tone = counterBadgeRecipe.defaults.tone,
      size = counterBadgeRecipe.defaults.size,
      variant = counterBadgeRecipe.defaults.variant,
      accessibilityLabel,
      className,
      ...props
    },
    ref,
  ) {
    const label = formatCounterBadgeCount(count, max);
    if (accessibilityLabel !== undefined && accessibilityLabel.trim().length === 0) {
      throw new TypeError("CounterBadge accessibilityLabel must not be empty");
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
        aria-hidden={accessibilityLabel === undefined || undefined}
        aria-label={accessibilityLabel}
      >
        {label}
      </span>
    );
  },
);
