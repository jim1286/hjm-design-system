import type { ComponentType, ReactNode } from "react";
import type { ToastSessionSnapshot, ToastPauseReason, ToastDismissReason, LiquidToastAnchor } from "@hjmds/design-contracts/components/toast";

/** Internal seam: the host retains the store, accessible content, and all actions. */
export type NativeToastPresentationProps = Readonly<{
  snapshot: ToastSessionSnapshot;
  anchor: LiquidToastAnchor;
  width: number;
  availableHeight: number;
  windowOrigin?: Readonly<{ x: number; y: number }>;
  suspended: boolean;
  body: ReactNode;
  fallback: ReactNode;
  onPause(reason: ToastPauseReason): void;
  onResume(reason: ToastPauseReason): void;
  onDismiss(reason: ToastDismissReason): void;
  onExitComplete(): void;
}>;

/** Produced only by the optional subpath; importing feedback does not load its dependencies. */
export type ToastPresentationAdapter = Readonly<{
  kind: "liquid";
  anchor: LiquidToastAnchor;
  Surface: ComponentType<NativeToastPresentationProps>;
}>;
