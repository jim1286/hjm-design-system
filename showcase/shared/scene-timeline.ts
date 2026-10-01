export type SceneTimeline = Readonly<{ duration: 3 | 6 | 9; fps: 24 | 30; preset: "float" | "arrive"; posterFrame: number }>;
export const initialSceneTimeline: SceneTimeline = { duration: 3, fps: 30, preset: "float", posterFrame: 0 };
export function validateSceneTimeline(value: SceneTimeline) {
  if (!value || ![3,6,9].includes(value.duration) || ![24,30].includes(value.fps) || !["float","arrive"].includes(value.preset)
    || !Number.isInteger(value.posterFrame) || value.posterFrame < 0 || value.posterFrame > value.duration * value.fps) throw new RangeError("Invalid scene timeline");
  return value;
}
export function sampleSceneTimeline(timeline: SceneTimeline, frame: number, seed: number) {
  validateSceneTimeline(timeline);
  if (!Number.isFinite(frame) || !Number.isInteger(seed)) throw new RangeError("Invalid sample");
  const progress = Math.max(0, Math.min(timeline.duration * timeline.fps, Math.round(frame))) / (timeline.duration * timeline.fps);
  const phase = (seed % 360) * Math.PI / 180;
  if (timeline.preset === "arrive") { const eased = 1 - (1-progress) ** 3; return { angle: (1-eased) * -2, lift: (1-eased) * 8, scale: 0.88 + eased * 0.06 }; }
  const wave = Math.sin(progress * Math.PI * 2 + phase);
  // Leave scale headroom so subtle rotation/lift stays inside the static frame's bounds.
  return { angle: wave * 1.5, lift: wave * 6, scale: 0.94 };
}
