import type { ReactNode } from "react";
import { useOptionalHjmTheme } from "./provider.js";

export type NavigationBarProps = Readonly<{
  label: string;
  brand: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}>;

/** Site navigation composition; Menu/SearchField continue to own their behavior. */
export function NavigationBar({ label, brand, children, actions }: NavigationBarProps) {
  const theme = useOptionalHjmTheme();
  if (!label.trim()) throw new TypeError("NavigationBar requires an accessible label");
  return <nav aria-label={label} className="hjm-navigation-bar" dir={theme?.environment.direction}>
    <div className="hjm-navigation-bar__brand">{brand}</div>
    <div className="hjm-navigation-bar__destinations">{children}</div>
    {actions && <div className="hjm-navigation-bar__actions">{actions}</div>}
  </nav>;
}
