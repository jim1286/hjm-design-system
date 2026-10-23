import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/데이터 표시/배지", component: NativeComponentPreview, args: { componentId: "badge", variant: "default" }, parameters: { hjm: { componentIds: ["badge"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

import { Badge } from '@hjmds/react-native/data-display';
import { View } from 'react-native';
// categoryColor (2026-10-23): product classification colors per theme; HJM picks and checks the label ink.
const seriesColor = { light: '#216BA8', dark: '#216BA8' } as const;
const gradeColor = { light: '#F2C94C', dark: '#F2C94C' } as const;
export const CategoryColor: Story = { name: '제품 분류 색', render: () => <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
  <Badge label="정규시즌" categoryColor={seriesColor} />
  <Badge label="A등급" categoryColor={gradeColor} />
  <Badge label="포스트시즌" categoryColor={{ light: '#1762A0', dark: '#7FB8F0' }} variant="outline" />
</View> };
