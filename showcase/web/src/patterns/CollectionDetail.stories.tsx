import type { Meta, StoryObj } from "@storybook/react-vite";
import { CollectionRail } from "@hjmds/react/collection-rail";
import { Surface, Text } from "@hjmds/react/layout";
import { CollectionDetailPreview } from "./collection-detail-preview";
const meta = { id: "collection-detail", title: "배포/구성/직접 조작과 모션/카드 상세 연결", component: CollectionDetailPreview } satisfies Meta<typeof CollectionDetailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Empty: Story = { name: "비어 있음", args: { empty: true } };
// density="chip" (2026-10-23): a strip of small uniform chips (mini scoreboards) at the 144 step with the xs gap.
const games = ["LG 3:2 두산", "KT 0:1 NC", "SSG 5:5 롯데", "KIA 7:4 삼성", "키움 2:6 한화"].map((label, index) => ({ id: `g${index}`, label }));
export const Chips: Story = { name: "작은 칩 줄 · 미게시", render: () => <CollectionRail density="chip" showNavigation={false} label="오늘 경기" items={games}
  labels={{ previous: "이전 경기", next: "다음 경기", navigation: "경기 탐색" }}
  renderItem={item => <Surface tone="raised" padding="sm"><Text variant="label">{item.label}</Text></Surface>} /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const ReducedMotion: Story = { name: "동작 줄이기", globals: { motion: "reduced" } };
export const Rtl: Story = { name: "오른쪽에서 왼쪽", globals: { direction: "rtl" } };
