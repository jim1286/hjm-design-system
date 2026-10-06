import { Masonry } from "@hjmds/react/masonry";
import { VirtualList } from "@hjmds/react/virtual-list";
import { QRCode } from "@hjmds/react/qr-code";
import { useEffect, useRef, useState } from "react";
import { Container, Surface, Text } from "@hjmds/react/layout";
import { spacing } from "@hjmds/design-contracts/foundations";
const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `항목 ${index + 1}` }));
export function DataLayoutPreview({ mode = "masonry" }: { mode?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (mode !== "masonry" || !host.current) return;
    // Measure the actual slot: viewport widths also include sidebars, gutters and sheets.
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [mode]);
  if (mode === "qr") return <QRCode value="https://example.com/한글" label="공유 페이지 QR 코드" fallback={<a href="https://example.com/한글">공유 페이지 열기</a>} />;
  if (mode === "virtual") return <Container gutter="compact"><VirtualList items={rows} keyExtractor={item => item.id} renderItem={item => <Text>{item.label}</Text>} rowHeight={64} height={400} label="가상화 예제 1000개 항목" /></Container>;
  // Masonry owns frame heights; a layout host stretches Surface without overriding its recipe.
  return <Container gutter="compact"><div ref={host} data-hjm-masonry-host>{width > spacing.sm ? <Masonry items={rows.slice(0, 9)} keyExtractor={item => item.id} width={width} label="높이가 다른 카드" getItemHeight={item => 80 + Number(item.id) % 3 * 40} renderItem={item => <div style={{ height: "100%", display: "flex" }}><Surface bordered padding="sm" layoutStyle={{ flex: 1 }}><Text>{item.label}</Text></Surface></div>} /> : null}</div></Container>;
}
