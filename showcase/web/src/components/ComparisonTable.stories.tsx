import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComparisonPreview } from "./table-family-previews";

// DataTable family companion (2026-10-14). Shared KBO sample data lives in showcase/shared/table-examples.ts.
const meta = { id: "components-data-display-comparison-table", title: "배포/컴포넌트/데이터 표시/비교 표", component: ComparisonPreview, parameters: { controls: { disable: true } } } satisfies Meta<typeof ComparisonPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
