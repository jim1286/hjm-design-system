import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidePanelPreview, NonModalSidePanelPreview } from "./SidePanel.previews.js";

const meta = { includeStories: ["Default","NonModalHelper","Dark","LargeText"], id: "patterns-sidepanel", title: "배포/컴포넌트/오버레이/측면 패널", component: SidePanelPreview } satisfies Meta<typeof SidePanelPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const NonModalHelper: Story = { name: "화면을 가리지 않는 도움말", render: () => <NonModalSidePanelPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
