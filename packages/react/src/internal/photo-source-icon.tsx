"use client";

import type { PhotoSource } from "@hjmds/design-contracts/screen-patterns";

import { Camera, Images } from "lucide";

import { useHjmTheme } from "../provider.js";
import { renderLucideNodes } from "../semantic-lucide.js";

export function PhotoSourceIcon({ source }: { source: PhotoSource }) {
  const { environment } = useHjmTheme();
  // Shared neutral colors use a stronger plate/line contrast after device feedback (2026-10-20).
  const colors = environment.theme === "dark"
    ? { background: "#334155", color: "#F1F5F9" }
    : { background: "#E2E8F0", color: "#334155" };
  return <span className="hjm-photo-source__icon" style={colors} aria-hidden="true"><PhotoSourceGlyph source={source} /></span>;
}

/** The source mark without its plate in the current text color, for a quiet inline action (PhotoAttachmentField, 2026-11-03). */
export function PhotoSourceGlyph({ source, size }: Readonly<{ source: PhotoSource; size?: number }>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    focusable="false" aria-hidden="true" {...(size ? { width: size, height: size } : {})}>
      {renderLucideNodes(source === "camera" ? Camera : Images)}
    </svg>;
}
