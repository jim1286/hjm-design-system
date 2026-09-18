import { topBarRecipe } from "@hjmds/design-contracts/recipes";
import { forwardRef, type CSSProperties, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { Button } from "./actions.js";
import { classNames } from "./internal.js";
import { useOptionalHjmTheme } from "./provider.js";

export type TopBarProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & Readonly<{
  title?: string;
  titleLeading?: ReactNode;
  onTitleClick?: MouseEventHandler<HTMLButtonElement>;
  titleAccessibilityLabel?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  leading?: ReactNode;
  trailing?: ReactNode;
  actions?: ReactNode;
  centered?: boolean;
  safeAreaTop?: number;
}>;

/** Screen chrome stays composable inside pages and dialogs, without adding a second banner landmark. */
export const TopBar = forwardRef<HTMLDivElement, TopBarProps>(function TopBar({
  title, titleLeading, onTitleClick, titleAccessibilityLabel, headingLevel = 1,
  leading, trailing, actions, centered = topBarRecipe.defaults.centered, safeAreaTop = 0,
  className, style, ...props
}, ref) {
  const theme = useOptionalHjmTheme();
  if (!Number.isFinite(safeAreaTop) || safeAreaTop < 0) throw new RangeError("TopBar safeAreaTop must be non-negative");
  if (title !== undefined && !title.trim()) throw new TypeError("TopBar title must not be empty");
  if (titleAccessibilityLabel !== undefined && !titleAccessibilityLabel.trim()) throw new TypeError("TopBar titleAccessibilityLabel must not be empty");
  if (actions !== undefined && trailing !== undefined) throw new TypeError("TopBar accepts either trailing or actions");
  if (title === undefined && (titleLeading !== undefined || onTitleClick !== undefined || titleAccessibilityLabel !== undefined)) {
    throw new TypeError("TopBar title affordances require a title");
  }
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <div {...props} ref={ref} className={classNames("hjm-top-bar", className)}
    data-centered={centered} data-large-text={(theme?.environment.textScale ?? 1) >= topBarRecipe.largeTextThreshold}
    style={{
      "--hjm-top-bar-min-height": `${topBarRecipe.minHeight}px`,
      "--hjm-top-bar-padding": `${topBarRecipe.paddingHorizontal}px`,
      "--hjm-top-bar-gap": `${topBarRecipe.gap}px`,
      "--hjm-top-bar-safe-area": `${safeAreaTop}px`, ...style,
    } as CSSProperties}>
    <div className="hjm-top-bar__leading">{leading}</div>
    <div className="hjm-top-bar__title">
      {title === undefined ? null : <Heading className="hjm-top-bar__heading">
        {onTitleClick ? <Button tone="ghost" onClick={onTitleClick} aria-label={titleAccessibilityLabel} leading={titleLeading}>{title}</Button>
          : <span aria-label={titleAccessibilityLabel}>{titleLeading}{title}</span>}
      </Heading>}
    </div>
    <div className="hjm-top-bar__trailing">{actions ?? trailing}</div>
  </div>;
});
