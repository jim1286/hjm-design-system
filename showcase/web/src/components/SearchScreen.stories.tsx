import { useState } from "react";
import { SearchScreen } from "@hjmds/react/screen-flows";
import { Sheet } from "@hjmds/react/overlays";
import { Button } from "@hjmds/react/actions";
import { Text } from "@hjmds/react/layout";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";

// Individual SearchScreen item (2026-10-17 screen compositions registered, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-layout--search-screen keeps the same preview for old links.
const meta = { id: "components-layout-search-screen", title: "배포/컴포넌트/레이아웃/검색 화면", component: ContractStory, args: { name: "SearchScreen" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function EmbeddedPreview() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [requestQuery, setRequestQuery] = useState("");
  return <>
    <Button onClick={() => setOpen(true)}>검색 시트 열기</Button>
    <Sheet open={open} onOpenChange={setOpen} title="검색" closeLabel="닫기" size="full">
      <SearchScreen embedded title="검색" query={query} queryLabel="검색어" queryClearLabel="지우기"
        onQueryChange={setQuery} onSearch={setRequestQuery}>
        <Text>{requestQuery ? `검색 요청: ${requestQuery}` : "입력하면 잠시 뒤 요청 검색어가 바뀌어요"}</Text>
      </SearchScreen>
    </Sheet>
  </>;
}
export const Embedded: Story = { name: "시트 안 검색", render: () => <EmbeddedPreview /> };
