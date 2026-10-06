import { useRef, useState } from "react";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Stack, Text } from "@hjmds/react-native";
import { ImageViewer, type ImageViewerInspection } from "@hjmds/react-native/image-viewer";

// Diagnostic only: a real RN image host with one synthetic failure. It exercises
// the public retry/host boundary without claiming Expo onDisplay or network QA.
export function ImageViewerHostProbe({ inspection = false }: { inspection?: boolean }) {
  const [mode, setMode] = useState<ImageViewerInspection["mode"]>("fit");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("아직 열지 않음");
  const failOnce = useRef(true);
  const insets = useSafeAreaInsets();
  const uri = Image.resolveAssetSource(require("../../../shared/photos/valley.jpg")).uri;
  return <Stack gap="md">
    <Button onPress={() => { failOnce.current = true; setOpen(true); }}>이미지 호스트 확인</Button>
    <Text>{status}</Text>
    <ImageViewer open={open} onClose={() => setOpen(false)} safeAreaInsets={insets}
      supportedOrientations={["portrait", "landscape"]}
      items={[{ id: "valley", uri, label: "산과 계곡 사진", width: 600, height: 600 }]}
      {...(inspection ? { inspection: {
        mode, onModeChange: setMode,
        labels: { mode: "결과 보기", fit: "맞춤", double: "2배", pixels: "출력 크기", left: "왼쪽", right: "오른쪽", up: "위", down: "아래", center: "중앙" },
        getPositionText: ({ x, y }) => `위치 ${Math.round(x)}, ${Math.round(y)}`,
      } satisfies ImageViewerInspection } : {})}
      closeLabel="닫기" previousLabel="이전" nextLabel="다음" loadingLabel="불러오는 중"
      errorLabel="진단용 첫 표시 실패" retryLabel="다시 시도"
      onImageStatusChange={event => setStatus(`이미지 상태: ${event.status}`)}
      renderImage={({ item, width, height, onReady, onError }) => (
        <Image source={{ uri: item.uri }} accessibilityLabel={item.label}
          style={{ width, height }} resizeMode="contain" onError={onError}
          onLoad={() => {
            if (failOnce.current) { failOnce.current = false; onError(); }
            else onReady();
          }} />
      )} />
  </Stack>;
}
