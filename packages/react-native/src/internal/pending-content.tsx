import { useState, type ReactNode } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import { Spinner } from "./spinner.js";

export type PendingContentProps = Readonly<{
  pending: boolean;
  label: string;
  children: ReactNode;
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Keep form state mounted; a changing pending child must not collapse its enclosing card. */
export function PendingContent({ pending, label, children, layoutStyle }: PendingContentProps) {
  const [height, setHeight] = useState<number>();
  if (pending && !label.trim()) throw new TypeError("PendingContent requires a non-empty pending label");
  const measure = (event: LayoutChangeEvent) => {
    if (!pending && event.nativeEvent.layout.height > 0) setHeight(event.nativeEvent.layout.height);
  };
  return <View style={[layoutStyle, { position: "relative", width: "100%" }, pending && height ? { height } : undefined]}>
    <View onLayout={measure} pointerEvents={pending ? "none" : "auto"}
      accessibilityElementsHidden={pending} importantForAccessibility={pending ? "no-hide-descendants" : "auto"}
      style={pending ? { opacity: 0 } : undefined}>{children}</View>
    {pending ? <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }}>
      <Spinner label={label} />
    </View> : null}
  </View>;
}
