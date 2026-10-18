import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@hjmds/react/pagination";
import { openEndedPaginationExample } from "../../../shared/navigation-layout-examples";
import { ContractStory } from "./preview-registry";

// Individual Pagination item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-navigation--pagination keeps the same preview for old links.
const meta = { id: "components-navigation-pagination", title: "배포/컴포넌트/탐색/페이지 이동", component: ContractStory, args: { name: "Pagination" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const OpenEnded: Story = { name: "전체 수를 모르는 결과", render: () => <OpenEndedPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

// descriptor { currentPage, hasNext } + composeCurrentPageLabel: previous / current page label / next, for sources that
// only report whether another page exists. The fixture ends at `lastPage` so the next step becomes unavailable.
function OpenEndedPreview() {
  const [page, setPage] = useState(1);
  return <Pagination label={openEndedPaginationExample.label} labels={openEndedPaginationExample.labels}
    descriptor={{ currentPage: page, hasNext: page < openEndedPaginationExample.lastPage }}
    composeCurrentPageLabel={openEndedPaginationExample.currentPageLabel} onPageChange={(next) => setPage(next)} />;
}
