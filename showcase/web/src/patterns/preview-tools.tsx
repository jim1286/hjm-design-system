import type { ReactNode } from "react";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Chip } from "@hjmds/react/selection";

// 2026-10-16 composition review: demo-only controls (failure toggles, motion switches) looked like product
// actions. They live under one quiet "미리보기 도구" caption, separated from the composition itself.
export function PreviewTools({ children }: { children: ReactNode }) {
  return <Stack gap="xs" role="group" aria-label="미리보기 도구"><Text tone="muted" variant="caption">미리보기 도구</Text><Stack axis="inline" gap="sm" wrap>{children}</Stack></Stack>;
}
/** A one-shot action renders as a small ghost button; an on/off tool (`selected`) is a selection chip, not a pressed button. */
export function PreviewToolButton({ children, onClick, selected, disabled = false }: { children: string; onClick(): void; selected?: boolean; disabled?: boolean }) {
  if (selected !== undefined) return <Chip size="small" label={children} selectionMode="multiple" selected={selected} disabled={disabled} onSelectedChange={() => onClick()} />;
  return <Button size="small" tone="ghost" disabled={disabled} onClick={onClick}>{children}</Button>;
}
