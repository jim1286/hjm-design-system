import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { FlatList, Text, View } from "react-native";
import { HjmNativeProvider } from "../src/provider.js";
import { VirtualList } from "../src/virtual-list.js";
import { Masonry } from "../src/masonry.js";
import { QRCode } from "../src/qr-code.js";
vi.mock("react-native-svg", async () => { const { View } = await import("react-native"); return { default: View, Rect: View, Path: View }; });
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("passes fixed-row geometry and keys to native virtualization", async () => {
  let tree!: ReturnType<typeof create>;
  await act(async () => { tree=create(<VirtualList items={["a","b"]} keyExtractor={item=>item} rowHeight={60} height={240} label="Results" renderItem={item=><Text>{item}</Text>} />); });
  const list=tree.root.findByType(FlatList);
  expect(list.props.getItemLayout(null,1)).toEqual({length:60,offset:60,index:1});
  expect(list.props.style).toEqual({ height: 240, flexGrow: 0, flexShrink: 0 });
  expect(list.props.accessibilityLabel).toBe("Results");
  act(()=>tree.unmount());
});
it("mirrors masonry placement under RTL while preserving source order", async () => {
  let tree!: ReturnType<typeof create>;
  await act(async()=>{ tree=create(<HjmNativeProvider direction="rtl"><Masonry items={[100,50,80]} keyExtractor={String} label="Cards" width={210} gap={10} getItemHeight={item=>item} renderItem={item=><Text>{item}</Text>} /></HjmNativeProvider>); });
  const cells=tree.root.findAllByType(View).filter(node=>node.props.style?.position==="absolute");
  expect(cells.map(node=>node.props.style.right)).toEqual([0,110,110]);
  expect(cells.map(node=>node.props.style.top)).toEqual([0,0,60]);
  act(()=>tree.unmount());
});
it("exposes a named QR host and keeps the alternative content", async()=>{
  let tree!: ReturnType<typeof create>;
  await act(async()=>{tree=create(<QRCode value="https://example.com" label="Share code" fallback={<Text>Open directly</Text>} />);});
  expect(tree.root.findAllByType(View).some(node=>node.props.accessibilityRole==="image" && node.props.accessibilityLabel==="Share code")).toBe(true);
  expect(tree.root.findByType(Text).props.children).toBe("Open directly");
  act(()=>tree.unmount());
});
