import { bottomCtaRecipe } from "@hjmds/design-contracts/recipes";
import { isLargeTextScale } from "@hjmds/design-contracts/components/design-system-provider";
import { forwardRef, type CSSProperties, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { Button, type ButtonSize, type ButtonTone } from "./actions.js";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type BottomCTAAction = Readonly<{
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
}>;

export type BottomCTAProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & Readonly<{
  primaryAction: BottomCTAAction;
  secondaryAction?: BottomCTAAction | ReactNode;
  description?: string;
  accessibilityLabel?: string;
  safeAreaBottom?: number;
  /** Sticky remains in document flow; fixed overlays would need a measured content spacer. */
  position?: "flow" | "sticky";
}>;

function Action({ action, tone }: { action: BottomCTAAction; tone: ButtonTone }) {
  if (!action.label.trim()) throw new TypeError("BottomCTA action label must not be empty");
  return <Button onClick={action.onClick} tone={action.tone ?? tone} size={action.size ?? "medium"}
    disabled={action.disabled} loading={action.loading ?? false}
    aria-label={action.loading ? action.loadingLabel ?? action.accessibilityLabel ?? action.label : action.accessibilityLabel}>
    {action.label}
  </Button>;
}

function isAction(value: BottomCTAAction | ReactNode): value is BottomCTAAction {
  return typeof value === "object" && value !== null && "label" in value && "onClick" in value;
}

/** One primary action with optional supporting copy and a secondary action, matching Native's slots. */
export const BottomCTA = forwardRef<HTMLDivElement, BottomCTAProps>(function BottomCTA({
  primaryAction, secondaryAction, description, accessibilityLabel, safeAreaBottom = 0,
  position = "flow", className, style, ...props
}, ref) {
  const theme = useOptionalHjmTheme();
  if (!Number.isFinite(safeAreaBottom) || safeAreaBottom < 0) throw new RangeError("BottomCTA safeAreaBottom must be non-negative");
  return <div {...props} ref={ref} role="group" aria-label={accessibilityLabel}
    className={classNames("hjm-bottom-cta", className)} data-position={position}
    data-large-text={isLargeTextScale(theme?.environment.textScale ?? 1)}
    style={{
      "--hjm-bottom-cta-min-height": `${bottomCtaRecipe.minHeight}px`,
      "--hjm-bottom-cta-padding-inline": `${bottomCtaRecipe.paddingHorizontal}px`,
      "--hjm-bottom-cta-padding-top": `${bottomCtaRecipe.paddingTop}px`,
      "--hjm-bottom-cta-padding-bottom": `${bottomCtaRecipe.paddingBottom}px`,
      "--hjm-bottom-cta-gap": `${bottomCtaRecipe.gap}px`,
      "--hjm-bottom-cta-safe-area": `${safeAreaBottom}px`, ...style,
    } as CSSProperties}>
    {description ? <p className="hjm-bottom-cta__description">{description}</p> : null}
    <div className="hjm-bottom-cta__actions">
      {secondaryAction == null ? null : <div className="hjm-bottom-cta__secondary">{isAction(secondaryAction) ? <Action action={secondaryAction} tone="secondary" /> : secondaryAction}</div>}
      <div className="hjm-bottom-cta__primary"><Action action={primaryAction} tone="primary" /></div>
    </div>
  </div>;
});
