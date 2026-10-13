import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ComparisonTable } from "@hjmds/react-native/data-table";
import { comparisonSides, pitcherComparison, tableFamilyCopy as copy } from "../../shared/table-examples";

/** Two-sided matchup rows; lower-is-better rows (ERA, WHIP) still give the longer bar to the better side. */
function Preview() {
  return <ScrollView><ComparisonTable accessibilityLabel={copy.comparison} sides={comparisonSides} rows={pitcherComparison} /></ScrollView>;
}

const meta = { title: "배포/컴포넌트/데이터 표시/비교 표", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
