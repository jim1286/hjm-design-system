"use client";

import type { PhotoSource } from "@hjmds/design-contracts/screen-patterns";

import { useHjmTheme } from "../provider.js";

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
      {source === "camera"
        ? <path d="M8 6 9.5 3h5L16 6h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4Zm8 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
        : <path d="M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1M9 7h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm-2 12 5-5 4 4 2-2 4 4M17 11h.01" />}
    </svg>;
}
