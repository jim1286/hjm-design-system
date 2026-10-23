import { useState } from "react";
import { IconButtonLink } from "@hjmds/react-native/actions";
import { Icon, Stack } from "@hjmds/react-native/primitives";
import { renderSemanticGlyph } from "@hjmds/react-native/icon-svg";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/동작/아이콘 버튼", component: NativeComponentPreview, args: { componentId: "icon-button", variant: "default" }, argTypes: { variant: { control: "select", options: ["default", "disabled", "loading"] } }, parameters: { hjm: { componentIds: ["icon-button"] }, controls: { exclude: ["componentId"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Pending: Story = { name: "처리 중", args: { variant: "loading" } };
export const Disabled: Story = { name: "비활성", args: { variant: "disabled" } };
// IconButtonLink (2026-10-23): icon-only destination with the IconButton frame; `current` marks the screen you are on.
function NavigationLinks() {
  const [current, setCurrent] = useState("/settings");
  return <Stack axis="inline" gap="xs">
    {([["/settings", "설정", "settings"], ["/profile", "프로필", "user"]] as const).map(([href, label, name]) =>
      <IconButtonLink key={href} label={label} shape="circle" current={current === href}
        destination={{ kind: "internal", href }} onNavigate={(destination) => setCurrent(destination.href)}>
        <Icon descriptor={{ name, decorative: true }} renderGlyph={renderSemanticGlyph} />
      </IconButtonLink>)}
  </Stack>;
}
export const Navigation: Story = { name: "이동 링크 · 미게시", render: () => <NavigationLinks /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
