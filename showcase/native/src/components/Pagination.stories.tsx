import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Pagination } from "@hjmds/react-native/pagination";
import { openEndedPaginationExample } from "../../../shared/navigation-layout-examples";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/탐색/페이지 이동", component: NativeComponentPreview, args: { componentId: "pagination", variant: "default" }, parameters: { hjm: { componentIds: ["pagination"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
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
