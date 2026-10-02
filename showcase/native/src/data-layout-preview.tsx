import { Masonry } from "@hjmds/react-native/masonry";
import { VirtualList } from "@hjmds/react-native/virtual-list";
import { QRCode } from "@hjmds/react-native/qr-code";
import { View, useWindowDimensions } from "react-native";
import { Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
const rows = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), label: `항목 ${index + 1}` }));
export function DataLayoutPreview({ mode = "masonry" }: { mode?: string }) {
  const { colors } = useHjmNativeTheme(); const width = Math.max(120, useWindowDimensions().width - 32);
  if (mode === "qr") return <QRCode value="https://example.com/한글" label="공유 페이지 QR 코드" fallback={<Button onPress={() => { void import("react-native").then(({ Linking }) => Linking.openURL("https://example.com/한글")); }}>공유 페이지 열기</Button>} />;
  if (mode === "virtual") return <VirtualList items={rows} keyExtractor={item => item.id} renderItem={item => <Text>{item.label}</Text>} rowHeight={64} height={400} label="가상화 예제 1000개 항목" />;
  return <Masonry items={rows.slice(0, 9)} keyExtractor={item => item.id} width={width} label="높이가 다른 카드" getItemHeight={item => 80 + Number(item.id) % 3 * 40} renderItem={item => <View style={{ flex: 1, padding: 12, backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }}><Text>{item.label}</Text></View>} />;
}
