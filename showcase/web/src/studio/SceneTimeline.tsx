import { useEffect, useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Slider } from "@hjmds/react/slider";
import { useHjmTheme } from "@hjmds/react/provider";
import type { MockupScene } from "../../../shared/mockup-scene";
import { sampleSceneTimeline, type SceneTimeline as Timeline } from "../../../shared/scene-timeline";
import { drawMockup, downloadStudioBlob, mockupPng } from "./draw-mockup";
import { exportSceneVideo, supportedSceneVideoType } from "./export-scene-video";
export function SceneTimeline({ scene, image, frame, onFrame, onTimeline }: { scene: MockupScene; image: ImageBitmap | null; frame: number; onFrame: (frame: number) => void; onTimeline: (timeline: Timeline) => void }) {
  const { environment } = useHjmTheme();
  const [playing, setPlaying] = useState(false); const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0); const [status, setStatus] = useState("");
  const mounted = useRef(true); const controller = useRef<AbortController | null>(null); const frameRef = useRef(frame); frameRef.current = frame;
  const timeline = scene.timeline; const total = timeline.duration * timeline.fps;
  const format = supportedSceneVideoType();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { setPlaying(false); }, [scene, image]);
  useEffect(() => {
    if (!playing || environment.reducedMotion || document.hidden) { setPlaying(false); return; }
    const start = performance.now(); const from = frameRef.current >= total ? 0 : frameRef.current; let raf = 0;
    const tick = (now: number) => {
      const next = Math.min(total, from + Math.floor((now - start) * timeline.fps / 1000)); onFrame(next);
      if (next < total) raf = requestAnimationFrame(tick); else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); setPlaying(false); } };
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", visibility); };
  }, [playing, environment.reducedMotion, total, timeline.fps, onFrame]);
  async function video() {
    if (!image || busy) return; setPlaying(false); setBusy(true); setProgress(0); setStatus("영상을 준비하고 있어요.");
    const operation = new AbortController(); controller.current = operation;
    try { const result = await exportSceneVideo(scene, image, operation.signal, value => { if (mounted.current) setProgress(Math.round(value * 100)); }); if (mounted.current) { downloadStudioBlob(result.blob, `hjm-scene.${result.extension}`); setStatus("영상을 내보냈어요."); } }
    catch (error) { if (mounted.current) setStatus(error instanceof DOMException && error.name === "AbortError" ? "영상 출력을 취소했어요." : "이 브라우저에서 영상을 만들지 못했어요. PNG로 저장하거나 다른 브라우저에서 다시 시도해 주세요."); }
    finally { if (controller.current === operation) controller.current = null; if (mounted.current) setBusy(false); }
  }
  async function poster() {
    if (!image) return;
    try { const canvas = document.createElement("canvas"); drawMockup(canvas, scene, image, sampleSceneTimeline(timeline, timeline.posterFrame, scene.seed)); const blob = await mockupPng(canvas); if (mounted.current) { downloadStudioBlob(blob, "hjm-poster.png"); setStatus("포스터를 저장했어요."); } }
    catch { if (mounted.current) setStatus("포스터를 저장하지 못했어요."); }
  }
  return <Stack gap="md"><Text variant="heading">장면 타임라인</Text>
    <Slider label="재생 위치" min={0} max={total} step={1} value={Math.min(frame, total)} onValueChange={value => { setPlaying(false); onFrame(value); }} getValueText={value => `${(value / timeline.fps).toFixed(2)}초`}/>
    <Text>{(Math.min(frame,total) / timeline.fps).toFixed(2)} / {timeline.duration.toFixed(2)}초 · {timeline.fps}fps</Text>
    <Stack axis="inline" wrap gap="sm"><Button tone="secondary" disabled={!image || environment.reducedMotion || busy} onClick={() => setPlaying(value => !value)}>{playing ? "일시 정지" : "재생"}</Button><Button tone="ghost" onClick={() => { setPlaying(false); onFrame(0); }}>처음으로</Button></Stack>
    {environment.reducedMotion ? <Text tone="muted">모션 줄이기가 켜져 있어요. 슬라이더로 정지된 장면을 확인할 수 있습니다.</Text> : null}
    <Text emphasis="strong">움직임</Text><Stack axis="inline" wrap gap="sm">{([ ["float", "천천히 떠오르기"], ["arrive", "화면 등장"] ] as const).map(([preset,label]) => <Button key={preset} tone="secondary" selected={timeline.preset === preset} onClick={() => onTimeline({ ...timeline, preset })}>{label}</Button>)}</Stack>
    <Text emphasis="strong">길이</Text><Stack axis="inline" wrap gap="sm">{([3,6,9] as const).map(duration => <Button key={duration} tone="ghost" selected={timeline.duration === duration} onClick={() => { onFrame(0); onTimeline({ ...timeline, duration, posterFrame: Math.min(timeline.posterFrame, duration * timeline.fps) }); }}>{duration}초</Button>)}</Stack>
    <Stack axis="inline" wrap gap="sm">{([24,30] as const).map(fps => <Button key={fps} tone="ghost" selected={timeline.fps === fps} onClick={() => { onFrame(0); onTimeline({ ...timeline, fps, posterFrame: Math.min(fps * timeline.duration, Math.round(timeline.posterFrame * fps / timeline.fps)) }); }}>{fps}fps</Button>)}</Stack>
    <Stack axis="inline" wrap gap="sm"><Button tone="secondary" onClick={() => onTimeline({ ...timeline, posterFrame: Math.min(frame,total) })}>현재 장면을 포스터로</Button><Button disabled={!image} tone="secondary" onClick={() => void poster()}>포스터 PNG 저장</Button></Stack>
    <Text tone="muted">포스터 {(timeline.posterFrame / timeline.fps).toFixed(2)}초 · 영상 {format?.includes("mp4") ? "MP4" : format ? "WebM" : "출력 미지원"}</Text>
    <Stack axis="inline" wrap gap="sm"><Button tone="secondary" loading={busy} disabled={!image || !format || busy} onClick={() => void video()}>영상 내보내기</Button>{busy ? <Button tone="ghost" onClick={() => controller.current?.abort()}>출력 취소</Button> : null}</Stack>
    <Text role="status">{status}</Text><Text tone="muted">영상 출력 중에는 이 화면을 열어 두세요. 다른 탭으로 이동하면 취소합니다. 이미지·장면·시간이 같으면 같은 장면을 그리며, 압축과 재생 시간은 브라우저 인코더에 따라 조금 달라질 수 있어요.</Text>
  </Stack>;
}
