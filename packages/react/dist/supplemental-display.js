import { jsx as _jsx } from "react/jsx-runtime";
import { getIconTransform, resolveIconDescriptor, semanticIconPaths, } from "@hjmds/design-contracts/components/icon";
import { imageRecipe, resolveImageAspectRatio, resolveImageDescriptor, resolveImageFallbackAccessibilityLabel, } from "@hjmds/design-contracts/components/image";
import { counterBadgeRecipe, formatCounterBadgeCount, iconRecipe, } from "@hjmds/design-contracts/recipes";
import { forwardRef, useState, useMemo, useRef, useLayoutEffect, } from "react";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
export const Icon = forwardRef(function Icon({ name, size, tone, weight, directionality, decorative, accessibilityLabel, renderGlyph, className, style, layoutStyle, ...props }, ref) {
    const descriptor = resolveIconDescriptor({
        name,
        ...(size === undefined ? {} : { size }),
        ...(tone === undefined ? {} : { tone }),
        ...(weight === undefined ? {} : { weight }),
        ...(directionality === undefined ? {} : { directionality }),
        ...(decorative === undefined ? {} : { decorative }),
        ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
    });
    const theme = useOptionalHjmTheme();
    const transform = getIconTransform(descriptor.directionality, theme?.environment.direction ?? "ltr");
    const dimension = iconRecipe.sizes[descriptor.size];
    return (_jsx("svg", { ...props, ref: ref, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: classNames("hjm-icon", className), "data-name": descriptor.name, "data-size": descriptor.size, "data-tone": descriptor.tone, "data-weight": descriptor.weight, "data-transform": transform, width: dimension, height: dimension, stroke: "currentColor", strokeWidth: iconRecipe.weights[descriptor.weight], strokeLinecap: "round", strokeLinejoin: "round", role: descriptor.decorative ? undefined : "img", "aria-hidden": descriptor.decorative || undefined, "aria-label": descriptor.decorative ? undefined : descriptor.accessibilityLabel, focusable: "false", style: { ...style, ...layoutStyle }, children: renderGlyph?.({ name: descriptor.name, size: 24, color: "currentColor", strokeWidth: iconRecipe.weights[descriptor.weight] }) ?? _jsx("path", { d: semanticIconPaths[descriptor.name] }) }));
});
/** Intrinsic-size image with canonical alt semantics and an accessible fallback. */
export const Image = forwardRef(function Image({ src, width, height, fit, decorative, accessibilityLabel, imageProps, renderImage, fallback, imageRef, onLoad, onError, onLoadStatusChange, className, style, layoutStyle, ...props }, ref) {
    const descriptor = resolveImageDescriptor({
        src,
        width,
        height,
        ...(fit === undefined ? {} : { fit }),
        ...(decorative === undefined ? {} : { decorative }),
        ...(accessibilityLabel === undefined ? {} : { accessibilityLabel }),
    });
    // A→B→A is a new request even when the URL repeats. Retire adapter callbacks
    // at commit/unmount so old network events cannot update state or product observers.
    // Responsive source candidates and request policy are part of image identity;
    // a new srcSet must recover even when its fallback src is unchanged.
    const generation = useMemo(() => ({}), [descriptor.src, imageProps?.srcSet, imageProps?.sizes, imageProps?.crossOrigin, imageProps?.referrerPolicy]);
    const activeGeneration = useRef(generation);
    useLayoutEffect(() => {
        activeGeneration.current = generation;
        return () => { activeGeneration.current = null; };
    }, [generation]);
    const [state, setState] = useState({ generation, status: "loading" });
    const status = state.generation === generation ? state.status : "loading";
    const { className: imageClassName, style: imageStyle, ...restImageProps } = imageProps ?? {};
    const handleLoad = (event) => {
        if (activeGeneration.current !== generation)
            return;
        setState({ generation, status: "loaded" });
        onLoadStatusChange?.("loaded");
        onLoad?.(event);
    };
    const handleError = (event) => {
        if (activeGeneration.current !== generation)
            return;
        setState({ generation, status: "error" });
        onLoadStatusChange?.("error");
        onError?.(event);
    };
    const adapterProps = {
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
    let visual;
    if (status === "error") {
        const fallbackLabel = resolveImageFallbackAccessibilityLabel(descriptor);
        visual = (_jsx("span", { className: "hjm-image__fallback", role: descriptor.decorative ? undefined : "img", "aria-label": fallbackLabel, "aria-hidden": descriptor.decorative || undefined, children: _jsx("span", { className: "hjm-image__fallback-icon", "aria-hidden": "true", children: fallback ?? (_jsx(Icon, { name: imageRecipe.fallback.icon.name, tone: imageRecipe.fallback.icon.tone, decorative: true })) }) }));
    }
    else if (renderImage === undefined) {
        const { ref: assetRef, ...nativeImageProps } = adapterProps;
        visual = _jsx("img", { ...nativeImageProps, ref: assetRef });
    }
    else {
        visual = renderImage(adapterProps);
    }
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-image", className), "data-fit": descriptor.fit, "data-status": status, style: {
            inlineSize: descriptor.width,
            ...style,
            ...layoutStyle,
            aspectRatio: resolveImageAspectRatio(descriptor.width, descriptor.height),
        }, children: visual }));
});
export const CounterBadge = forwardRef(function CounterBadge({ count, max = counterBadgeRecipe.defaults.max, tone = counterBadgeRecipe.defaults.tone, size = counterBadgeRecipe.defaults.size, variant = counterBadgeRecipe.defaults.variant, dot = false, accessibilityLabel, className, layoutStyle, style, ...props }, ref) {
    const label = formatCounterBadgeCount(count, max);
    if (accessibilityLabel !== undefined && accessibilityLabel.trim().length === 0) {
        throw new TypeError("CounterBadge accessibilityLabel must not be empty");
    }
    if (dot && accessibilityLabel === undefined) {
        // A dot with no name is a decoration that nobody can read.
        throw new TypeError("CounterBadge dot requires an accessibilityLabel");
    }
    if (label === null)
        return null;
    return (_jsx("span", { ...props, ref: ref, className: classNames("hjm-counter-badge", className), "data-tone": tone, "data-size": size, "data-variant": variant, "data-dot": dot || undefined, style: dot ? { ...style, ...layoutStyle, "--hjm-counter-dot-size": `${counterBadgeRecipe.dotSize}px` } : { ...style, ...layoutStyle }, "aria-hidden": accessibilityLabel === undefined || undefined, 
        // A named count needs a semantic role; generic spans cannot carry aria-label.
        role: accessibilityLabel === undefined ? undefined : "img", "aria-label": accessibilityLabel, children: dot ? null : label }));
});
//# sourceMappingURL=supplemental-display.js.map