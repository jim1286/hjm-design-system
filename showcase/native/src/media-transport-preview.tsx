import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { MediaTransport } from "@hjmds/react-native/media-transport";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { mediaTransportLabels as labels, formatMediaTime } from "../../shared/media-transport-example";
import { videoDialogHost } from "./video-dialog-host";
function Player({ host }: { host: typeof import("expo-video") }) {
  const { useVideoPlayer, VideoView } = host;
  // The six-second clip needs responsive seek feedback; this is the player event cadence, not a UI clock.
  const player = useVideoPlayer(videoDialogHost.clip, instance => { instance.timeUpdateEventInterval = .25; });
  const { isPlaying } = videoDialogHost.useEvent(player, "playingChange", { isPlaying: player.playing });
  const { status } = videoDialogHost.useEvent(player, "statusChange", { status: player.status });
  const { duration } = videoDialogHost.useEvent(player, "sourceLoad", { duration: player.duration, videoSource: null, availableVideoTracks: [], availableAudioTracks: [], availableSubtitleTracks: [] });
  const { currentTime } = videoDialogHost.useEvent(player, "timeUpdate", { currentTime: player.currentTime, currentLiveTimestamp: null, currentOffsetFromLive: null, bufferedPosition: 0 });
  const [position, setPosition] = useState(player.currentTime);
  useEffect(() => setPosition(Math.max(0, currentTime)), [currentTime]);
  useEffect(() => { const listener = AppState.addEventListener("change", state => { if (state !== "active") player.pause(); }); return () => listener.remove(); }, [player]);
  return <Stack gap="md"><VideoView player={player} style={{ width: "100%", aspectRatio: 16 / 9 }} nativeControls={false} fullscreenOptions={{ enable: false }} allowsPictureInPicture={false} />
    <MediaTransport state={{ playing: isPlaying, position, duration: Number.isFinite(duration) ? duration : null, buffering: status === "loading" }} disabled={status === "error"} labels={labels} formatTime={formatMediaTime}
      onPlay={() => player.play()} onPause={() => player.pause()} onSeek={seconds => { player.currentTime = seconds; setPosition(Math.max(0, player.currentTime)); }} />
    <Text variant="caption">영상 설명: 여러 색의 패턴이 6초 동안 움직입니다. 소리는 없습니다.</Text>
    {status === "error" ? <Text accessibilityRole="alert">영상을 불러오지 못했어요.</Text> : null}</Stack>;
}
export function MediaTransportPreview() { const host = videoDialogHost.player; return host ? <Player host={host} /> : <Text>이 개발 앱에는 영상 모듈이 없습니다. Expo Video를 포함한 앱에서 재생을 확인하세요.</Text>; }
