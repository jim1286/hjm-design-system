// 1.13.2 patch: utilverse 1.13.1 on iPhone 17 Pro · iOS 26.5 at a large text size showed SearchScreen's
// recent-search remove × as a clipped "⌄" (2026-10-06). The default glyph was HJM Text, which scales with
// text (OS Dynamic Type in native mode, textScale in controlled mode), inside IconButton's fixed glyph frame.
// Every built-in glyph that sits in a fixed frame must stay at its 1x size; the button keeps its name. Since 2026-11-05
// the glyphs are Lucide icons (the only icon source) with a fixed point size instead of font characters.
import { type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import type { LucideIcon } from "lucide-react-native";
import Check from "lucide-react-native/icons/check";
import EllipsisVertical from "lucide-react-native/icons/ellipsis-vertical";
import X from "lucide-react-native/icons/x";
import { afterEach, describe, expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { TagsInput } from "../src/tags-input.js";
import { Toast } from "../src/feedback.js";
import { Chip, SearchField } from "../src/inputs.js";
import { SearchScreen } from "../src/screen-flows.js";
import { ChatMessage, MessageComposer } from "../src/screens.js";
import { Text } from "../src/primitives.js";
import { LucideGlyph } from "../src/internal/lucide-glyph.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer | undefined;
afterEach(() => { act(() => tree?.unmount()); tree = undefined; });

// undefined = native mode (OS Dynamic Type through allowFontScaling); numbers = controlled textScale.
function glyphs(node: ReactNode, icon: LucideIcon, textScale?: number) {
  act(() => { tree?.unmount(); tree = create(<HjmNativeProvider reducedMotion {...(textScale === undefined ? {} : { textScale })}>{node}</HjmNativeProvider>); });
  const found = tree!.root.findAllByType(icon);
  expect(found.length).toBeGreaterThan(0);
  expect(tree!.root.findAllByType(LucideGlyph).filter(glyph => glyph.props.icon === icon).length).toBe(found.length);
  return found.map(glyph => ({ accessible: glyph.props.accessible, size: glyph.props.size as number }));
}

const cases: ReadonlyArray<readonly [string, LucideIcon, () => ReactNode]> = [
  ["TagsInput remove", X, () => <TagsInput label="태그" tags={["산책"]} composeRemoveLabel={tag => `${tag} 삭제`} onTagsChange={() => {}} />],
  ["Chip selection indicator", Check, () => <Chip label="필터" selectionMode="multiple" selected onPress={() => {}} />],
  ["Toast close", X, () => <Toast descriptor={{ id: "toast", description: "저장했어요", durationMs: null, closeLabel: "알림 닫기" }} />],
  ["SearchScreen recent remove", X, () => <SearchScreen title="검색" queryLabel="검색" queryClearLabel="검색 지우기" query="" onQueryChange={() => {}} onSearch={() => {}}
    recentQueries={{ items: ["카페"], title: "최근 검색", clearAllLabel: "전체 삭제", onClearAll: () => {}, removeLabel: item => `${item} 삭제`, onRemove: () => {} }}><Text>결과</Text></SearchScreen>],
  ["SearchField clear", X, () => <SearchField accessibilityLabel="검색" clearLabel="지우기" busyLabel="검색 중" value="카페" onValueChange={() => {}} />],
  ["MessageComposer reply cancel", X, () => <MessageComposer label="메시지" sendLabel="보내기" value="" onValueChange={() => {}} onSend={() => {}}
    replyTo={{ author: "서연", excerpt: "안녕", cancelLabel: "답장 취소", onCancel: () => {} }} />],
  ["MessageComposer attachment remove", X, () => <MessageComposer label="메시지" sendLabel="보내기" value="" onValueChange={() => {}} onSend={() => {}}
    attachments={[{ id: "a", removeLabel: "사진 삭제", preview: <Text>사진</Text> }]} onRemoveAttachment={() => {}} />],
  ["ChatMessage reaction menu trigger", EllipsisVertical, () => <ChatMessage direction="incoming" author="서연" timestamp="지금" interactiveContent
    reactions={{ label: "반응", closeLabel: "닫기", options: [{ id: "heart", emoji: "❤️", label: "하트" }], value: null, onValueChange: () => {} }}><Text>사진</Text></ChatMessage>],
];

describe("built-in glyphs in fixed icon frames", () => {
  it.each(cases)("%s keeps its 1x glyph size under normal native and controlled scaling", (_name, icon, fixture) => {
    const base = glyphs(fixture(), icon, 1);
    for (const scale of [undefined, 1.3] as const) {
      const scaled = glyphs(fixture(), icon, scale);
      for (const [index, item] of scaled.entries()) {
        expect(item.accessible).toBe(false);
        expect(item.size).toBe(base[index]!.size);
      }
    }
  });
});
