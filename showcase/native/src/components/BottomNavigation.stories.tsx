import { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native";
import { BottomNavigation, BottomNavigationInsetProvider } from "@hjmds/react-native/navigation";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { ScreenLayout } from "@hjmds/react-native/screens";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { appIconDockExample, dockShapeExamples, overlayInsetExample, prominentDestinationExample } from "../../../shared/navigation-layout-examples";
import { NativeComponentPreview } from "../component-examples";
import { semanticGlyph } from "../semantic-glyphs";
const meta = { title: "배포/컴포넌트/탐색/하단 탐색", component: NativeComponentPreview, args: { componentId: "bottom-navigation", variant: "default" }, parameters: { hjm: { componentIds: ["bottom-navigation"], edgeToEdge: true }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const ProminentDestination: Story = { name: "솟은 가운데 목적지", render: () => <ProminentDestinationPreview /> };
export const AppIconSlots: Story = { name: "앱 아이콘 자리", render: () => <AppIconSlotsPreview /> };
export const DockShapes: Story = { name: "테마별 막대 모양", render: () => <DockShapesPreview /> };
export const OverlayInset: Story = { name: "떠 있는 막대와 화면 여백", render: () => <OverlayInsetPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const NeutralTiles: Story = { name: "중립 배경 타일", render: () => <NeutralTilesPreview /> };
export const NeutralTilesDark: Story = { name: "중립 배경 타일 · 어두운 테마", globals: { theme: "dark" }, render: () => <NeutralTilesPreview /> };

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

// configuration.shape + iconEmphasis "lift": each frame comes from bottomNavigationRecipe.shapes, so a product theme
// switches the dock by configuration instead of building its own bar. Artwork stands in for full-color app icons.
function DockShapesPreview() {
  const [selected, setSelected] = useState<string>(appIconDockExample.initial);
  const { colors, tokens } = useHjmNativeTheme();
  return <View style={{ flex: 1, justifyContent: "flex-end", gap: tokens.spacing.md }}>
    {dockShapeExamples.map((example) => <Stack key={example.shape} gap="xs">
      <View style={{ paddingHorizontal: tokens.spacing.md }}><Text variant="caption" tone="muted">{example.caption}</Text></View>
      <BottomNavigation configuration={{ presentation: "floating", shape: example.shape, density: example.density, iconSize: example.iconSize, iconEmphasis: "lift" }}
        descriptor={{ accessibilityLabel: appIconDockExample.label, selectedKey: selected, items: appIconDockExample.items }}
        onActivate={({ key }) => setSelected(key)}
        renderIcon={(props) => <View style={{ alignItems: "center", justifyContent: "center", width: props.size, height: props.size, borderRadius: tokens.radius.md, backgroundColor: colors.primary }}>
          {semanticGlyph({ ...props, color: colors.onPrimary, size: tokens.spacing.xl })}
        </View>} />
    </Stack>)}
  </View>;
}


function NeutralTilesPreview() {
  const [selected, setSelected] = useState("home");
  return <View style={{ height: 200, justifyContent: "flex-end" }}>
    <BottomNavigation configuration={{ presentation: "floating", selection: "tile", tone: "neutral", density: "compact" }}
      descriptor={{ accessibilityLabel: "주요 탐색", selectedKey: selected, items: [
        { id: "home", label: "홈", icon: { name: "home" } },
        { id: "search", label: "검색", icon: { name: "search" } },
        { id: "settings", label: "설정", icon: { name: "settings" } },
      ] }} onActivate={({ key }) => setSelected(key)} renderIcon={semanticGlyph} />
  </View>;
}
