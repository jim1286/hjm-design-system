import type { ReactNode } from "react";
import { Button } from "@hjmds/react-native/actions";
import { Chip } from "@hjmds/react-native/inputs";
import { Stack, Text } from "@hjmds/react-native/primitives";

// 2026-10-16 composition review: demo-only controls (failure toggles, motion switches) looked like product
// actions. They live under one quiet "미리보기 도구" caption, separated from the composition itself.
export function PreviewTools({ children }: { children: ReactNode }) {
  return <Stack gap="xs" layoutStyle={{ alignSelf: "stretch" }}><Text tone="muted" variant="caption">미리보기 도구</Text><Stack axis="inline" gap="xs" wrap>{children}</Stack></Stack>;
}
/** A one-shot action renders as a small ghost button; an on/off tool (`selected`) is a selection chip, not a pressed button.
 * Keep a toggle's label fixed: the chip's checked state already says on/off, and a label that flips renames the control mid-use. */
export function PreviewToolButton({ children, onPress, selected, disabled = false }: { children: string; onPress(): void; selected?: boolean; disabled?: boolean }) {
  if (selected !== undefined) return <Chip size="small" label={children} selectionMode="multiple" selected={selected} disabled={disabled} onPress={() => onPress()} />;
  return <Button size="small" tone="ghost" disabled={disabled} onPress={onPress}>{children}</Button>;
}
