import { Masonry } from "@hjmds/react-native/masonry";
import { VirtualList } from "@hjmds/react-native/virtual-list";
import { QRCode } from "@hjmds/react-native/qr-code";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Container, Surface, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { spacing } from "@hjmds/design-contracts/foundations";
const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `항목 ${index + 1}` }));
export function DataLayoutPreview({ mode = "masonry" }: { mode?: string }) {
  // onLayout measures the slot inside Container, including tablet and sheet constraints.
  const [width, setWidth] = useState(0);
  if (mode === "qr") return <QRCode value="https://example.com/한글" label="공유 페이지 QR 코드" fallback={<Button onPress={() => { void import("react-native").then(({ Linking }) => Linking.openURL("https://example.com/한글")); }}>공유 페이지 열기</Button>} />;
  if (mode === "virtual") return <Container gutter="compact"><VirtualList items={rows} keyExtractor={item => item.id} renderItem={item => <Text>{item.label}</Text>} rowHeight={64} height={400} label="가상화 예제 1000개 항목" /></Container>;
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact"><View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    {width > spacing.sm ? <Masonry items={rows.slice(0, 9)} keyExtractor={item => item.id} width={width} label="높이가 다른 카드" getItemHeight={item => 80 + Number(item.id) % 3 * 40} renderItem={item => <Surface bordered padding="sm" layoutStyle={{ flex: 1 }}><Text>{item.label}</Text></Surface>} /> : null}
  </View></Container></ScrollView>;
}
