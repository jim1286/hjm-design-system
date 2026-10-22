import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { useState } from "react";
import { ImageViewer } from "@hjmds/react/image-viewer";
import { Image } from "@hjmds/react/display";
import { revealImage } from "../../../shared/grid-reveal";

// Individual Image item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--image keeps the same preview for old links.
const meta = { id: "components-data-display-image", title: "배포/컴포넌트/데이터 표시/이미지", component: ContractStory, args: { name: "Image" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
function PhotoViewerExample() {
  const [open, setOpen] = useState(false);
  return <><button type="button" aria-label="사진 크게 보기" onClick={() => setOpen(true)}>
    <Image src={revealImage} width={320} height={200} decorative />
  </button><ImageViewer open={open} onClose={() => setOpen(false)} items={[{ id: "mountains", uri: revealImage, label: "햇살과 겹친 산 능선" }]}
    closeLabel="사진 닫기" previousLabel="이전 사진" nextLabel="다음 사진" loadingLabel="사진 불러오는 중" errorLabel="사진을 불러오지 못했어요" retryLabel="다시 시도" /></>;
}
export const FullScreenPhoto: Story = { name: "전체 화면 사진", render: () => <PhotoViewerExample /> };
