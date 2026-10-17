import type { MouseEvent, ReactNode } from "react";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Chip } from "@hjmds/react/selection";

// 2026-10-16 composition review: demo-only controls (failure toggles, motion switches) looked like product
// actions. They live under one quiet "미리보기 도구" caption, separated from the composition itself.
export function PreviewTools({ children }: { children: ReactNode }) {
  return <Stack gap="xs" role="group" aria-label="미리보기 도구"><Text tone="muted" variant="caption">미리보기 도구</Text><Stack axis="inline" gap="sm" wrap>{children}</Stack></Stack>;
}
/** The story canvas is the product route: tools and notices take their content height and the screen fills the rest,
 * as the Native preview host gives ScreenLayout its remaining height. Screen stories render edge-to-edge, so the route is
 * exactly 100dvh. A fixed 90dvh host left an empty band under the footer or cut the scroll area mid-card on tall canvases
 * (2026-10-17 screen review). */
export function PreviewRoute({ before, children }: { before?: ReactNode; children: ReactNode }) {
  return <Stack gap="sm" style={{ height: "100dvh" }}>{before}<div style={{ flex: 1, minHeight: 0, width: "100%" }}>{children}</div></Stack>;
}
/** A one-shot action renders as a small ghost button; an on/off tool (`selected`) is a selection chip, not a pressed button.
 * Keep a toggle's label fixed: the chip's checked state already says on/off, and a label that flips renames the control mid-use. */
export function PreviewToolButton({ children, onClick, selected, disabled = false }: { children: string; onClick(event?: MouseEvent<HTMLButtonElement>): void; selected?: boolean; disabled?: boolean }) {
  if (selected !== undefined) return <Chip size="small" label={children} selectionMode="multiple" selected={selected} disabled={disabled} onSelectedChange={() => onClick()} />;
  return <Button size="small" tone="ghost" disabled={disabled} onClick={event => onClick(event)}>{children}</Button>;
}
