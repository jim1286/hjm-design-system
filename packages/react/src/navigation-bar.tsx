import type { ReactNode } from "react";
import { useOptionalHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";

export type NavigationBarProps = Readonly<{
  label: string;
  brand: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Site navigation composition; Menu/SearchField continue to own their behavior. */
export function NavigationBar({ label, brand, children, actions, layoutStyle }: NavigationBarProps) {
  const theme = useOptionalHjmTheme();
  if (!label.trim()) throw new TypeError("NavigationBar requires an accessible label");
  return <nav aria-label={label} className="hjm-navigation-bar" style={layoutStyle} dir={theme?.environment.direction}>
    <div className="hjm-navigation-bar__brand">{brand}</div>
    <div className="hjm-navigation-bar__destinations">{children}</div>
    {actions && <div className="hjm-navigation-bar__actions">{actions}</div>}
  </nav>;
}
