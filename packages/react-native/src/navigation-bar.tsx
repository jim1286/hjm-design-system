import type { ReactNode } from "react";
import { View } from "react-native";
import { spacing, radius } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "./provider.js";

export type NavigationBarProps = Readonly<{
  label: string;
  brand: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}>;

/** Adaptive site header; destination and action children keep their own semantics. */
export function NavigationBar({ label, brand, children, actions }: NavigationBarProps) {
  const { colors, environment } = useHjmNativeTheme();
  if (!label.trim()) throw new TypeError("NavigationBar requires an accessible label");
  // Core RN has no portable backdrop blur. Use a solid semantic surface instead
  // of adding a mandatory native blur dependency or faking unreadable transparency.
  return <View accessible={false} accessibilityLabel={label} style={{ direction: environment.direction, gap: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.md }}>
      {brand}<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xs, flexGrow: 1, flexShrink: 1 }}>{children}</View>
    </View>
    {actions && <View style={{ gap: spacing.xs }}>{actions}</View>}
  </View>;
}
