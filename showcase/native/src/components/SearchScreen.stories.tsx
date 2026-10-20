import { useState } from "react";
import { SearchScreen } from "@hjmds/react-native/screen-flows";
import { Sheet } from "@hjmds/react-native/overlays";
import { Button } from "@hjmds/react-native/actions";
import { Text } from "@hjmds/react-native/primitives";
import type { Meta, StoryObj } from "@storybook/react-native";
import { NativeComponentPreview } from "../component-examples";
const meta = { title: "배포/컴포넌트/레이아웃/검색 화면", component: NativeComponentPreview, args: { componentId: "search-screen", variant: "default" }, parameters: { hjm: { componentIds: ["search-screen"] }, controls: { exclude: ["componentId", "variant"] } } } satisfies Meta<typeof NativeComponentPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };

function EmbeddedPreview() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [requestQuery, setRequestQuery] = useState("");
  return <>
    <Button onPress={() => setOpen(true)}>검색 시트 열기</Button>
    <Sheet open={open} onOpenChange={setOpen} title="검색" closeLabel="닫기" size="full">
      <SearchScreen embedded title="검색" query={query} queryLabel="검색어" queryClearLabel="지우기"
        onQueryChange={setQuery} onSearch={setRequestQuery}>
        <Text>{requestQuery ? `검색 요청: ${requestQuery}` : "입력하면 잠시 뒤 요청 검색어가 바뀌어요"}</Text>
      </SearchScreen>
    </Sheet>
  </>;
}
export const Embedded: Story = { name: "시트 안 검색", render: () => <EmbeddedPreview /> };
