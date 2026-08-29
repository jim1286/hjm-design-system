import type { CSSProperties } from "react";

import {
  backdrop,
  breakpoint,
  control,
  easing,
  fontFamily,
  fontWeight,
  glyph,
  heading,
  layer,
  layout,
  letterSpacing,
  motion,
  motionPreset,
  numeric,
  opacity,
  overlay,
  radius,
  shadow,
  spacing,
  spring,
  stateLayer,
  stroke,
  typography,
  withAlpha,
  type DesignSystemProviderValue,
} from "@hjmds/design-contracts";

export type HjmWebThemeStyle = CSSProperties &
  Record<`--hjm-${string}`, string | number>;

function kebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function px(value: number): string {
  return `${value}px`;
}

function ms(value: number): string {
  return `${value}ms`;
}

const browserRootFontSize = 16;

function rem(value: number): string {
  return `${Number((value / browserRootFontSize).toFixed(5))}rem`;
}

function scaledRem(value: number): string {
  return `calc(${rem(value)} * var(--hjm-text-scale))`;
}

function cssShadow(value: (typeof shadow)[keyof typeof shadow]): string {
  return `0 ${px(value.offsetY)} ${px(value.radius)} ${withAlpha(value.color, value.opacity)}`;
}

/**
 * Translate renderer-neutral foundations once at the Web boundary. Legacy
 * aliases stay available while Showcase CSS migrates to the namespaced scale.
 */
export function createWebThemeStyle(
  providerValue: DesignSystemProviderValue,
): HjmWebThemeStyle {
  const { environment, palette } = providerValue;
  const colors = palette.theme;
  const variables: HjmWebThemeStyle = {
    "--hjm-text-scale": environment.textScale,
    "--hjm-motion-scale": environment.reducedMotion ? 0 : 1,
    backgroundColor: colors.bg,
    color: colors.text,
  };

  for (const [name, value] of Object.entries(colors)) {
    variables[`--hjm-color-${kebabCase(name)}`] = value;
    // Backward-compatible aliases consumed by the current Showcase stylesheet.
    variables[`--hjm-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(palette.statusAccents)) {
    variables[`--hjm-accent-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(palette.statusAccentFills)) {
    variables[`--hjm-accent-fill-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(spacing)) {
    variables[`--hjm-space-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(radius)) {
    variables[`--hjm-radius-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(fontFamily)) {
    variables[`--hjm-font-family-${kebabCase(name)}`] = value.join(", ");
  }
  for (const [name, value] of Object.entries(fontWeight)) {
    variables[`--hjm-font-weight-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(letterSpacing)) {
    variables[`--hjm-letter-spacing-${kebabCase(name)}-base`] = rem(value);
    variables[`--hjm-letter-spacing-${kebabCase(name)}`] = scaledRem(value);
  }
  for (const [name, value] of Object.entries(numeric)) {
    variables[`--hjm-numeric-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(typography)) {
    variables[`--hjm-type-${kebabCase(name)}-size-base`] = rem(value.fontSize);
    variables[`--hjm-type-${kebabCase(name)}-line-height-base`] = rem(value.lineHeight);
    variables[`--hjm-type-${kebabCase(name)}-size`] = scaledRem(value.fontSize);
    variables[`--hjm-type-${kebabCase(name)}-line-height`] = scaledRem(value.lineHeight);
    variables[`--hjm-type-${kebabCase(name)}-weight`] = value.fontWeight;
  }
  for (const [name, value] of Object.entries(heading)) {
    variables[`--hjm-heading-${kebabCase(name)}-size-base`] = rem(value.fontSize);
    variables[`--hjm-heading-${kebabCase(name)}-line-height-base`] = rem(value.lineHeight);
    variables[`--hjm-heading-${kebabCase(name)}-size`] = scaledRem(value.fontSize);
    variables[`--hjm-heading-${kebabCase(name)}-line-height`] = scaledRem(value.lineHeight);
    variables[`--hjm-heading-${kebabCase(name)}-weight`] = value.fontWeight;
  }
  for (const [name, value] of Object.entries(glyph)) {
    variables[`--hjm-glyph-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(motion)) {
    variables[`--hjm-motion-${kebabCase(name)}`] = ms(value);
  }
  for (const [name, value] of Object.entries(easing)) {
    variables[`--hjm-easing-${kebabCase(name)}`] = `cubic-bezier(${value.join(", ")})`;
  }
  for (const [name, value] of Object.entries(motionPreset)) {
    const duration = ms(value.duration);
    variables[`--hjm-motion-preset-${kebabCase(name)}-duration`] = duration;
    variables[`--hjm-motion-preset-${kebabCase(name)}-effective-duration`] =
      environment.reducedMotion && value.reducedMotion === "instant" ? "0ms" : duration;
    variables[`--hjm-motion-preset-${kebabCase(name)}-easing`] =
      `var(--hjm-easing-${kebabCase(value.easing)})`;
    variables[`--hjm-motion-preset-${kebabCase(name)}-reduced`] = value.reducedMotion;
  }
  variables["--hjm-motion-strategy-instant-duration"] = environment.reducedMotion
    ? "0ms"
    : ms(motion.fast);
  variables["--hjm-motion-strategy-opacity-duration"] = ms(motion.normal);
  variables["--hjm-motion-strategy-static-play-state"] = environment.reducedMotion
    ? "paused"
    : "running";
  for (const [name, value] of Object.entries(spring)) {
    variables[`--hjm-spring-${kebabCase(name)}-stiffness`] = value.stiffness;
    variables[`--hjm-spring-${kebabCase(name)}-damping`] = value.damping;
    variables[`--hjm-spring-${kebabCase(name)}-mass`] = value.mass;
  }
  for (const [name, value] of Object.entries(opacity)) {
    variables[`--hjm-opacity-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(stateLayer)) {
    variables[`--hjm-state-layer-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(stroke)) {
    variables[`--hjm-stroke-${kebabCase(name)}`] = px(value);
  }

  variables["--hjm-control-min-touch-target"] = px(control.minTouchTarget);
  variables["--hjm-control-field-height"] = px(control.fieldHeight);
  variables["--hjm-control-selection-indicator"] = px(control.selectionIndicator);
  for (const [name, value] of Object.entries(control.buttonHeight)) {
    variables[`--hjm-control-button-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(control.chipHeight)) {
    variables[`--hjm-control-chip-${kebabCase(name)}`] = px(value);
  }

  variables["--hjm-layout-section-gap"] = px(layout.sectionGap);
  variables["--hjm-layout-content-gap"] = px(layout.contentGap);
  variables["--hjm-layout-reading-max-width"] = px(layout.readingMaxWidth);
  variables["--hjm-layout-content-max-width"] = px(layout.contentMaxWidth);
  for (const [name, value] of Object.entries(layout.pagePadding)) {
    variables[`--hjm-layout-page-padding-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(layout.rowHeight)) {
    variables[`--hjm-layout-row-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(breakpoint)) {
    variables[`--hjm-breakpoint-${kebabCase(name)}`] = px(value);
  }
  for (const [name, value] of Object.entries(layer)) {
    variables[`--hjm-layer-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(overlay)) {
    variables[`--hjm-overlay-${kebabCase(name)}`] = value;
  }
  for (const [name, value] of Object.entries(backdrop)) {
    variables[`--hjm-backdrop-${kebabCase(name)}`] = withAlpha(value.color, value.opacity);
  }
  for (const [name, value] of Object.entries(shadow)) {
    variables[`--hjm-shadow-${kebabCase(name)}`] = cssShadow(value);
  }

  return variables;
}
