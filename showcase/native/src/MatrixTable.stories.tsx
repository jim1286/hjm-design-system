import { ScrollView } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { MatrixTable } from "@hjmds/react-native/data-table";
import { Section } from "@hjmds/react-native/primitives";
import { headToHeadCell, kboTeamNames, kboTeams, tableFamilyCopy as copy, type KboTeam } from "../../shared/table-examples";

/** Head-to-head cross table: diagonal blank, win-rate heat, my team (LG) row highlighted. */
function Preview() {
  return <ScrollView><Section title={copy.matrix} description={copy.matrixDescription}><MatrixTable<KboTeam> accessibilityLabel={copy.matrix} ids={kboTeams} labelOf={id => kboTeamNames[id]} getCell={headToHeadCell} highlightId="lg" /></Section></ScrollView>;
}

const meta = { title: "배포/컴포넌트/데이터 표시/대전표", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
