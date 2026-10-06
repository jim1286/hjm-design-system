import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThinkingOrb } from "@hjmds/react/thinking-orb";
import { thinkingOrbStates } from "@hjmds/design-contracts/components/thinking-orb";
function Gallery() {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--hjm-space-lg)" }}>
    {thinkingOrbStates.map(state => <div key={state}><ThinkingOrb state={state} label={state} /><ThinkingOrb state={state} size={20} label={state} /><p>{state}</p></div>)}
  </div>;
}
const meta = { includeStories: ["Default","AllStates","Paused","Fluid","Matrix","Playground","Dark","LargeText"], id: "components-feedback-thinkingorb", title: "배포/컴포넌트/상태와 알림/생각 중 표시", component: ThinkingOrb, args: { label: "검색 중", state: "searching" } } satisfies Meta<typeof ThinkingOrb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const AllStates: Story = { name: "전체 상태", render: () => <Gallery /> };
export const Paused: Story = { name: "일시 정지", args: { paused: true } };
export const Fluid: Story = { name: "유연한 배치", args: { appearance: "fluid" } };
export const Matrix: Story = { name: "환경별 비교", args: { appearance: "matrix" } };
export const Playground: Story = { name: "직접 조작",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
