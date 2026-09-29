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
const meta = { title: "Feedback/Thinking Orb", component: ThinkingOrb, args: { label: "검색 중", state: "searching" } } satisfies Meta<typeof ThinkingOrb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const AllStates: Story = { render: () => <Gallery /> };
// Keep a direct-link dark fixture so device smoke does not depend on toolbar state.
export const AllStatesDark: Story = { render: () => <HjmNativeProvider theme="dark"><Gallery /></HjmNativeProvider> };
export const Paused: Story = { args: { paused: true } };
