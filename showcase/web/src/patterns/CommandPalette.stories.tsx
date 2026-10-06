import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPalettePreview, DataTablePreview } from "./CommandPalette.previews.js";

const meta = { includeStories: ["Default","RecordTable","Dark","LargeText"], id: "patterns-commandpalette", title: "배포/컴포넌트/오버레이/명령 검색", component: CommandPalettePreview } satisfies Meta<typeof CommandPalettePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const RecordTable: Story = { name: "기록 표", render: () => <DataTablePreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
