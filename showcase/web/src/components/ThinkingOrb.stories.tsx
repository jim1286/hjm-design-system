import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThinkingOrb } from "@hjmds/react/thinking-orb";
import { thinkingOrbStates } from "@hjmds/design-contracts/components/thinking-orb";
function Gallery() {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--hjm-space-lg)" }}>
    {thinkingOrbStates.map(state => <div key={state}><ThinkingOrb state={state} label={state} /><ThinkingOrb state={state} size={20} label={state} /><p>{state}</p></div>)}
  </div>;
}
const meta = { title: "Patterns/Thinking Orb", component: ThinkingOrb, args: { label: "검색 중", state: "searching" } } satisfies Meta<typeof ThinkingOrb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const AllStates: Story = { render: () => <Gallery /> };
export const Paused: Story = { args: { paused: true } };
