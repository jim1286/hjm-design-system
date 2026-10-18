import { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { BottomNavigation, BottomNavigationInsetProvider } from "@hjmds/react-native/navigation";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { appIconDockExample, overlayInsetExample, prominentDestinationExample } from "../../../shared/navigation-layout-examples";
import { NativeComponentPreview } from "../component-examples";
import { semanticGlyph } from "../semantic-glyphs";
const meta = { title: "배포/컴포넌트/탐색/하단 탐색", component: NativeComponentPreview, args: { componentId: "bottom-navigation", variant: "default" }, parameters: { hjm: { componentIds: ["bottom-navigation"], edgeToEdge: true }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const ProminentDestination: Story = { name: "솟은 가운데 목적지", render: () => <ProminentDestinationPreview /> };
export const AppIconSlots: Story = { name: "앱 아이콘 자리", render: () => <AppIconSlotsPreview /> };
export const OverlayInset: Story = { name: "떠 있는 막대와 화면 여백", render: () => <OverlayInsetPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function ProminentDestinationPreview() {
  const [selected, setSelected] = useState<string>(prominentDestinationExample.initial);
  return <View style={{ flex: 1, justifyContent: "flex-end" }}>
    <BottomNavigation configuration={{ presentation: "floating" }}
      descriptor={{ accessibilityLabel: prominentDestinationExample.label, selectedKey: selected, items: prominentDestinationExample.items }}
      onActivate={({ key }) => setSelected(key)} renderIcon={semanticGlyph} />
  </View>;
}

// Artwork stands in for product app icons: the slot size comes from renderIcon's `size` (iconSize "xlarge").
function AppIconSlotsPreview() {
  const [selected, setSelected] = useState<string>(appIconDockExample.initial);
  const { colors, tokens } = useHjmNativeTheme();
  return <View style={{ flex: 1, justifyContent: "flex-end" }}>
    <BottomNavigation configuration={{ presentation: "floating", iconSize: "xlarge" }}
      descriptor={{ accessibilityLabel: appIconDockExample.label, selectedKey: selected, items: appIconDockExample.items }}
      onActivate={({ key }) => setSelected(key)}
      renderIcon={(props) => <View style={{ alignItems: "center", justifyContent: "center", width: props.size, height: props.size, borderRadius: tokens.radius.md, backgroundColor: colors.surfaceAccent }}>
        {semanticGlyph({ ...props, size: tokens.spacing.xl })}
      </View>} />
  </View>;
}

// placement="overlay" pins the bar over the screen; the provider hands its height to ScreenLayout, which pads its body.
function OverlayInsetPreview() {
  const [selected, setSelected] = useState<string>(prominentDestinationExample.initial);
  return <View style={{ flex: 1 }}>
    <BottomNavigationInsetProvider>
      <ScreenLayout title={overlayInsetExample.title}>
        <Stack gap="sm">
          {Array.from({ length: overlayInsetExample.count }, (_, index) => <Text key={index}>{overlayInsetExample.row(index + 1)}</Text>)}
          <Text tone="muted">{overlayInsetExample.last}</Text>
        </Stack>
      </ScreenLayout>
      <BottomNavigation placement="overlay" configuration={{ presentation: "floating" }}
        descriptor={{ accessibilityLabel: prominentDestinationExample.label, selectedKey: selected, items: prominentDestinationExample.items }}
        onActivate={({ key }) => setSelected(key)} renderIcon={semanticGlyph} />
    </BottomNavigationInsetProvider>
  </View>;
}
