import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { AttachedPhoto, PhotoAttachmentField, type PhotoAttachmentPhoto, type PhotoAttachmentUpload } from "@hjmds/react/image-viewer";
import { TextArea } from "@hjmds/react/forms";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";

// The example's own picker: a file input read in memory. Products also shrink to JPEG and upload (portfolio MU-02).
const labels = { add: "사진 한 장 붙이기", replace: "사진 바꾸기", remove: "사진 빼기", preview: "붙인 사진 크게 보기",
  source: { title: "사진 붙이기", library: "앨범에서 고르기", camera: "사진 찍기", cancel: "닫기" },
  upload: { pending: "기다리는 중", uploading: "올리는 중", success: "올렸어요", cancel: "올리기 취소", retry: "다시 올리기" } };
const viewerLabels = { closeLabel: "닫기", previousLabel: "이전 사진", nextLabel: "다음 사진", loadingLabel: "사진을 불러오는 중", errorLabel: "사진을 보여 주지 못했어요", retryLabel: "다시 시도" };
const sample: PhotoAttachmentPhoto = { uri: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200", width: 1200, height: 800 };

function Compose({ initial = null, upload, failPick = false }: { initial?: PhotoAttachmentPhoto | null; upload?: PhotoAttachmentUpload; failPick?: boolean }) {
  const [text, setText] = useState("오늘 바다 냄새가 났어"), [photo, setPhoto] = useState(initial), [error, setError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  const read = (file: File | undefined) => {
    if (!file) return;
    if (failPick || !file.type.startsWith("image/")) { setError("이 사진은 붙일 수 없어요. 다른 사진을 골라 주세요."); return; }
    const uri = URL.createObjectURL(file);
    void createImageBitmap(file).then(bitmap => { setPhoto({ uri, width: bitmap.width, height: bitmap.height }); setError(undefined); bitmap.close(); });
  };
  return <Container gutter="compact" size="reading"><Stack gap="md">
    <Heading level="level3">편지 쓰기</Heading>
    <TextArea label="편지" value={text} onChange={event => setText(event.currentTarget.value)} />
    <input ref={input} type="file" accept="image/*" hidden onChange={event => read(event.currentTarget.files?.[0])} />
    <PhotoAttachmentField photo={photo} labels={labels} viewerLabels={viewerLabels} hint="사진은 편지를 읽는 사람에게만 보여요."
      {...(upload ? { upload, onRetryUpload: () => {}, onCancelUpload: () => {} } : {})} {...(error ? { error } : {})}
      onSelectSource={() => input.current?.click()} onRemove={() => setPhoto(null)} />
  </Stack></Container>;
}

function Read() {
  return <Container gutter="compact" size="reading"><Stack gap="md">
    <Heading level="level3">받은 편지</Heading>
    <Text>오늘 바다 냄새가 났어</Text>
    <AttachedPhoto photo={sample} label="붙인 사진 크게 보기" viewerLabels={viewerLabels} />
  </Stack></Container>;
}

const meta = { id: "compositions-selection-photo-attachment", title: "실험/구성/선택과 필터/글과 사진 한 장", component: Compose } satisfies Meta<typeof Compose>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Attached: Story = { name: "사진 붙임", args: { initial: sample } };
export const Uploading: Story = { name: "올리는 중", args: { initial: sample, upload: { status: "uploading", progress: 0.6 } } };
export const UploadFailed: Story = { name: "올리기 실패", args: { initial: sample, upload: { status: "error", message: "연결이 끊겼어요. 다시 올려 주세요." } } };
export const Reading: Story = { name: "읽기", render: () => <Read /> };
export const Dark: Story = { name: "어두운 테마", args: { initial: sample }, globals: { theme: "dark" } };
