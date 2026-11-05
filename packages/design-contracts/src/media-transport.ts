export type MediaPlaybackState = Readonly<{ playing: boolean; position: number; duration: number | null; buffering?: boolean }>;
export function resolveMediaPlayback(state: MediaPlaybackState) {
  if (!Number.isFinite(state.position) || state.position < 0 || (state.duration !== null && (!Number.isFinite(state.duration) || state.duration < 0))) throw new RangeError("Media position and known duration must be finite and nonnegative");
  const seekable = state.duration !== null && state.duration > 0;
  return { ...state, seekable, position: seekable ? Math.min(state.position, state.duration!) : state.position };
}
/**
 * Lucide icons (kebab-case) for the play/pause toggle. HJM no longer draws its own morphing play/pause paths: Lucide is
 * the only icon source (user instruction 2026-11-05), so renderers cross-fade these two icons over the same progress.
 */
export const mediaTransportLucideNames = { play: "play", pause: "pause" } as const;
/** Cross-fade weights for progress 0 (play) → 1 (pause); out-of-range progress clamps. */
export function mediaTransportGlyphOpacity(progress: number): Readonly<{ play: number; pause: number }> {
  if (!Number.isFinite(progress)) throw new RangeError("Media glyph progress must be finite");
  const t = Math.max(0, Math.min(1, progress));
  return Object.freeze({ play: 1 - t, pause: t });
}
