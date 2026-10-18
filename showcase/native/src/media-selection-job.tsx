import { useEffect, useRef, useState } from "react";
import { Image, View } from "react-native";
import { MediaSelectionScreen, type MediaSelectionItem } from "@hjmds/react-native/screen-flows";
import { Text } from "@hjmds/react-native/primitives";
import { mediaPickerCopy as copy } from "../../shared/media-picker-example";

// HJM 1.32 `disabled` on MediaSelectionScreen/MediaSelectionCell (2026-10-18, Utilverse photo-to-PDF): while the host
// builds its output from the selection, move/rotate/remove are locked so the order cannot diverge from the job.
// The job here is a timer; a product runs its real build and owns the progress copy. Same example as the Web preview.
const photos = [
  { id: "river", name: "강", src: require("../../shared/photos/river.jpg") },
  { id: "mountain", name: "산", src: require("../../shared/photos/mountain.jpg") },
  { id: "valley", name: "계곡", src: require("../../shared/photos/valley.jpg") },
];
type Photo = (typeof photos)[number] & { rotation: number };

export function MediaSelectionJobPreview({ running: initiallyRunning = false }: { running?: boolean }) {
  const [list, setList] = useState<Photo[]>(() => photos.map(photo => ({ ...photo, rotation: 0 })));
  const [running, setRunning] = useState(initiallyRunning);
  const [built, setBuilt] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const build = () => { setRunning(true); setBuilt(false); timer.current = setTimeout(() => { setRunning(false); setBuilt(true); }, 1500); };
  const move = (id: string, direction: -1 | 1) => setList(current => {
    const next = [...current], index = next.findIndex(photo => photo.id === id), target = index + direction;
    if (index >= 0 && target >= 0 && target < next.length) [next[index], next[target]] = [next[target]!, next[index]!];
    return next;
  });
  // RN Image seeds its size from the bundled asset, so the photo sits in a sized square and fills it (media-picker-preview).
  const items: MediaSelectionItem[] = list.map(photo => ({
    descriptor: { id: photo.id, name: photo.name, state: { status: "success" } },
    preview: <View style={{ width: "100%", aspectRatio: 1 }}><Image source={photo.src} resizeMode="cover" style={{ width: "100%", height: "100%", transform: [{ rotate: `${photo.rotation}deg` }] }} /></View>,
  }));
  return <MediaSelectionScreen title="사진으로 PDF 만들기" items={items} disabled={running}
    done={{ label: running ? "PDF 만드는 중" : "PDF 만들기", pending: running, disabled: !list.length, onAction: build }}
    selectionSummary={<Text variant="caption" tone="muted">{running ? "만드는 동안 순서·회전·삭제가 잠겨요" : built ? `${list.length}쪽 PDF를 만들었어요` : `${list.length}쪽`}</Text>}
    labels={copy.labels} actionLabels={copy.actionLabels} removeLabel={item => copy.remove(item.descriptor.name)} moveUpLabel={item => copy.moveUp(item.descriptor.name)} moveDownLabel={item => copy.moveDown(item.descriptor.name)}
    rotate={{ label: "회전", itemLabel: item => `${item.descriptor.name} 회전`, onRotate: id => setList(current => current.map(photo => photo.id === id ? { ...photo, rotation: (photo.rotation + 90) % 360 } : photo)) }}
    onRemove={id => setList(current => current.filter(photo => photo.id !== id))} onMove={move} onRetry={() => {}} onCancel={() => {}} />;
}
