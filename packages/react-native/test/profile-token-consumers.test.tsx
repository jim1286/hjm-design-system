import { type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable, TextInput, Text as NativeText, View } from "react-native";
import { expect, it } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { radius } from "@hjmds/design-contracts/foundations";
import { HjmNativeProvider } from "../src/provider.js";
import { Agreement } from "../src/agreement.js";
import { TagsInput } from "../src/tags-input.js";
import { Mentions } from "../src/mentions.js";
import { DatePicker } from "../src/date-picker.js";
import { Calendar } from "../src/calendar.js";
import { PasswordField } from "../src/inputs.js";
import { Badge, Tag, ListRow, List, Image, Statistic } from "../src/data-display.js";
import { BottomNavigation, Menu, LoadMore } from "../src/navigation.js";
import { NavigationBar } from "../src/navigation-bar.js";
import { CodeBlock } from "../src/code-block.js";
import { FolderPreview } from "../src/folder-preview.js";
import { ActivityHeatmap } from "../src/activity-heatmap.js";
import { SavedItemsScreen } from "../src/saved-items.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const custom = defineHjmDesignProfile({ extends: "paper", tokens: {
  radius: { sm: 3, md: 27, lg: 39, xl: 51 },
  typography: { body: { fontSize: 19, lineHeight: 30 }, bodyLarge: { fontSize: 27, lineHeight: 40 }, label: { fontSize: 17, lineHeight: 28 } },
  fontFamily: { code: ["ProductMono", "monospace"] },
} });
const flatten = (style: unknown): Record<string, unknown> => typeof style === "function" ? flatten(style({ pressed: false }))
  : Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-10-0${index + 1}` })), todayDate: "2026-10-07", weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const };

it("retains consent, tags and edited drafts while inherited form corners follow every theme and reset", () => {
  let tree!: ReactTestRenderer;
  const ui = (profile: typeof custom | undefined) => <HjmNativeProvider reducedMotion textScale={2} direction="rtl" {...(profile ? { designProfile: profile } : {})}>
    <HjmNativeProvider>
      <Agreement descriptor={{ accessibilityLabel: "약관", allLabel: "전체 동의", items: [{ id: "terms", label: "이용약관", required: true }] }} requiredLabel="필수" optionalLabel="선택" />
      <TagsInput label="태그" defaultTags={["숲"]} composeRemoveLabel={tag => `${tag} 삭제`} />
      <DatePicker descriptor={{ grid, label: "날짜", displayValue: null, placeholder: "선택" }} monthLabel="10월" clearLabel="지우기" closeLabel="닫기" composeAccessibleName={({ date }) => date} />
      <Mentions accessibilityLabel="메모" value="@ji" onValueChange={() => {}} triggers={[{ id: "person", trigger: "@" }]} candidates={[]} emptyMessage="없음" listLabel="추천" />
    </HjmNativeProvider>
  </HjmNativeProvider>;
  try {
    act(() => { tree = create(ui(custom)); });
    const tags = () => tree.root.findByType(TagsInput);
    act(() => tags().findByType(TextInput).props.onChangeText("입력 중인 초안"));
    act(() => tree.root.findByType(Agreement).findAllByType(Pressable)[0]!.props.onPress());
    for (const profile of [...Object.values(hjmDesignPresets), custom, undefined]) {
      act(() => tree.update(ui(profile)));
      const corners = profile?.tokens.radius ?? radius;
      const tagFrame = tags().findAllByType(View).find(node => flatten(node.props.style).flexWrap === "wrap")!;
      expect(flatten(tagFrame.props.style).borderRadius).toBe(corners.md);
      expect(tags().findByType(TextInput).props.value).toBe("입력 중인 초안");
      expect(tags().findAllByType(Pressable).some(node => node.props.accessibilityLabel === "숲 삭제")).toBe(true);
      expect(tree.root.findByType(Agreement).findAllByType(Pressable)[0]!.props.accessibilityState.checked).toBe(true);
      expect(tree.root.findByType(Agreement).findAllByType(View).some(node => flatten(node.props.style).borderRadius === corners.sm)).toBe(true);
      const date = tree.root.findByType(DatePicker).findAllByType(Pressable).find(node => node.props.accessibilityState?.expanded !== undefined)!;
      expect(flatten(date.props.style).borderRadius).toBe(corners.md);
      const mentionList = tree.root.findByType(Mentions).findAllByType(View).find(node => node.props.accessibilityRole === "list")!;
      expect(flatten(mentionList.props.style).borderRadius).toBe(corners.md);
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it("updates actual display, collection and navigation hosts using a product profile without replacing their public APIs", () => {
  // Deliberately unusual product radii reveal a renderer frozen on stock values.
  // Expectations keep each existing semantic role rather than flattening all corners.
  const cases: { name: string; node: ReactNode; role: "sm" | "md" | "lg" | "xl" | "full"; select?: (tree: ReactTestRenderer) => Record<string, unknown> }[] = [
    { name: "Badge", node: <Badge label="새 소식" />, role: "full" },
    { name: "Tag", node: <Tag>종이</Tag>, role: "sm" },
    { name: "ListRow", node: <ListRow title="기록" leading={<View />} leadingShape="circle" />, role: "full", select: tree => flatten(tree.root.findAllByType(View).find(node => flatten(node.props.style).overflow === "hidden")!.props.style) },
    { name: "Image", node: <Image src="https://example.com/image.png" decorative={false} accessibilityLabel="기록 이미지" width={80} height={80} renderImage={() => <View />} />, role: "md" },
    { name: "List", node: <List label="기록" appearance="grouped"><View /></List>, role: "lg", select: tree => flatten(tree.root.findAllByType(View).find(node => flatten(node.props.style).borderRadius !== undefined)!.props.style) },
    { name: "Statistic", node: <Statistic descriptor={{ id: "total", label: "기록", value: "12" }} presentation="surface" />, role: "md" },
    { name: "NavigationBar", node: <NavigationBar label="탐색" brand="브랜드"><View /></NavigationBar>, role: "xl" },
    { name: "FolderPreview", node: <FolderPreview label="기록 폴더" open={false} onOpenChange={() => {}} previews={[<View key="a" />]}><View /></FolderPreview>, role: "md", select: tree => flatten(tree.root.findAllByType(View).find(node => flatten(node.props.style).height === 104)!.props.style) },
    { name: "SavedItemsScreen", node: <SavedItemsScreen title="저장됨" items={[{ id: "a", title: "기록" }]} collections={[]} labels={{ allItems: "전체", back: "뒤로", createCollection: "새 컬렉션", privateNotice: "나만 보기", empty: "없음" }} onOpenCollection={() => {}} onOpenItem={() => {}} onBack={() => {}} onCreateCollection={() => {}} renderThumbnail={() => <View />} renderDetail={() => null} />, role: "md", select: tree => flatten(tree.root.findAllByType(View).find(node => flatten(node.props.style).aspectRatio === 1 && flatten(node.props.style).flexWrap === "wrap")!.props.style) },
  ];
  for (const entry of cases) {
    let tree!: ReactTestRenderer;
    try {
      for (const profile of [custom, hjmDesignPresets.retro, undefined]) {
        const ui = <HjmNativeProvider reducedMotion theme="dark" textScale={2} direction="rtl" {...(profile ? { designProfile: profile } : {})}>{entry.node}</HjmNativeProvider>;
        act(() => { if (tree) tree.update(ui); else tree = create(ui); });
        const style = entry.select?.(tree) ?? flatten(tree.root.findAllByType(View)[0]!.props.style);
        expect(style.borderRadius, entry.name).toBe((profile?.tokens.radius ?? radius)[entry.role]);
      }
    } finally { if (tree) act(() => tree.unmount()); }
  }
});

it("preserves menu selection and load actions while a product profile reaches navigation surfaces", () => {
  let tree!: ReactTestRenderer;
  const ui = (profile: typeof custom | undefined) => <HjmNativeProvider reducedMotion {...(profile ? { designProfile: profile } : {})}>
    <Menu defaultOpen items={[{ id: "a", label: "기록" }, { id: "b", label: "사진" }]} triggerLabel="메뉴" dismissLabel="닫기" selection={{ mode: "multiple", defaultSelectedKeys: new Set(["a"]) }} />
    <BottomNavigation descriptor={{ accessibilityLabel: "탐색", items: [{ id: "a", label: "기록", icon: { name: "home" } }, { id: "b", label: "사진", icon: { name: "image" } }], selectedKey: "a" }} configuration={{ presentation: "floating" }} renderIcon={() => null} onActivate={() => {}} />
    <LoadMore mode="manual" descriptor={{ state: { status: "ready", requestKey: "next" }, labels: { loadMore: "더 보기", loading: "불러오는 중", retry: "다시", complete: "끝" } }} onLoadMore={async () => {}} />
  </HjmNativeProvider>;
  try {
    for (const profile of [custom, hjmDesignPresets.retro, undefined]) {
      act(() => { if (tree) tree.update(ui(profile)); else tree = create(ui(profile)); });
      const corners = profile?.tokens.radius ?? radius;
      expect(tree.root.findByType(Menu).findAllByType(View).some(node => flatten(node.props.style).borderRadius === corners.lg)).toBe(true);
      expect(tree.root.findByType(Menu).findAllByType(Pressable).find(node => node.props.accessibilityLabel === "기록")!.props.accessibilityState.checked).toBe(true);
      expect(tree.root.findByType(BottomNavigation).findAllByType(View).some(node => flatten(node.props.style).borderRadius === corners.xl)).toBe(true);
      expect(tree.root.findByType(LoadMore).findAllByType(Pressable).some(node => flatten(node.props.style).borderRadius === corners.md)).toBe(true);
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it("uses product text metrics for large password frames, calendar content and selectable code exactly once", () => {
  let tree!: ReactTestRenderer;
  try {
    act(() => { tree = create(<HjmNativeProvider reducedMotion textScale={2} designProfile={custom}>
      <PasswordField autofillHint="current" label="비밀번호" defaultValue="초안" size="large" revealLabel="보기" concealLabel="숨기기" />
      <Calendar descriptor={{ grid, monthLabel: "10월" }} composeAccessibleName={({ date }) => date} renderCellContent={() => <View testID="custom-day" />} />
      <CodeBlock label="소스" code={"const 기록 = 12;\n"} />
      <ActivityHeatmap label="활동" descriptor={{ startDate: "2026-10-07", endDate: "2026-10-07", days: [{ date: "2026-10-07", value: 1 }] }} formatDay={date => date} />
    </HjmNativeProvider>); });
    const input = tree.root.findByType(PasswordField).findByType(TextInput);
    expect(flatten(input.props.style).fontSize).toBe(54);
    expect(flatten(input.props.style).lineHeight).toBe(80);
    expect(flatten(input.props.style).minHeight).toBeGreaterThanOrEqual(80);
    expect(input.props.allowFontScaling).toBe(false);
    act(() => tree.root.findByType(PasswordField).findAllByType(Pressable).find(node => node.props.accessibilityLabel === "보기")!.props.onPress());
    expect(tree.root.findByType(PasswordField).findByType(TextInput).props.value).toBe("초안");
    const cell = tree.root.findByType(Calendar).findAllByType(View).find(node => node.props.children?.props?.testID === "custom-day")!;
    expect(flatten(cell.props.style).minHeight).toBe(56);
    const source = tree.root.findByType(CodeBlock).findAllByType(NativeText).find(node => node.props.selectable)!;
    expect(flatten(source.props.style)).toMatchObject({ fontSize: 38, lineHeight: 60, fontFamily: "ProductMono", writingDirection: "ltr", textAlign: "left" });
    expect(source.props.accessibilityLabel).toBe("소스\nconst 기록 = 12;\n");
    expect(tree.root.findByType(ActivityHeatmap).findAllByType(View).some(node => flatten(node.props.style).borderRadius === 0.75)).toBe(true);
  } finally { if (tree) act(() => tree.unmount()); }
});
