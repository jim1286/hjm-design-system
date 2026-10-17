import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, type SidebarAppearance } from "@hjmds/react/sidebar";
import { Icon } from "@hjmds/react/display";
import { Stack } from "@hjmds/react/layout";
import { SegmentedControl } from "@hjmds/react/selection";
import { PreviewTools } from "./preview-tools.js";

// The motion variant is a demo-only switch, so it lives under 미리보기 도구 with Korean names instead of a row of
// selected ghost buttons showing raw enum values (2026-10-17 review D5).
const appearances = [
  { value: "standard", label: "기본" },
  { value: "bounce", label: "튕김" },
  { value: "hook", label: "걸림" },
  { value: "proximity", label: "근접" },
] as const satisfies readonly { value: SidebarAppearance; label: string }[];
const icons = { records: "calendar", archive: "download", locked: "lock" } as const;

function Preview() {
  const [appearance, setAppearance] = useState<SidebarAppearance>("bounce");
  const [current, setCurrent] = useState("records");
  return <Stack gap="lg">
    <Sidebar appearance={appearance} onNavigate={setCurrent} collapseLabels={{ collapse: "메뉴 접기", expand: "메뉴 펼치기" }}
      renderIcon={(item) => <Icon name={icons[item.id as keyof typeof icons]} />}
      descriptor={{ accessibilityLabel: "표현 비교 메뉴", currentId: current, groups: [{ id: "main", label: "기록", items: [
        { id: "records", label: "내 기록", destination: { kind: "internal", href: "#records" } },
        { id: "archive", label: "보관함", destination: { kind: "internal", href: "#archive" } },
        { id: "locked", label: "사용할 수 없음", disabled: true, destination: { kind: "internal", href: "#locked" } },
      ] }] }} />
    <PreviewTools>
      <SegmentedControl label="움직임" items={appearances} value={appearance} onValueChange={(value) => setAppearance(value as SidebarAppearance)} />
    </PreviewTools>
  </Stack>;
}
const meta = { includeStories: ["Default", "Dark", "LargeText"], id: "components-navigation-sidebar", title: "배포/컴포넌트/탐색/사이드바 전환", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
