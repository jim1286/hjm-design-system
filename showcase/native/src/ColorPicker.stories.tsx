import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { ColorPicker, ColorSwatchPicker } from '@hjmds/react-native/color-picker';
function Preview({ disabled = false, alpha = false }: { disabled?: boolean; alpha?: boolean }) {
  const [value, setValue] = useState(alpha ? '#087f5b80' : '#087f5b');
  return <ColorPicker label="색상" value={value} onValueChange={setValue} disabled={disabled} alpha={alpha}
    presets={['#333d4b', '#ffffff', '#e03131', '#ffd43b', '#087f5b', '#3f66a5']}
    labels={{ hex: 'HEX', hue: '색조', saturation: '채도', brightness: '밝기', opacity: '불투명도', invalid: '올바른 HEX 색상을 입력해 주세요', presets: '추천 색' }} />;
}
function SwatchRow() {
  const [value, setValue] = useState('#e03131');
  return <ColorSwatchPicker label="펜 색" labelVisibility="hidden" layout="scroll" value={value} onValueChange={setValue}
    colors={['#333d4b', '#ffffff', '#e03131', '#f08c00', '#ffd43b', '#087f5b', '#3f66a5', '#7048e8', '#f783ac', '#868e96']} />;
}
const meta = { title: '배포/컴포넌트/입력/색상 선택기', component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: '기본' };
export const Alpha: Story = { name: '불투명도', args: { alpha: true } };
export const Disabled: Story = { name: '비활성', args: { disabled: true } };
export const Swatches: Story = { name: '견본 한 줄', render: () => <SwatchRow /> };
export const Dark: Story = { name: '어두운 테마', globals: { theme: 'dark' } };
