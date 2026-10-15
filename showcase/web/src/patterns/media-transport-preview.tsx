import { useEffect, useRef, useState } from "react";
import { MediaTransport } from "@hjmds/react/media-transport";
import { Stack, Text } from "@hjmds/react/layout";
import { mediaTransportLabels as labels, formatMediaTime } from "../../../shared/media-transport-example";
const clip = new URL("../../../shared/assets/reference-video/preview.mp4", import.meta.url).href;
export function MediaTransportPreview() {
  const ref = useRef<HTMLVideoElement>(null), seekCancel = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false), [position, setPosition] = useState(0), [duration, setDuration] = useState<number | null>(null), [buffering, setBuffering] = useState(false), [failed, setFailed] = useState(false);
  useEffect(() => {
    const node = ref.current!;
    const hidden = () => { if (document.hidden) node.pause(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { document.removeEventListener("visibilitychange", hidden); seekCancel.current?.(); node.pause(); node.removeAttribute("src"); node.load(); };
  }, []);
  const seek = (seconds: number) => new Promise<void>((resolve, reject) => {
    const node = ref.current!;
    if (!node.seeking && Math.abs(node.currentTime - seconds) < .001) { resolve(); return; }
    const clear = () => { node.removeEventListener("seeked", done); node.removeEventListener("error", fail); seekCancel.current = null; };
    const done = () => { clear(); setPosition(node.currentTime); resolve(); };
    const fail = () => { clear(); reject(new Error("Media seek was interrupted")); };
    seekCancel.current = fail; node.addEventListener("seeked", done); node.addEventListener("error", fail);
    try { node.currentTime = seconds; } catch { fail(); }
  });
  return <Stack gap="md"><video ref={ref} src={clip} muted playsInline preload="metadata" aria-label="6초 색상 패턴 영상" style={{ width: "100%", aspectRatio: "16 / 9" }}
    onLoadedMetadata={() => setDuration(Number.isFinite(ref.current!.duration) ? ref.current!.duration : null)} onDurationChange={() => setDuration(Number.isFinite(ref.current!.duration) ? ref.current!.duration : null)}
    onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={() => setPosition(ref.current!.currentTime)} onWaiting={() => setBuffering(true)} onPlaying={() => setBuffering(false)} onCanPlay={() => setBuffering(false)} onError={() => { setFailed(true); setPlaying(false); }} />
    <MediaTransport state={{ playing, position, duration, buffering }} disabled={failed} labels={labels} formatTime={formatMediaTime} onPlay={() => ref.current!.play()} onPause={() => ref.current!.pause()} onSeek={seek} />
    <Text variant="caption">영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.</Text>
    {failed ? <Text role="alert">영상을 불러오지 못했어요.</Text> : null}</Stack>;
}
