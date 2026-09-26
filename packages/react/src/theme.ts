import {
  control,
  easing,
  fontFamily,
  fontWeight,
  motion,
  radius,
  shadow,
  spacing,
  stroke,
  typography,
} from "@hjmds/design-contracts/foundations";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { focusIndicatorContract } from "@hjmds/design-contracts/contracts";
import {
  visibleControlHeight,
  type DesignSystemProviderValue,
} from "@hjmds/design-contracts/components/design-system-provider";
import { buttonRecipe, fieldRecipe } from "@hjmds/design-contracts/recipes/base";
import {
  bottomNavigationRecipe,
  dialogRecipe,
  listRowRecipe,
  sheetRecipe,
  skeletonRecipe,
  switchRecipe,
  toastRecipe,
} from "@hjmds/design-contracts/recipes";
import type { CSSProperties } from "react";

export type HjmThemeStyle = CSSProperties &
  Record<`--hjm-${string}`, string | number>;

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

type ShadowToken = Readonly<{ color: string; opacity: number; radius: number; offsetY: number }>;

// RN shadow token -> CSS; blur = radius, as react-native-web maps it.
function shadowCss(token: ShadowToken): string {
  const hex = token.color.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
  return `0 ${token.offsetY}px ${token.radius}px rgb(${r} ${g} ${b} / ${Math.round(token.opacity * 100)}%)`;
}

function rem(value: number): string {
  return `${Number((value / 16).toFixed(5))}rem`;
}

export function createHjmThemeStyle(
  value: DesignSystemProviderValue,
): HjmThemeStyle {
  const { environment, palette } = value;
  const style: HjmThemeStyle = {
    "--hjm-text-scale": environment.textScale,
    "--hjm-motion-scale": environment.reducedMotion ? 0 : 1,
    colorScheme: environment.theme,
    backgroundColor: palette.theme.bg,
    color: palette.theme.text,
  };

  for (const [name, color] of Object.entries(palette.theme)) {
    style[`--hjm-color-${kebab(name)}`] = color;
  }
  for (const [name, color] of Object.entries(palette.statusAccents)) {
    style[`--hjm-accent-${kebab(name)}`] = color;
  }
  for (const [name, color] of Object.entries(palette.statusAccentFills)) {
    style[`--hjm-accent-fill-${kebab(name)}`] = color;
  }
  for (const [name, value] of Object.entries(spacing)) {
    style[`--hjm-space-${kebab(name)}`] = `${value}px`;
  }
  for (const [name, value] of Object.entries(radius)) {
    style[`--hjm-radius-${kebab(name)}`] = `${value}px`;
  }
  for (const [name, value] of Object.entries(typography)) {
    style[`--hjm-type-${kebab(name)}-size`] =
      `calc(${rem(value.fontSize)} * var(--hjm-text-scale))`;
    style[`--hjm-type-${kebab(name)}-line-height`] =
      `calc(${rem(value.lineHeight)} * var(--hjm-text-scale))`;
    style[`--hjm-type-${kebab(name)}-weight`] = value.fontWeight;
  }
  for (const [name, value] of Object.entries(fontWeight)) {
    style[`--hjm-font-weight-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(motion)) {
    style[`--hjm-motion-${kebab(name)}`] = environment.reducedMotion
      ? "0ms"
      : `${value}ms`;
  }

  style["--hjm-font-family-ui"] = fontFamily.ui.join(", ");
  for (const [name, value] of Object.entries(stroke)) {
    style[`--hjm-stroke-${kebab(name)}`] = `${value}px`;
  }
  // Unset before 1.4.1, so focus rules were invalid and drew no ring.
  style["--hjm-color-focus"] = resolveColorReference(focusIndicatorContract.color, palette);
  style["--hjm-focus-width"] = `${focusIndicatorContract.width}px`;
  style["--hjm-focus-offset"] = `${focusIndicatorContract.offset}px`;
  style["--hjm-bottom-navigation-pressed-background"] = resolveColorReference(
    bottomNavigationRecipe.states.pressedBackground,
    palette,
  );
  // Row rhythm and the leading frame come from the recipe so the stylesheet
  // does not carry a second copy of the same numbers.
  style["--hjm-list-row-gap"] = rem(listRowRecipe.gap);
  style["--hjm-list-row-leading-size"] = rem(listRowRecipe.leadingSize);
  for (const [name, value] of Object.entries(switchRecipe.sizes)) {
    style[`--hjm-switch-${kebab(name)}-width`] = rem(value.width);
    style[`--hjm-switch-${kebab(name)}-height`] = rem(value.height);
    style[`--hjm-switch-${kebab(name)}-thumb`] = rem(value.thumb);
    style[`--hjm-switch-${kebab(name)}-inset`] = rem(value.inset);
    style[`--hjm-switch-${kebab(name)}-offset`] = rem(
      value.width - value.thumb - value.inset * 2,
    );
  }
  for (const [name, value] of Object.entries(listRowRecipe.density)) {
    style[`--hjm-list-row-${kebab(name)}-one-line`] = rem(value.oneLineMinHeight);
    style[`--hjm-list-row-${kebab(name)}-two-line`] = rem(value.twoLineMinHeight);
    style[`--hjm-list-row-${kebab(name)}-padding-inline`] = rem(value.paddingHorizontal);
    style[`--hjm-list-row-${kebab(name)}-padding-block`] = rem(value.paddingVertical);
  }
  // The recipe owns these; a second copy in the stylesheet drifts silently
  // because the gates read that file as text only. Block and text heights
  // already resolve through --hjm-space-*, so they are not re-emitted.
  const skeletonCurve = easing[skeletonRecipe.animation.easing];
  style["--hjm-skeleton-circle-size"] =
    `${skeletonRecipe.shapes.circle.defaultHeight}px`;
  style["--hjm-skeleton-duration"] = `${skeletonRecipe.animation.duration}ms`;
  style["--hjm-skeleton-easing"] = `cubic-bezier(${skeletonCurve.join(", ")})`;
  style["--hjm-skeleton-from-opacity"] = skeletonRecipe.animation.fromOpacity;
  style["--hjm-skeleton-to-opacity"] = skeletonRecipe.animation.toOpacity;
  for (const [name, token] of Object.entries(shadow)) {
    style[`--hjm-shadow-${kebab(name)}`] = shadowCss(token);
  }
  // Overlay chrome and sizes come from the recipes Native reads (1.5.0).
  for (const [name, chrome] of [["dialog", dialogRecipe.content], ["sheet", sheetRecipe.content], ["toast", toastRecipe.surface]] as const) {
    style[`--hjm-${name}-background`] = resolveColorReference(chrome.background, palette);
    style[`--hjm-${name}-border`] = resolveColorReference(chrome.border, palette);
    style[`--hjm-${name}-border-width`] = `${chrome.borderWidth}px`;
    style[`--hjm-${name}-radius`] = `var(--hjm-radius-${chrome.radius})`;
    style[`--hjm-${name}-shadow`] = shadowCss(chrome.shadow);
  }
  style["--hjm-sheet-max-height"] = `${sheetRecipe.content.maxHeightRatio * 100}dvh`;
  style["--hjm-sheet-max-width"] = `${sheetRecipe.web.maxWidth}px`;
  style["--hjm-sheet-handle-width"] = `${sheetRecipe.handle.width}px`;
  style["--hjm-sheet-handle-height"] = `${sheetRecipe.handle.height}px`;
  style["--hjm-sheet-handle-color"] = resolveColorReference(sheetRecipe.handle.color, palette);
  for (const [name, ratio] of Object.entries(sheetRecipe.sizes)) {
    if (ratio !== null) style[`--hjm-sheet-size-${name}`] = `${ratio * 100}dvh`;
  }
  const toastExit = toastRecipe.transition.web.exit;
  style["--hjm-toast-exit-duration"] = environment.reducedMotion ? "0ms" : `${toastExit.duration}ms`;
  style["--hjm-toast-exit-easing"] = `cubic-bezier(${easing[toastExit.easing].join(", ")})`;
  style["--hjm-button-pressed-opacity"] = buttonRecipe.opacity.pressed;
  style["--hjm-button-disabled-opacity"] = buttonRecipe.opacity.disabled;
  style["--hjm-field-border-width"] = `${fieldRecipe.borderWidth}px`;
  style["--hjm-field-focus-ring-width"] = `${fieldRecipe.focusRingWidth}px`;
  style["--hjm-field-disabled-opacity"] = fieldRecipe.disabledOpacity;
  style["--hjm-control-min-touch-target"] = `${control.minTouchTarget}px`;
  style["--hjm-control-field-height"] = `${control.fieldHeight}px`;
  style["--hjm-field-multiline-min-height"] = rem(fieldRecipe.multilineMinHeight);
  style["--hjm-field-padding-block"] = rem(fieldRecipe.paddingVertical);
  for (const [name, value] of Object.entries(control.buttonHeight)) {
    // The axis is applied to the emitted variables rather than to each rule so
    // that every stylesheet consumer of a control height honours it at once.
    style[`--hjm-control-button-${kebab(name)}`] =
      `${visibleControlHeight(value, environment.minimumVisualTarget)}px`;
  }

  return style;
}
