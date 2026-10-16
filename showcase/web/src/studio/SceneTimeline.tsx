import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Slider } from "@hjmds/react/slider";
import { SegmentedControl } from "@hjmds/react/selection";
import { useHjmTheme } from "@hjmds/react/provider";
import type { MockupScene } from "../../../shared/mockup-scene.js";
import { sampleSceneTimeline, type SceneTimeline as Timeline } from "../../../shared/scene-timeline.js";
import { drawMockup, downloadStudioBlob, mockupPng } from "./draw-mockup.js";
import { exportSceneVideo, supportedSceneVideoType } from "./export-scene-video.js";
// 2026-10-16 assembly rule (SELECTION.md 조립 규칙): each studio setting picks exactly one value, so it is a
// SegmentedControl with a visible caption instead of a row of `selected` Buttons that read as loose text.
// An imported scene may hold any in-range angle/padding (parseMockupScene), so the current value is shown as its own
// item when it is not a preset; the control always reflects the real scene instead of rejecting it.
export function SettingChoice<Value extends string | number>({ label, options, value, format, onChange }: { label: string; options: readonly Value[]; value: Value; format(value: Value): string; onChange(value: Value): void }) {
  const values = options.includes(value) ? options : [...options, value];
  return <Stack gap="xs"><Text emphasis="strong">{label}</Text>
    <SegmentedControl label={label} items={values.map(option => ({ value: String(option), label: format(option) }))} value={String(value)}
      onValueChange={next => { const option = values.find(candidate => String(candidate) === next); if (option !== undefined) onChange(option); }} />
  </Stack>;
}

export function SceneTimeline({ scene, image, frame, onFrame, onTimeline }: { scene: MockupScene; image: ImageBitmap | null; frame: number; onFrame: (frame: number) => void; onTimeline: (timeline: Timeline) => void }) {
  const { environment } = useHjmTheme();
  const [playing, setPlaying] = useState(false); const [busy, setBusy] = useState(false); const [posterBusy, setPosterBusy] = useState(false); const [progress, setProgress] = useState(0); const [status, setStatus] = useState("");
  const posterOperation = useRef<symbol | null>(null); const controller = useRef<AbortController | null>(null); const frameRef = useRef(frame); frameRef.current = frame;
  // Callback identity may change on every parent render; the playback clock must keep its start time.
  const onFrameRef = useRef(onFrame); onFrameRef.current = onFrame;
  const timeline = scene.timeline; const total = timeline.duration * timeline.fps;
  const format = supportedSceneVideoType();
  useLayoutEffect(() => {
    setPlaying(false); setBusy(false); setPosterBusy(false); setProgress(0); setStatus("");
    return () => {
      // Encoders can finish after cancellation; only the current source's operation may publish a result.
      controller.current?.abort(); controller.current = null; posterOperation.current = null;
    };
  }, [scene, image]);
  useEffect(() => {
    if (!playing || environment.reducedMotion || document.hidden) { setPlaying(false); return; }
    const start = performance.now(); const from = frameRef.current >= total ? 0 : frameRef.current; let raf = 0;
    const tick = (now: number) => {
      const next = Math.min(total, from + Math.floor((now - start) * timeline.fps / 1000)); onFrameRef.current(next);
      if (next < total) raf = requestAnimationFrame(tick); else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); setPlaying(false); } };
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", visibility); };
  }, [playing, environment.reducedMotion, total, timeline.fps]);
  function cancelVideo() {
    controller.current?.abort(); controller.current = null; setBusy(false); setProgress(0); setStatus("영상 출력을 취소했어요.");
  }
  async function video() {
    if (!image || controller.current) return;
    const operation = new AbortController(); controller.current = operation;
    setPlaying(false); setBusy(true); setProgress(0); setStatus("영상을 준비하고 있어요.");
    const current = () => controller.current === operation && !operation.signal.aborted;
    try {
      const result = await exportSceneVideo(scene, image, operation.signal, value => { if (current()) setProgress(Math.round(value * 100)); });
      if (current()) { downloadStudioBlob(result.blob, `hjm-scene.${result.extension}`); setStatus("영상 다운로드를 시작했어요."); }
    } catch (error) {
      if (current()) setStatus(error instanceof DOMException && error.name === "AbortError" ? "영상 출력을 취소했어요." : "이 브라우저에서 영상을 만들지 못했어요. PNG로 저장하거나 다른 브라우저에서 다시 시도해 주세요.");
    } finally { if (controller.current === operation) { controller.current = null; setBusy(false); } }
  }
  async function poster() {
    if (!image || posterOperation.current) return;
    const operation = Symbol(); posterOperation.current = operation; setPosterBusy(true);
    try {
      const canvas = document.createElement("canvas"); drawMockup(canvas, scene, image, sampleSceneTimeline(timeline, timeline.posterFrame, scene.seed));
      const blob = await mockupPng(canvas);
      if (posterOperation.current === operation) { downloadStudioBlob(blob, "hjm-poster.png"); setStatus("포스터 PNG 다운로드를 시작했어요."); }
    } catch { if (posterOperation.current === operation) setStatus("포스터를 저장하지 못했어요."); }
    finally { if (posterOperation.current === operation) { posterOperation.current = null; setPosterBusy(false); } }
  }
  return <Stack gap="md"><Heading level="level3" semanticLevel={2}>장면 타임라인</Heading>
    <Slider label="재생 위치" min={0} max={total} step={1} value={Math.min(frame, total)} onValueChange={value => { setPlaying(false); onFrame(value); }} getValueText={value => `${(value / timeline.fps).toFixed(2)}초`}/>
    <Text>{(Math.min(frame,total) / timeline.fps).toFixed(2)} / {timeline.duration.toFixed(2)}초 · {timeline.fps}fps</Text>
    <Stack axis="inline" wrap gap="sm"><Button tone="secondary" disabled={!image || environment.reducedMotion || busy} onClick={() => setPlaying(value => !value)}>{playing ? "일시 정지" : "재생"}</Button><Button tone="ghost" onClick={() => { setPlaying(false); onFrame(0); }}>처음으로</Button></Stack>
    {environment.reducedMotion ? <Text tone="muted">모션 줄이기가 켜져 있어요. 슬라이더로 정지된 장면을 확인할 수 있습니다.</Text> : null}
    <SettingChoice label="움직임" options={["float", "arrive"] as const} format={preset => preset === "float" ? "천천히 떠오르기" : "화면 등장"} value={timeline.preset} onChange={preset => onTimeline({ ...timeline, preset })}/>
    <SettingChoice label="길이" options={[3, 6, 9] as const} format={duration => `${duration}초`} value={timeline.duration} onChange={duration => { onFrame(0); onTimeline({ ...timeline, duration, posterFrame: Math.min(timeline.posterFrame, duration * timeline.fps) }); }}/>
    <SettingChoice label="초당 프레임" options={[24, 30] as const} format={fps => `${fps}fps`} value={timeline.fps} onChange={fps => { onFrame(0); onTimeline({ ...timeline, fps, posterFrame: Math.min(fps * timeline.duration, Math.round(timeline.posterFrame * fps / timeline.fps)) }); }}/>
    <Stack axis="inline" wrap gap="sm"><Button tone="secondary" onClick={() => onTimeline({ ...timeline, posterFrame: Math.min(frame,total) })}>현재 장면을 포스터로</Button><Button disabled={!image || posterBusy} loading={posterBusy} tone="secondary" onClick={() => void poster()}>포스터 PNG 저장</Button></Stack>
    <Text tone="muted">포스터 {(timeline.posterFrame / timeline.fps).toFixed(2)}초 · 영상 {format?.includes("mp4") ? "MP4" : format ? "WebM" : "출력 미지원"}</Text>
    <Stack axis="inline" wrap gap="sm"><Button tone="secondary" loading={busy} disabled={!image || !format || busy} onClick={() => void video()}>영상 내보내기</Button>{busy ? <Button tone="ghost" onClick={cancelVideo}>출력 취소</Button> : null}</Stack>
    {busy ? <Text role="progressbar" aria-label="영상 출력 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>{progress}%</Text> : null}
    <Text role="status">{status}</Text><Text tone="muted">영상 출력 중에는 이 화면을 열어 두세요. 다른 탭으로 이동하면 취소합니다. 이미지·장면·시간이 같으면 같은 장면을 그리며, 압축과 재생 시간은 브라우저 인코더에 따라 조금 달라질 수 있어요.</Text>
  </Stack>;
}
