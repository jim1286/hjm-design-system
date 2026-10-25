import { useState, type CSSProperties, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomNavigation, BottomNavigationInsetProvider } from "@hjmds/react/navigation";
import { Icon } from "@hjmds/react/display";
import { Stack, Text } from "@hjmds/react/layout";
import { ScreenLayout } from "@hjmds/react/screens";
import { appIconDockExample, dockShapeExamples, overlayInsetExample, prominentDestinationExample } from "../../../shared/navigation-layout-examples";
import { ContractStory } from "./preview-registry";

// Individual BottomNavigation item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-navigation--bottom-navigation keeps the same preview for old links.
const meta = { id: "components-navigation-bottom-navigation", title: "배포/컴포넌트/탐색/하단 탐색", component: ContractStory, args: { name: "BottomNavigation" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const ProminentDestination: Story = { name: "솟은 가운데 목적지", render: () => <ProminentDestinationPreview /> };
export const AppIconSlots: Story = { name: "앱 아이콘 자리", render: () => <AppIconSlotsPreview /> };
export const DockShapes: Story = { name: "테마별 막대 모양", render: () => <DockShapesPreview /> };
export const OverlayInset: Story = { name: "떠 있는 막대와 화면 여백", render: () => <OverlayInsetPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const NeutralTiles: Story = { name: "중립 배경 타일", render: () => <NeutralTilesPreview /> };
export const NeutralTilesDark: Story = { name: "중립 배경 타일 · 어두운 테마", globals: { theme: "dark" }, render: () => <NeutralTilesPreview /> };

// BottomNavigation is position: fixed; a transformed phone-width stage owns its containing block (as the registry preview).
const stage: CSSProperties = { position: "relative", transform: "translateZ(0)", blockSize: 320, inlineSize: "100%", maxInlineSize: 402, marginInline: "auto", overflow: "hidden", border: "1px solid var(--hjm-color-border)", borderRadius: "var(--hjm-radius-lg)" };
function Stage({ children, height }: { children: ReactNode; height?: number }) {
  return <div style={{ ...stage, ...(height ? { blockSize: height } : {}) }}>{children}</div>;
}

function ProminentDestinationPreview() {
  const [selected, setSelected] = useState<string>(prominentDestinationExample.initial);
  return <Stage height={200}>
    <BottomNavigation configuration={{ presentation: "floating" }}
      descriptor={{ accessibilityLabel: prominentDestinationExample.label, selectedKey: selected, items: prominentDestinationExample.items }}
      getHref={({ id }) => `#${id}`} onActivate={({ key }) => setSelected(key)} renderIcon={({ name }) => <Icon name={name} />} />
  </Stage>;
}

// Artwork stands in for product app icons: the slot size comes from renderIcon's `size` (iconSize "xlarge").
function AppIconSlotsPreview() {
  const [selected, setSelected] = useState<string>(appIconDockExample.initial);
  return <Stage height={200}>
    <BottomNavigation configuration={{ presentation: "floating", iconSize: "xlarge" }}
      descriptor={{ accessibilityLabel: appIconDockExample.label, selectedKey: selected, items: appIconDockExample.items }}
      getHref={({ id }) => `#${id}`} onActivate={({ key }) => setSelected(key)}
      renderIcon={({ name, size }) => <span style={{ display: "grid", placeItems: "center", inlineSize: size, blockSize: size, borderRadius: "var(--hjm-radius-md)", background: "var(--hjm-color-surface-accent)" }}><Icon name={name} /></span>} />
  </Stage>;
}

// The provider hands the fixed bar's covered height to ScreenLayout, whose body pads by it: the last row ends above the bar.
function OverlayInsetPreview() {
  const [selected, setSelected] = useState<string>(prominentDestinationExample.initial);
  return <Stage height={420}>
    <BottomNavigationInsetProvider>
      <div style={{ display: "flex", blockSize: "100%" }}>
        <ScreenLayout title={overlayInsetExample.title}>
          <Stack gap="sm">
            {Array.from({ length: overlayInsetExample.count }, (_, index) => <Text key={index}>{overlayInsetExample.row(index + 1)}</Text>)}
            <Text tone="muted">{overlayInsetExample.last}</Text>
          </Stack>
        </ScreenLayout>
      </div>
      <BottomNavigation configuration={{ presentation: "floating" }}
        descriptor={{ accessibilityLabel: prominentDestinationExample.label, selectedKey: selected, items: prominentDestinationExample.items }}
        getHref={({ id }) => `#${id}`} onActivate={({ key }) => setSelected(key)} renderIcon={({ name }) => <Icon name={name} />} />
    </BottomNavigationInsetProvider>
  </Stage>;
}

// configuration.shape + iconEmphasis "lift": each frame comes from bottomNavigationRecipe.shapes, so a product theme
// switches the dock by configuration instead of building its own bar. Artwork stands in for full-color app icons.
function DockShapesPreview() {
  const [selected, setSelected] = useState<string>(appIconDockExample.initial);
  return <Stack gap="md">
    {dockShapeExamples.map((example) => <Stack key={example.shape} gap="xs">
      <Text variant="caption" tone="muted">{example.caption}</Text>
      <Stage height={150}>
        <BottomNavigation configuration={{ presentation: "floating", shape: example.shape, density: example.density, iconSize: example.iconSize, iconEmphasis: "lift" }}
          descriptor={{ accessibilityLabel: appIconDockExample.label, selectedKey: selected, items: appIconDockExample.items }}
          getHref={({ id }) => `#${id}`} onActivate={({ key }) => setSelected(key)}
          renderIcon={({ name, size }) => <span style={{ display: "grid", placeItems: "center", inlineSize: size, blockSize: size, borderRadius: "var(--hjm-radius-md)", color: "var(--hjm-color-on-primary)", background: "var(--hjm-color-primary)" }}><Icon name={name} /></span>} />
      </Stage>
    </Stack>)}
  </Stack>;
}


function NeutralTilesPreview() {
  const [selected, setSelected] = useState("home");
  return <Stage height={200}>
    <BottomNavigation configuration={{ presentation: "floating", selection: "tile", tone: "neutral", density: "compact" }}
      descriptor={{ accessibilityLabel: "주요 탐색", selectedKey: selected, items: [
        { id: "home", label: "홈", icon: { name: "home" } },
        { id: "search", label: "검색", icon: { name: "search" } },
        { id: "settings", label: "설정", icon: { name: "settings" } },
      ] }} getHref={({ id }) => `#${id}`} onActivate={({ key }) => setSelected(key)} renderIcon={({ name }) => <Icon name={name} />} />
  </Stage>;
}
