import type { Meta, StoryObj } from "@storybook/react-native";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { Container, Text } from "@hjmds/react-native/primitives";
import { collapsibleExample } from "../../shared/component-examples";

// Collapsible is Native stable; the pointer menu and desktop menu bar stories stay Web-only (Native unsupported).
function CollapsiblePreview() {
  return <Collapsible trigger={collapsibleExample.trigger} defaultOpen><Text>{collapsibleExample.body}</Text></Collapsible>;
}

const meta = { title: "배포/구성/탐색과 이동/펼침과 메뉴", component: CollapsiblePreview, decorators: [(Story) => <Container size="reading"><Story /></Container>] } satisfies Meta<typeof CollapsiblePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
