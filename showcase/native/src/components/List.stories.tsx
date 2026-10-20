import { ListSeparator } from "@hjmds/react-native/data-display";
import { Stack, Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/목록", component: NativeComponentPreview, args: { componentId: "list", variant: "default" }, parameters: { hjm: { componentIds: ["list"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const StandaloneSeparators: Story = {
  name: "독립 구분선",
  render: () => <Stack gap="md" layoutStyle={{ margin: 16 }}>
    <Text>행 자체에 여백이 있는 목록</Text><ListSeparator />
    <Text>ListRow의 전체 표면</Text><ListSeparator separator="full" />
    <Text>앞 아이콘 다음 글자 열</Text><ListSeparator separator="indented" leading />
  </Stack>,
};
