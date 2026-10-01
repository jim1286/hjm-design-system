import type { MockupScene } from "../../../shared/mockup-scene";
import { sampleSceneTimeline } from "../../../shared/scene-timeline";
import { drawMockup } from "./draw-mockup";
export function supportedSceneVideoType(): string | null {
  if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement === "undefined" || !HTMLCanvasElement.prototype.captureStream || typeof CanvasCaptureMediaStreamTrack === "undefined" || !CanvasCaptureMediaStreamTrack.prototype.requestFrame) return null;
  return ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find(type => MediaRecorder.isTypeSupported(type)) ?? null;
}
function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    function abort() { clearTimeout(timer); reject(new DOMException("Export cancelled", "AbortError")); }
    signal.addEventListener("abort", abort, { once: true });
  });
}
/** Deterministic sampled frames; MediaRecorder timestamps/compression remain browser-owned. */
export async function exportSceneVideo(scene: MockupScene, source: ImageBitmap, signal: AbortSignal, onProgress: (progress: number) => void) {
  const mimeType = supportedSceneVideoType(); if (!mimeType) throw new Error("Video export unsupported");
  signal.throwIfAborted();
  // Snapshot pixels so editing/resetting the source during recording cannot close this bitmap.
  const image = await createImageBitmap(source); const canvas = document.createElement("canvas");
  let stream: MediaStream | undefined; let recorder: MediaRecorder | undefined;
  const visibility = () => { if (document.hidden) controller.abort(); };
  const controller = new AbortController(); const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true }); document.addEventListener("visibilitychange", visibility);
  try {
    if (signal.aborted || document.hidden) controller.abort(); controller.signal.throwIfAborted();
    drawMockup(canvas, scene, image, sampleSceneTimeline(scene.timeline, 0, scene.seed));
    stream = canvas.captureStream(0);
    const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
    if (!track || typeof track.requestFrame !== "function") throw new Error("Manual canvas frames unavailable");
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = []; let failure: Error | undefined;
    recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
    const stopped = new Promise<void>((resolve, reject) => {
      controller.signal.addEventListener("abort", () => reject(new DOMException("Export cancelled", "AbortError")), { once: true });
      recorder!.addEventListener("stop", () => resolve(), { once: true });
      recorder!.addEventListener("error", () => { failure = new Error("Video encoding failed"); reject(failure); }, { once: true });
    });
    void stopped.catch(() => {});
    recorder.start();
    const total = scene.timeline.duration * scene.timeline.fps;
    const started = performance.now();
    for (let frame = 0; frame <= total; frame++) {
      controller.signal.throwIfAborted(); if (failure) throw failure;
      drawMockup(canvas, scene, image, sampleSceneTimeline(scene.timeline, frame, scene.seed)); track.requestFrame(); onProgress(frame / total);
      // Anchor pacing to the start clock so drawing time does not accumulate into a longer clip.
      await delay(Math.max(0, started + (frame + 1) * 1000 / scene.timeline.fps - performance.now()), controller.signal);
    }
    recorder.stop(); await stopped;
    controller.signal.throwIfAborted();
    const blob = new Blob(chunks, { type: recorder.mimeType }); if (!blob.size) throw new Error("Empty video");
    return { blob, extension: recorder.mimeType.includes("mp4") ? "mp4" : "webm" };
  } finally {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stream?.getTracks().forEach(track => track.stop()); image.close();
    signal.removeEventListener("abort", abort); document.removeEventListener("visibilitychange", visibility);
  }
}
