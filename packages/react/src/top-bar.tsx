import { topBarRecipe } from "@hjmds/design-contracts/recipes";
import { forwardRef, type CSSProperties, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { Button } from "./actions.js";
import { ScreenExitButton, type ScreenExit } from "./internal/screen-exit.js";
import { validateScreenExit } from "@hjmds/design-contracts/screen-patterns";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type TopBarProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
  title?: string;
  /** Product control in the shared title slot; exclusive with text title affordances. */
  titleContent?: ReactNode;
  /** Secondary product context; the shared title slot owns its placement. */
  subtitle?: string;
  titleLeading?: ReactNode;
  onTitleClick?: MouseEventHandler<HTMLButtonElement>;
  titleAccessibilityLabel?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Leaving this screen: icon-only back/close fixed at the leading edge (2026-10-17). Exclusive with `leading`. */
  exit?: ScreenExit;
  leading?: ReactNode;
  trailing?: ReactNode;
  actions?: ReactNode;
  safeAreaTop?: number;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Screen chrome stays composable inside pages and dialogs, without adding a second banner landmark. */
export const TopBar = forwardRef<HTMLDivElement, TopBarProps>(function TopBar({
  title, titleContent, subtitle, titleLeading, onTitleClick, titleAccessibilityLabel, headingLevel = 1,
  exit, leading: leadingSlot, trailing, actions, safeAreaTop = 0,
  className, style, layoutStyle, ...props
}, ref) {
  const theme = useOptionalHjmTheme();
  if (exit) validateScreenExit(exit, leadingSlot !== undefined);
  const leading = exit ? <ScreenExitButton {...exit} /> : leadingSlot;
  if (titleContent !== undefined && (title !== undefined || subtitle !== undefined || titleLeading !== undefined || onTitleClick !== undefined || titleAccessibilityLabel !== undefined)) {
    throw new TypeError("TopBar titleContent is exclusive with title affordances");
  }
  if (subtitle !== undefined && !subtitle.trim()) throw new TypeError("TopBar subtitle must not be empty");
  if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) throw new RangeError("TopBar safeAreaTop must be non-negative");
  if (title !== undefined && !title.trim()) throw new TypeError("TopBar title must not be empty");
  if (titleAccessibilityLabel !== undefined && !titleAccessibilityLabel.trim()) throw new TypeError("TopBar titleAccessibilityLabel must not be empty");
  if (actions !== undefined && trailing !== undefined) throw new TypeError("TopBar accepts either trailing or actions");
  if (title === undefined && (subtitle !== undefined || titleLeading !== undefined || onTitleClick !== undefined || titleAccessibilityLabel !== undefined)) {
    throw new TypeError("TopBar title affordances require a title");
  }
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <div {...props} ref={ref} className={classNames("hjm-top-bar", className)}
    data-large-text={(theme?.environment.textScale ?? 1) >= topBarRecipe.largeTextThreshold}
    style={{
      "--hjm-top-bar-min-height": `${topBarRecipe.minHeight}px`,
      "--hjm-top-bar-padding": `${topBarRecipe.paddingHorizontal}px`,
      "--hjm-top-bar-gap": `${topBarRecipe.gap}px`,
      "--hjm-top-bar-safe-area": `${safeAreaTop}px`, ...style, ...layoutStyle,
    } as CSSProperties}>
    <div className="hjm-top-bar__leading">{leading}</div>
    <div className="hjm-top-bar__title">
      {titleContent ?? (title === undefined ? null : <Heading className="hjm-top-bar__heading">
        {onTitleClick ? <Button tone="ghost" onClick={onTitleClick} aria-label={titleAccessibilityLabel} leading={titleLeading}>{title}</Button>
          : <span aria-label={titleAccessibilityLabel}>{titleLeading}{title}</span>}
      </Heading>)}
      {subtitle ? <span className="hjm-top-bar__subtitle">{subtitle}</span> : null}
    </div>
    <div className="hjm-top-bar__trailing">{actions ?? trailing}</div>
  </div>;
});
