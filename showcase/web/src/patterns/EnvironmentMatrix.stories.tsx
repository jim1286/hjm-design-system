import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container, Grid, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Badge, Card } from "@hjmds/react/display";
import { showcaseEnvironmentMatrix, showcaseScenarios } from "@hjmds/design-contracts/showcase";

// Environment ids match scenario ids, so the scenario label doubles as the preset's visible Korean name.
const scenarioLabels = new Map<string, string>(showcaseScenarios.map(({ id, label }) => [id, label]));
const motionLabels = { full: "전체", reduced: "줄임" } as const;
const columns = { compact: 1, medium: 2, expanded: 3 } as const;

function EnvironmentMatrix() {
  return (
    <Container size="content">
      <Stack gap="xl">
        <Stack gap="sm">
          <Heading level="level3" semanticLevel={1}>환경 조합 검증</Heading>
          <Text>위 도구 막대를 바꾸면서 같은 스토리가 환경 변화에도 의미를 보존하는지 확인합니다.</Text>
        </Stack>
        <Stack gap="md">
          <Heading level="level4" semanticLevel={2}>환경 조합</Heading>
          <Grid columns={columns} gap={{ compact: "md" }}>
            {showcaseEnvironmentMatrix.map((environment) => (
              <Card key={environment.id} headingLevel={3} title={environment.label} description={`동작: ${motionLabels[environment.motion]}`}
                leading={<Badge>{scenarioLabels.get(environment.id) ?? environment.id}</Badge>} />
            ))}
          </Grid>
        </Stack>
        <Stack gap="md">
          <Heading level="level4" semanticLevel={2}>스토리 확인 항목</Heading>
          <Grid columns={columns} gap={{ compact: "md" }}>
            {showcaseScenarios.map((scenario) => (
              <Card key={scenario.id} headingLevel={3} title={scenario.label} description={scenario.description} />
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Container>
  );
}

const meta = { includeStories: ["Default","Dark","LargeText"],
  id: "patterns-environment-matrix", title: "배포/구성/비교와 검증/환경 조합 검증",
  component: EnvironmentMatrix,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof EnvironmentMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
