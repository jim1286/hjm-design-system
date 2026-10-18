import { useState, type CSSProperties, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomNavigation, BottomNavigationInsetProvider } from "@hjmds/react/navigation";
import { Icon } from "@hjmds/react/display";
import { Stack, Text } from "@hjmds/react/layout";
import { ScreenLayout } from "@hjmds/react/screens";
import { appIconDockExample, overlayInsetExample, prominentDestinationExample } from "../../../shared/navigation-layout-examples";
import { ContractStory } from "./preview-registry";

// Individual BottomNavigation item (2026-10-06, docs/STORYBOOK_NAVIGATION.md §1.7). The registry preview is the interactive default;
// the role overview page components-navigation--bottom-navigation keeps the same preview for old links.
const meta = { id: "components-navigation-bottom-navigation", title: "배포/컴포넌트/탐색/하단 탐색", component: ContractStory, args: { name: "BottomNavigation" }, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const ProminentDestination: Story = { name: "솟은 가운데 목적지", render: () => <ProminentDestinationPreview /> };
export const AppIconSlots: Story = { name: "앱 아이콘 자리", render: () => <AppIconSlotsPreview /> };
export const OverlayInset: Story = { name: "떠 있는 막대와 화면 여백", render: () => <OverlayInsetPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

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
