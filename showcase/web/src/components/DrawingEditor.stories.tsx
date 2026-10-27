import type { Meta, StoryObj } from '@storybook/react-vite';
import { DrawingEditor } from '@hjmds/react/drawing-editor';
import { drawingEditorLabels } from '../../../shared/drawing-editor';

const meta = { title: "실험/컴포넌트/입력/손그림 편집기", component: DrawingEditor,
  args: { labels: drawingEditorLabels, cropPreview: 'circle', onCancel: () => {}, onSave: async () => {} },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DrawingEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: '기본' };
export const Square: Story = { name: '사각형 그림', args: { cropPreview: 'none' } };
export const SaveFailure: Story = { name: '저장 실패 후 다시 시도', args: { onSave: async () => { throw new Error('Example upload failure'); } } };
