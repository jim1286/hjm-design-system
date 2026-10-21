import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, Text as NativeText, View } from "react-native";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { glyph, typography } from "@hjmds/design-contracts/foundations";
import { iconButtonRecipe, resolveIconButtonEdgeOverhang } from "@hjmds/design-contracts/recipes";
import { resolveButtonEdgeOverhang } from "@hjmds/design-contracts/recipes/base";
import { commentThreadRecipe } from "@hjmds/design-contracts/screen-patterns";
import { Button, IconButton } from "../src/actions.js";
import { HjmNativeProvider } from "../src/provider.js";
import { ScreenLayout } from "../src/screens.js";
import { CommentThreadRow } from "../src/screen-flows.js";
import { UploadItem } from "../src/upload-item.js";

// 2026-10-17 measured audit: 44 targets at row/header edges left their glyph 10–15pt inside the inset and, in
// top-aligned rows, 12pt below the first text line. These assert the one edge rule and its consumers.
let renderer: ReactTestRenderer | undefined;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  renderer = undefined;
});
afterEach(() => { if (renderer) { const active = renderer; act(() => active.unmount()); } });
type Style = Record<string, unknown>;
function flatten(style: unknown): Style {
  const value = typeof style === "function" ? style({ pressed: false }) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(flatten)) as Style;
  return (value ?? {}) as Style;
}
function render(element: React.ReactElement, props: { minimumVisualTarget?: boolean; textScale?: number } = {}) {
  act(() => { renderer = create(<HjmNativeProvider reducedMotion {...props}>{element}</HjmNativeProvider>); });
  return renderer!;
}
const pressable = (tree: ReactTestRenderer, label: string) => flatten(tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === label)!.props.style);

describe("IconButton / Button edge rule", () => {
  it("derives the overhang from the visible diameter and the glyph slot, ghost only", () => {
    expect(resolveIconButtonEdgeOverhang("ghost", "medium")).toBe((44 - glyph.md) / 2);
    expect(resolveIconButtonEdgeOverhang("ghost", "small")).toBe((iconButtonRecipe.sizes.small.diameter - glyph.sm) / 2);
    expect(resolveIconButtonEdgeOverhang("ghost", "small", 44)).toBe((44 - glyph.sm) / 2);
    expect(resolveIconButtonEdgeOverhang("secondary", "medium")).toBe(0);
    expect(resolveButtonEdgeOverhang("ghost", "small")).toBe(12);
    expect(resolveButtonEdgeOverhang("primary", "small")).toBe(0);
    expect(resolveButtonEdgeOverhang("link", "medium")).toBe(0);
  });

  it("applies logical negative margins on the requested side and keeps the 44 target", () => {
    const tree = render(<View>
      <IconButton label="start" edge="start"><NativeText>a</NativeText></IconButton>
      <IconButton label="end" edge="end"><NativeText>b</NativeText></IconButton>
      <IconButton label="both" edge="both"><NativeText>c</NativeText></IconButton>
      <IconButton label="framed" tone="secondary" edge="end"><NativeText>d</NativeText></IconButton>
      <Button tone="ghost" size="small" edge="end">정렬</Button>
      <Button tone="primary" edge="end">저장</Button>
    </View>);
    expect(pressable(tree, "start")).toMatchObject({ width: 44, marginStart: -10 });
    expect(pressable(tree, "start").marginEnd).toBeUndefined();
    expect(pressable(tree, "end")).toMatchObject({ width: 44, marginEnd: -10 });
    expect(pressable(tree, "end").marginStart).toBeUndefined();
    expect(pressable(tree, "both")).toMatchObject({ marginStart: -10, marginEnd: -10 });
    expect(pressable(tree, "framed").marginEnd).toBeUndefined();
    const buttons = tree.root.findAllByType(Pressable).filter(node => node.props.accessibilityLabel === undefined || !["start", "end", "both", "framed"].includes(node.props.accessibilityLabel));
    expect(flatten(buttons[0]!.props.style).marginEnd).toBe(-12);
    expect(flatten(buttons[1]!.props.style).marginEnd).toBeUndefined();
  });

  it("follows the raised visible diameter of minimumVisualTarget", () => {
    const tree = render(<IconButton label="small" size="small" edge="end"><NativeText>a</NativeText></IconButton>, { minimumVisualTarget: true });
    expect(pressable(tree, "small")).toMatchObject({ width: 44, marginEnd: -(44 - glyph.sm) / 2 });
  });
});

describe("edge consumers", () => {
  it("ScreenLayout exit keeps its compact target inside the header gutter", () => {
    const tree = render(<ScreenLayout title="설정" exit={{ kind: "back", label: "뒤로", onPress: () => {} }}><NativeText>본문</NativeText></ScreenLayout>);
    expect(pressable(tree, "뒤로")).toMatchObject({ width: 36, height: 36 });
    expect(pressable(tree, "뒤로").marginStart).toBeUndefined();
    expect(tree.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === "뒤로")!.props.hitSlop).toBe(0);
  });

  it("CommentThreadRow centres the trailing targets on the author line and ends the last glyph slot on the inset", () => {
    const item = { id: "one", parentId: null, author: "작성자", body: <NativeText>내용</NativeText>, timeLabel: "방금", likeCountLabel: "3", likeIcon: <NativeText>♡</NativeText>, likeLabel: "좋아요" };
    const tree = render(<CommentThreadRow item={item} onLike={() => {}} onReply={() => {}} replyLabel="답글"
      commentMenu={{ label: () => "더 보기", dismissLabel: "닫기", items: () => [{ id: "report", label: "신고" }], onAction: () => {} }} />, { textScale: 2 });
    const column = () => renderer!.root.findAllByType(View).find(node => flatten(node.props.style).flexShrink === 0 && flatten(node.props.style).marginTop !== undefined)!;
    expect(flatten(column().props.style).marginTop).toBe((typography[commentThreadRecipe.actionAnchor.authorTextVariant].lineHeight * 2 - 44) / 2);
    // The column overhangs as a unit (the 44-wide like count shares it), so the buttons carry no margin themselves.
    expect(flatten(column().props.style).marginEnd).toBe(-10);
    expect(pressable(tree, "더 보기").marginEnd).toBeUndefined();
    act(() => renderer!.unmount()); renderer = undefined;
    render(<CommentThreadRow item={item} onLike={() => {}} onReply={() => {}} replyLabel="답글" />);
    expect(flatten(column().props.style).marginEnd).toBe(-10);
    act(() => renderer!.unmount()); renderer = undefined;
    // A product control ends the row: it owns the edge (IconButton edge="end"), HJM's column does not overhang.
    render(<CommentThreadRow item={{ ...item, actions: <NativeText>공유</NativeText> }} onLike={() => {}} onReply={() => {}} replyLabel="답글" />);
    expect(flatten(column().props.style).marginEnd).toBeUndefined();
  });

  it("UploadItem ends its drawn action glyph on the row inset", () => {
    const tree = render(<UploadItem descriptor={{ id: "photo", name: "photo.png", state: { status: "uploading", progress: 0.5 } }}
      labels={{ pending: "대기 중", uploading: "업로드 중", success: "완료", cancel: "취소", retry: "다시 시도" }} onCancel={() => {}} />);
    expect(pressable(tree, "취소").marginEnd).toBe(-10);
    // The font "×" sat ~5pt below the button centre; the glyph is drawn in the 24 slot instead.
    expect(tree.root.findAllByType(NativeText).some(node => node.props.children === "×")).toBe(false);
  });
});
