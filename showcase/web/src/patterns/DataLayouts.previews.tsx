import { Masonry } from "@hjmds/react/masonry";
import { VirtualList } from "@hjmds/react/virtual-list";
import { QRCode } from "@hjmds/react/qr-code";
import { Container, Surface, Text } from "@hjmds/react/layout";
import { Link } from "@hjmds/react/actions";
import { qrCodeExample } from "../../../shared/component-examples.js";
const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `항목 ${index + 1}` }));
export function DataLayoutPreview({ mode = "masonry" }: { mode?: string }) {
  if (mode === "qr") return <QRCode value={qrCodeExample.href} label={qrCodeExample.label} fallback={<Link href={qrCodeExample.href}>{qrCodeExample.fallback}</Link>} />;
  if (mode === "virtual") return <Container gutter="compact"><VirtualList items={rows} keyExtractor={item => item.id} renderItem={item => <Text>{item.label}</Text>} rowHeight={64} height={400} label="가상화 예제 1000개 항목" /></Container>;
  // Masonry measures its slot and derives the column count from it; each frame lets the card fill its fixed height.
  return <Container gutter="compact"><Masonry items={rows.slice(0, 9)} keyExtractor={item => item.id} label="높이가 다른 카드" getItemHeight={item => 80 + Number(item.id) % 3 * 40} renderItem={item => <Surface bordered padding="sm" layoutStyle={{ flex: 1 }}><Text>{item.label}</Text></Surface>} /></Container>;
}
