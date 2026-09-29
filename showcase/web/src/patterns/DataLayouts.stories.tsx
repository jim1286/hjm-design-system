import type { Meta, StoryObj } from "@storybook/react-vite";
import { Masonry } from "@hjmds/react/masonry";
import { VirtualList } from "@hjmds/react/virtual-list";
import { QRCode } from "@hjmds/react/qr-code";
const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `항목 ${index + 1}` }));
export function DataLayoutPreview({ mode = "masonry" }: { mode?: string }) {
  if (mode === "qr") return <QRCode value="https://example.com/한글" label="공유 페이지 QR 코드" fallback={<a href="https://example.com/한글">공유 페이지 열기</a>} />;
  if (mode === "virtual") return <VirtualList items={rows} keyExtractor={item => item.id} renderItem={item => <span>{item.label}</span>} rowHeight={64} height={400} label="가상화 예제 1000개 항목" />;
  return <Masonry items={rows.slice(0, 9)} keyExtractor={item => item.id} width={320} label="높이가 다른 카드" getItemHeight={item => 80 + Number(item.id) % 3 * 40} renderItem={item => <div style={{ height: "100%", background: "var(--hjm-color-surface)", padding: "var(--hjm-space-sm)" }}>{item.label}</div>} />;
}
const meta = { title: "Patterns/Data layouts", component: DataLayoutPreview } satisfies Meta<typeof DataLayoutPreview>;
export default meta;
export const PackedCards: StoryObj<typeof meta> = {};
export const WindowedList: StoryObj<typeof meta> = { args: { mode: "virtual" } };
export const ShareCode: StoryObj<typeof meta> = { args: { mode: "qr" } };
