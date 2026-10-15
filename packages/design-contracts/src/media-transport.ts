export type MediaPlaybackState = Readonly<{ playing: boolean; position: number; duration: number | null; buffering?: boolean }>;
export function resolveMediaPlayback(state: MediaPlaybackState) {
  if (!Number.isFinite(state.position) || state.position < 0 || (state.duration !== null && (!Number.isFinite(state.duration) || state.duration < 0))) throw new RangeError("Media position and known duration must be finite and nonnegative");
  const seekable = state.duration !== null && state.duration > 0;
  return { ...state, seekable, position: seekable ? Math.min(state.position, state.duration!) : state.position };
}
/** Equal vertex counts allow play→pause interpolation without replacing a glyph or label. */
export function mediaTransportPaths(progress: number): readonly [string, string] {
  if (!Number.isFinite(progress)) throw new RangeError("Media glyph progress must be finite");
  const t = Math.max(0, Math.min(1, progress));
  const play = [[6,4,12,8,12,16,6,20],[12,8,20,12,20,12,12,16]];
  const pause = [[6,4,10,4,10,20,6,20],[14,4,18,4,18,20,14,20]];
  const path = (index: number) => { const p = play[index]!.map((value, vertex) => value + (pause[index]![vertex]! - value) * t); return `M${p[0]} ${p[1]}L${p[2]} ${p[3]}L${p[4]} ${p[5]}L${p[6]} ${p[7]}Z`; };
  return [path(0), path(1)];
}
