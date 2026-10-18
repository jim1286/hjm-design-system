import { Icon, Stack, Text } from "@hjmds/react-native";
import { renderSemanticGlyph } from "@hjmds/react-native/icon-svg";
import { semanticIconNames } from "@hjmds/design-contracts/components/icon";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/글자와 아이콘/아이콘", component: NativeComponentPreview, args: { componentId: "icon", variant: "default" }, parameters: { hjm: { componentIds: ["icon"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
// The same shared marks as Web, drawn through the optional react-native-svg adapter instead of a product path map.
export const SemanticSet: Story = {
  name: "전체 기호",
  render: () => <Stack axis="inline" gap="md" wrap>
    {semanticIconNames.map(name => <Stack key={name} gap="xxs" align="center" layoutStyle={{ width: 88 }}>
      <Icon descriptor={{ name, tone: "primary" }} renderGlyph={renderSemanticGlyph} />
      <Text variant="caption" tone="muted">{name}</Text>
    </Stack>)}
  </Stack>,
};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
