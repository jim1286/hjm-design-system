import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContractStory } from "./preview-registry";
import { StatTablePreview } from "../patterns/Chart.previews";
import { FixedHeaderPreview, HeaderBandsPreview, PercentilePreview, RowGroupsPreview } from "./table-family-previews";

// Individual DataTable item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-data-display--data-table keeps the same preview for old links.
const meta = { id: "components-data-display-data-table", title: "배포/컴포넌트/데이터 표시/데이터 표", component: ContractStory, args: { name: "DataTable" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
// 2026-10-14 stat-table additions on the same item: pinned start column, sortDescFirst, summary row.
export const PinnedSummary: Story = { name: "고정 열과 합계", render: () => <StatTablePreview /> };
// 2026-10-14 table family: header bands, row groups with sub-row indent, percentile heat, fixed header.
export const HeaderBands: Story = { name: "묶음 머리글", render: () => <HeaderBandsPreview /> };
export const RowGroups: Story = { name: "행 묶음과 들여쓰기", render: () => <RowGroupsPreview /> };
export const Percentile: Story = { name: "백분위 색", render: () => <PercentilePreview /> };
export const FixedHeader: Story = { name: "고정 머리글", render: () => <FixedHeaderPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
