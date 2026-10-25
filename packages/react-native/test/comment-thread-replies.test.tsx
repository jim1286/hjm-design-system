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

it("opens a branch five replies at a time and asks for the next server page only after loaded replies run out", () => {
  let tree!: ReactTestRenderer;
  const reply = (index: number): CommentThreadItem => ({ id: `reply-${index}`, parentId: "root", author: "Author", timeLabel: "Now", body: <Text>{`Reply ${index}`}</Text>,
    likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false });
  const requests: string[] = [];
  const view = (loaded: number, pending = false) => <HjmNativeProvider><CommentThreadScreen title="Comments" items={[{ id: "root", parentId: null, author: "Author", timeLabel: "Now", body: <Text>Root</Text>,
    likeCountLabel: "", likeIcon: null, likeLabel: "Like", likeAction: null, canReply: false, repliesCount: 12, repliesPage: { onLoadMore: () => requests.push("next"), pending } },
    ...Array.from({ length: loaded }, (_, index) => reply(index))]}
    expandedIds={["root"]} onExpandedChange={() => {}} onLike={() => {}} onReply={() => {}} replyLabel="Reply"
    repliesLabel={(count, open) => `${open ? "Hide" : "Show"} ${count} replies`} moreRepliesLabel={count => `View ${count} more`} /></HjmNativeProvider>;
  const more = () => tree.root.findAllByType(Pressable).find(node => String(node.props.accessibilityLabel).startsWith("View "));
  try {
    act(() => { tree = create(view(7)); });
    expect(JSON.stringify(tree.toJSON())).toContain("Reply 4"); expect(JSON.stringify(tree.toJSON())).not.toContain("Reply 5");
    expect(more()!.props.accessibilityLabel).toBe("View 7 more");
    act(() => more()!.props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain("Reply 6"); expect(requests).toEqual([]);
    act(() => more()!.props.onPress());
    expect(requests).toEqual(["next"]);
    act(() => tree.update(view(7, true)));
    expect(more()!.props.disabled).toBe(true);
    act(() => tree.update(view(12)));
    expect(JSON.stringify(tree.toJSON())).toContain("Reply 11"); expect(more()).toBeUndefined();
  } finally { act(() => tree.unmount()); }
});
