import { useEffect, useRef, useState } from "react";
import { AppState, type View } from "react-native";
import { videoDialogHost } from "./video-dialog-host";
import { Button } from "@hjmds/react-native/actions";
import { Dialog } from "@hjmds/react-native/overlays";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";

const brokenClip = { uri: "data:video/mp4;base64,bm90LWEtbXA0" };

function Player({ host, broken, retry }: { host: typeof import("expo-video"); broken: boolean; retry: () => void }) {
  const { VideoView, useVideoPlayer } = host;
  // Hook ownership releases the player on unmount. Do not prebuffer a second
  // player outside the modal or enable background playback for this preview.
  const player = useVideoPlayer(broken ? brokenClip : videoDialogHost.clip);
  const { isPlaying } = videoDialogHost.useEvent(player, "playingChange", { isPlaying: player.playing });
  const { status } = videoDialogHost.useEvent(player, "statusChange", { status: player.status });
  const [playRejected, setPlayRejected] = useState(false);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", next => { if (next !== "active") player.pause(); });
    return () => subscription.remove();
  }, [player]);
  const toggle = () => {
    try { if (player.playing) player.pause(); else player.play(); setPlayRejected(false); }
    catch { setPlayRejected(true); }
  };
  return <Stack gap="md">
    <VideoView player={player} style={{ width: "100%", aspectRatio: 16 / 9 }} contentFit="contain" nativeControls fullscreenOptions={{ enable: false }} allowsPictureInPicture={false} />
    <Text variant="caption">영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.</Text>
    {status === "error" ? <><Text accessibilityRole="alert">영상을 불러오지 못했어요. 다시 시도해 주세요.</Text><Button onPress={retry}>다시 시도</Button></> :
      <><Button onPress={toggle}>{isPlaying ? "일시 정지" : "재생"}</Button><Text accessibilityLiveRegion="polite">{isPlaying ? "재생 중" : "재생 대기"}</Text>
      {playRejected ? <Text accessibilityRole="alert">재생을 시작하지 못했어요. 재생 버튼을 다시 눌러 주세요.</Text> : null}</>}
  </Stack>;
}

export function VideoDialogPreview() {
  const videoHost = videoDialogHost.player;
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState("");
  const trigger = useRef<View>(null);
  return <Stack gap="lg">
    <Text>짧은 영상을 확인하고 작성 중인 메모로 돌아오세요.</Text>
    <TextField label="영상 메모" value={draft} onValueChange={setDraft} />
    <Button ref={trigger} onPress={() => setOpen(true)}>영상 미리보기</Button>
    <Button tone="ghost" selected={broken} onPress={() => setBroken(v => !v)}>{broken ? "정상 영상으로 보기" : "불러오기 실패 체험"}</Button>
    <Dialog open={open} onOpenChange={setOpen} title="색상 패턴 미리보기" description={videoHost ? "재생 버튼을 누르면 영상이 시작돼요." : "영상 대신 아래 텍스트 설명을 확인할 수 있어요."} closeLabel="영상 닫기" size="large" returnFocusRef={trigger}>
      {open ? videoHost ? <Player key={attempt} host={videoHost} broken={broken} retry={() => { setBroken(false); setAttempt(v => v + 1); }} /> :
        <Stack gap="md"><Text>이 개발 앱에는 영상 재생 모듈이 없습니다. Expo Video를 포함한 앱에서 재생을 확인해 주세요.</Text><Text variant="caption">영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.</Text></Stack> : null}
    </Dialog>
  </Stack>;
}
