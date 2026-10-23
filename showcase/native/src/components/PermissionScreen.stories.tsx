import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/권한 화면", component: NativeComponentPreview, args: { componentId: "permission-screen", variant: "default" }, parameters: { hjm: { componentIds: ["permission-screen"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Text } from '@hjmds/react-native/primitives';
import { PermissionScreen } from '@hjmds/react-native/screen-flows';
// recheck/alternative (2026-10-23): "check again" and the no-permission path sit in the footer in HJM's order
// instead of the explanation body (Unairplane boarding-pass scanner).
const noop = () => {};
export const DeniedWithAlternative: Story = { name: '거부 후 다시 확인과 대체 경로', render: () => <PermissionScreen title="탑승권 스캔" status="denied"
  explanation={<Text>설정에서 카메라를 허용하면 탑승권을 바로 읽어요.</Text>}
  request={{ label: '카메라 허용', onAction: noop }} settings={{ label: '설정 열기', onAction: noop }} continueAction={{ label: '계속', onAction: noop }}
  recheck={{ label: '다시 확인', onAction: noop }} alternative={{ label: '사진에서 선택', onAction: noop }} skip={{ label: '편명으로 등록', onAction: noop }} /> };
