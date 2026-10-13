import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Dialog } from "@hjmds/react/overlays";
import { Stack, Text } from "@hjmds/react/layout";
import { TextField } from "@hjmds/react/forms";

const clip = new URL("../../../shared/assets/reference-video/preview.mp4", import.meta.url).href;
const brokenClip = "data:video/mp4;base64,bm90LWEtbXA0";

function Player({ broken, retry, restoreFocus }: { broken: boolean; retry: () => void; restoreFocus: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const restoreErrorFocus = useRef(false);
  const playRequest = useRef<symbol | null>(null);
  const [starting, setStarting] = useState(false);
  useEffect(() => { if (restoreFocus) playButton.current?.focus(); }, [restoreFocus]);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playRejected, setPlayRejected] = useState(false);
  useLayoutEffect(() => {
    if (failed && restoreErrorFocus.current) retryButton.current?.focus();
    restoreErrorFocus.current = false;
  }, [failed]);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const pauseWhenHidden = () => { if (document.hidden) { playRequest.current = null; setStarting(false); node.pause(); } };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      playRequest.current = null;
      // The Dialog exit animation can outlive open=false. Release the media host
      // immediately instead of letting a hidden player continue downloading/playing.
      node.pause();
      node.removeAttribute("src");
      node.load();
    };
  }, []);
  async function toggle() {
    const node = ref.current;
    if (!node || playRequest.current) return;
    if (!node.paused) { node.pause(); return; }
    // play() can settle after another interaction or unmount; retain one current request.
    const request = Symbol(); playRequest.current = request; setStarting(true);
    try { await node.play(); if (playRequest.current === request) setPlayRejected(false); }
    catch { if (playRequest.current === request) setPlayRejected(true); }
    finally { if (playRequest.current === request) { playRequest.current = null; setStarting(false); } }
  }
  return <Stack gap="md">
    <video ref={ref} src={broken ? brokenClip : clip} controls playsInline preload="metadata"
      aria-label="6초 색상 패턴 영상" style={{ width: "100%", aspectRatio: "16 / 9", display: "block" }}
      onPlay={() => setPlaying(true)} onPause={() => { playRequest.current = null; setStarting(false); setPlaying(false); }} onEnded={() => setPlaying(false)}
      onError={() => {
        // Recover only focus owned by the controls being replaced, never the modal close action.
        restoreErrorFocus.current = document.activeElement === playButton.current || document.activeElement === ref.current;
        playRequest.current = null; setStarting(false); setFailed(true); setPlaying(false);
      }} />
    <Text variant="caption">영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.</Text>
    {failed ? <><Text role="alert">영상을 불러오지 못했어요. 다시 시도해 주세요.</Text><Button ref={retryButton} onClick={retry}>다시 시도</Button></> :
      <><Button ref={playButton} loading={starting} onClick={() => void toggle()}>{starting ? "재생 준비 중" : playing ? "일시 정지" : "재생"}</Button>
      <Text role="status">{playing ? "재생 중" : "재생 대기"}</Text>
      {playRejected ? <Text role="alert">재생을 시작하지 못했어요. 재생 버튼을 다시 눌러 주세요.</Text> : null}</>}
  </Stack>;
}

export function VideoDialogPreview() {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  return <Stack gap="lg">
    <Text>짧은 영상을 확인하고 작성 중인 메모로 돌아오세요.</Text>
    <TextField label="영상 메모" value={draft} onValueChange={setDraft} />
    <Button ref={trigger} onClick={() => setOpen(true)}>영상 미리보기</Button>
    <Button tone="ghost" selected={broken} onClick={() => setBroken(v => !v)}>{broken ? "정상 영상으로 보기" : "불러오기 실패 체험"}</Button>
    <Dialog open={open} onOpenChange={setOpen} title="색상 패턴 미리보기" description="재생 버튼을 누르면 영상이 시작돼요." closeLabel="영상 닫기" size="large" returnFocusRef={trigger}>
      {open ? <Player key={attempt} restoreFocus={attempt > 0} broken={broken} retry={() => { setBroken(false); setAttempt(v => v + 1); }} /> : null}
    </Dialog>
  </Stack>;
}
