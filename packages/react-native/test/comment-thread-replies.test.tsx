import { useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";
import { expect, it } from "vitest";
import { CommentThreadScreen, type CommentThreadItem } from "../src/screen-flows.js";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { Button } from "../src/actions.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const root: CommentThreadItem = { id: "root", parentId: null, author: "Author", timeLabel: "Now", body: <Text>Root body</Text>,
  likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false, repliesCount: 5,
  repliesNotice: <Text>Reply refresh failed</Text>, repliesFooter: <Button>Load more replies</Button> };
it("keeps reply notices and paging after the preview inside the controlled branch", () => {
  let tree!: ReactTestRenderer;
  function Example() {
    const [expanded, setExpanded] = useState(false);
    return <HjmNativeProvider><CommentThreadScreen title="Comments" items={[root,
      { id: "reply", parentId: "root", author: "Author", timeLabel: "Now", body: <Text>Preview reply</Text>, likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false }]}
      expandedIds={expanded ? ["root"] : []} onExpandedChange={() => setExpanded(value => !value)} onLike={() => {}} onReply={() => {}}
      replyLabel="Reply" repliesLabel={(count, open) => `${open ? "Hide" : "Show"} ${count} replies`} /></HjmNativeProvider>;
  }
  try {
    act(() => { tree = create(<Example />); });
    const command = (label: string) => tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === label)!;
    expect(JSON.stringify(tree.toJSON())).not.toContain("Preview reply");
    act(() => command("Show 5 replies").props.onPress());
    const shown = JSON.stringify(tree.toJSON());
    expect(shown.indexOf("Reply refresh failed")).toBeLessThan(shown.indexOf("Preview reply"));
    expect(shown.indexOf("Preview reply")).toBeLessThan(shown.indexOf("Load more replies"));
    act(() => command("Hide 5 replies").props.onPress());
    expect(JSON.stringify(tree.toJSON())).not.toContain("Reply refresh failed");
    expect(JSON.stringify(tree.toJSON())).not.toContain("Load more replies");
    expect(JSON.stringify(tree.toJSON())).toContain("Root body");
  } finally { act(() => tree.unmount()); }
});

it("offers the known reply branch before any preview has loaded", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider><CommentThreadScreen title="Comments" items={[root]} expandedIds={["root"]}
      onExpandedChange={() => {}} onLike={() => {}} onReply={() => {}} replyLabel="Reply" repliesLabel={count => `${count} replies`} /></HjmNativeProvider>); });
    expect(tree.root.findAllByType(Pressable).some(node => node.props.accessibilityLabel === "5 replies")).toBe(true);
    expect(JSON.stringify(tree.toJSON())).toContain("Load more replies");
  } finally { act(() => tree.unmount()); }
});
