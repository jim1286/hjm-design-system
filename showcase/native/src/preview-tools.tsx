import type { ReactNode } from "react";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";

// 2026-10-16 composition review: demo-only controls (failure toggles, motion switches) looked like product
// actions. They live under one quiet "미리보기 도구" caption, separated from the composition itself.
export function PreviewTools({ children }: { children: ReactNode }) {
  return <Stack gap="xs" layoutStyle={{ alignSelf: "stretch" }}><Text tone="muted" variant="caption">미리보기 도구</Text><Stack axis="inline" gap="xs" wrap>{children}</Stack></Stack>;
}
export function PreviewToolButton({ children, onPress, selected, disabled = false }: { children: string; onPress(): void; selected?: boolean; disabled?: boolean }) {
  return <Button size="small" tone="ghost" disabled={disabled} {...(selected === undefined ? {} : { selected })} onPress={onPress}>{children}</Button>;
}
