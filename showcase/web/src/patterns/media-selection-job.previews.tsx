import { useEffect, useRef, useState } from "react";
import { MediaSelectionScreen, type MediaSelectionItem } from "@hjmds/react/screen-flows";
import { Text } from "@hjmds/react/layout";
import { mediaPickerCopy as copy } from "../../../shared/media-picker-example.js";
import photo0 from "../../../shared/photos/river.jpg";
import photo1 from "../../../shared/photos/mountain.jpg";
import photo2 from "../../../shared/photos/valley.jpg";

// HJM 1.32 `disabled` on MediaSelectionScreen/MediaSelectionCell (2026-10-18, Utilverse photo-to-PDF): while the host
// builds its output from the selection, move/rotate/remove are locked so the order cannot diverge from the job.
// The job here is a timer; a product runs its real build and owns the progress copy.
const photos = [{ id: "river", name: "강", src: photo0 }, { id: "mountain", name: "산", src: photo1 }, { id: "valley", name: "계곡", src: photo2 }];
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
  const items: MediaSelectionItem[] = list.map(photo => ({
    descriptor: { id: photo.id, name: photo.name, state: { status: "success" } },
    preview: <img src={photo.src} alt="" style={{ width: "100%", aspectRatio: 1, objectFit: "cover", transform: `rotate(${photo.rotation}deg)` }} />,
  }));
  return <div style={{ height: "100dvh" }}><MediaSelectionScreen title="사진으로 PDF 만들기" items={items} disabled={running}
    done={{ label: running ? "PDF 만드는 중" : "PDF 만들기", pending: running, disabled: !list.length, onAction: build }}
    selectionSummary={<Text variant="caption" tone="muted">{running ? "만드는 동안 순서·회전·삭제가 잠겨요" : built ? `${list.length}쪽 PDF를 만들었어요` : `${list.length}쪽`}</Text>}
    labels={copy.labels} actionLabels={copy.actionLabels} removeLabel={item => copy.remove(item.descriptor.name)} moveUpLabel={item => copy.moveUp(item.descriptor.name)} moveDownLabel={item => copy.moveDown(item.descriptor.name)}
    rotate={{ label: "회전", itemLabel: item => `${item.descriptor.name} 회전`, onRotate: id => setList(current => current.map(photo => photo.id === id ? { ...photo, rotation: (photo.rotation + 90) % 360 } : photo)) }}
    onRemove={id => setList(current => current.filter(photo => photo.id !== id))} onMove={move} onRetry={() => {}} onCancel={() => {}} /></div>;
}
