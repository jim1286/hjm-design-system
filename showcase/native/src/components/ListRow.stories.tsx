import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/목록 행", component: NativeComponentPreview, args: { componentId: "list-row", variant: "default" }, parameters: { hjm: { componentIds: ["list-row"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { ListRow } from '@hjmds/react-native/data-display';
import { View } from 'react-native';
// trailingAccessory="disclosure" (2026-10-23): HJM draws the chevron products used to put into `trailing`.
export const Disclosure: Story = { name: '이동 표시', render: () => <View style={{ paddingHorizontal: 16 }}>
  <ListRow title="알림 설정" trailingAccessory="disclosure" onPress={() => {}} />
  <ListRow title="앱 버전" description="최신 버전을 사용 중입니다" trailingText="1.2.0" trailingAccessory="disclosure" onPress={() => {}} />
</View> };
