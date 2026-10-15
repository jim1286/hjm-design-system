import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpandableSearchPreview } from "./Communication.previews";
import { Container } from "@hjmds/react/layout";
const meta = { id: "compositions-expandable-search", title: "배포/구성/선택과 필터/펼치는 상단 검색", component: ExpandableSearchPreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof ExpandableSearchPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
