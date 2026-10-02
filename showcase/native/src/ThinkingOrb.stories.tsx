import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Text } from "@hjmds/react-native/primitives";
import { spacing } from "@hjmds/design-contracts/tokens";
import { ThinkingOrb } from "@hjmds/react-native/thinking-orb";
import { thinkingOrbStates } from "@hjmds/design-contracts/components/thinking-orb";
function Gallery() {
  const { colors } = useHjmNativeTheme();
  return <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: "row", flexWrap: "wrap", gap: spacing.lg }}>
    {thinkingOrbStates.map(state => <View key={state}><ThinkingOrb state={state} label={state} /><ThinkingOrb state={state} size={20} label={state} /><Text>{state}</Text></View>)}
  </View>;
}
const meta = { title: "배포/컴포넌트/상태와 알림/생각 중 표시", parameters: { hjm: { componentIds: ["thinking-orb"] } }, component: ThinkingOrb, render: args => <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ThinkingOrb {...args}/></View>, args: { label: "검색 중", state: "searching" } } satisfies Meta<typeof ThinkingOrb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { name: "직접 조작",};
export const AllStates: Story = { name: "전체 상태", render: () => <Gallery /> };
// Keep a direct-link dark fixture so device smoke does not depend on toolbar state.
export const AllStatesDark: Story = { name: "전체 상태 · 어두운 테마", render: () => <HjmNativeProvider theme="dark"><Gallery /></HjmNativeProvider> };
export const Paused: Story = { name: "일시 정지", args: { paused: true } };

export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

export const Fluid: Story = { name: "유연한 배치", args: { appearance: "fluid" } };
export const Matrix: Story = { name: "환경별 비교", args: { appearance: "matrix" } };
