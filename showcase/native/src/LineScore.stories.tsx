import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { LineScore } from "@hjmds/react-native/data-table";
import { Section, Stack } from "@hjmds/react-native/primitives";
import { finalGame, liveGame, liveGamePeriod, lineScoreTotals, tableFamilyCopy as copy } from "../../shared/table-examples";

/** Final game (home X in the 9th) and a live extra-inning game with the current inning highlighted. */
function Preview() {
  return <ScrollView><Section title={copy.lineScoreTitle} description={copy.lineScoreDescription}><Stack gap="lg">
    <LineScore accessibilityLabel={copy.lineScore} teams={finalGame} totals={lineScoreTotals} />
    <LineScore accessibilityLabel={copy.liveScore} teams={liveGame} totals={lineScoreTotals} currentPeriod={liveGamePeriod} />
  </Stack></Section></ScrollView>;
}

const meta = { title: "배포/컴포넌트/데이터 표시/라인스코어", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
