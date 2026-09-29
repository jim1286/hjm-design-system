import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { BackHandler, View } from "react-native";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView, BottomSheetBackdrop, BottomSheetTextInput, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { ReduceMotion } from "react-native-reanimated";
import { Button } from "./actions.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export { BottomSheetTextInput as GestureSheetInput };
export function GestureSheetProvider({ children }: { children: ReactNode }) {
  // Fixed points keep public index semantics stable; dynamic sizing inserts another point.
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
}
export type GestureSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  snapPoints?: readonly (number | `${number}%`)[];
  initialIndex?: number;
  busy?: boolean;
};

/** Explicit gesture variant: it does not silently change the canonical Sheet. */
export function GestureSheet({ open, onOpenChange, title, closeLabel, children,
  snapPoints = ["50%", "90%"], initialIndex = 0, busy = false }: GestureSheetProps) {
  const theme = useHjmNativeTheme();
  const modal = useRef<BottomSheetModal>(null);
  const openRef = useRef(open); openRef.current = open;
  if (!title.trim() || !closeLabel.trim() || !snapPoints.length || !Number.isInteger(initialIndex) || initialIndex < 0 || initialIndex >= snapPoints.length ||
    snapPoints.some(point => typeof point === "number" ? !Number.isFinite(point) || point <= 0 : !/^\d+(\.\d+)?%$/.test(point) || parseFloat(point) <= 0 || parseFloat(point) > 100)) {
    throw new TypeError("GestureSheet needs labels, positive snap points and a valid index");
  }
  useEffect(() => { if (open) modal.current?.present(); else modal.current?.dismiss(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { if (!busy) onOpenChange(false); return true; });
    return () => subscription.remove();
  }, [open, busy, onOpenChange]);
  const backdrop = useCallback((props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props}
    appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={busy ? "none" : "close"} />, [busy]);
  // Fixed points keep public index semantics stable; dynamic sizing inserts another point.
  return <BottomSheetModal ref={modal} index={initialIndex} snapPoints={[...snapPoints]}
    enableDynamicSizing={false} enablePanDownToClose={!busy} backdropComponent={backdrop}
    overrideReduceMotion={theme.environment.reducedMotion ? ReduceMotion.Always : ReduceMotion.System}
    backgroundStyle={{ backgroundColor: theme.colors.surface }}
    handleIndicatorStyle={{ backgroundColor: theme.colors.text }}
    onDismiss={() => { if (openRef.current) onOpenChange(false); }}>
    <BottomSheetScrollView keyboardShouldPersistTaps="handled">
      <View accessibilityViewIsModal style={{ padding: theme.tokens.spacing.lg }}>
        <Text accessibilityRole="header">{title}</Text>
        {children}
        <Button disabled={busy} onPress={() => onOpenChange(false)}>{closeLabel}</Button>
      </View>
    </BottomSheetScrollView>
  </BottomSheetModal>;
}
