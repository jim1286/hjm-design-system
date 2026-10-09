import { cloneElement, isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import { AuthScreenLayout } from "../src/auth-screen.js";
import { Collapsible } from "../src/collapsible.js";
import { ColorPicker } from "../src/color-picker.js";
import { Heading } from "../src/heading.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { defaultRenderFixtures } from "./default-render-fixtures.js";
import { ActivityHeatmap } from "../src/activity-heatmap.js";
import { AssetGroup } from "../src/asset.js";
import { CodeBlock } from "../src/code-block.js";
import { TextTransition } from "../src/content-transition.js";
import { DurationField } from "../src/duration-field.js";
import { EffectSurface } from "../src/effect-surface.js";
import { FolderPreview } from "../src/folder-preview.js";
import { GravityLetters } from "../src/gravity-letters.js";
import { GridReveal } from "../src/grid-reveal.js";
import { InlineConfirm } from "../src/inline-confirm.js";
import { NavigationBar } from "../src/navigation-bar.js";
import { NotificationBell } from "../src/notification-bell.js";
import { ReactionPicker } from "../src/reaction-picker.js";
import { ScrollProgress } from "../src/scroll-progress.js";
import { StepPlayer } from "../src/step-player.js";
import { SwipeActions } from "../src/swipe-actions.js";
import { TaskList } from "../src/task-list.js";
import { VoiceNote } from "../src/voice-note.js";
import { ChatMessage, ChatScreen, MessageComposer, NotificationInboxScreen, ScreenLayout, SettingsScreen } from "../src/screens.js";
import { CommentThreadScreen, EditorScreen, ListDetailScreen, MediaSelectionScreen, ModerationScreen, OnboardingScreen, PermissionScreen, ProfileScreen, SearchScreen } from "../src/screen-flows.js";
import { SavedItemsScreen } from "../src/saved-items.js";
import type { CarouselMotionProps } from "../src/carousel-motion.js";
import type { MorphingMenuProps } from "../src/menu-morph.js";
import type { SortableCollectionProps } from "../src/sortable.js";
import type { AnimatedStatisticProps } from "../src/statistic-motion.js";

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Chip,
  Combobox,
  Field,
  Image,
  LoadMore,
  NativeSelect,
  NumberField,
  PasswordField,
  Radio,
  RadioGroup,
  SearchField,
  Section,
  SegmentedControl,
  StatisticGroup,
  TabPanel,
  Table,
  Select,
  TextArea,
  TextField,
  Container,
  CounterBadge,
  Grid,
  HjmProvider,
  IconButton,
  ListRow,
  Stack,
  Surface,
  Switch,
  Tag,
  Text,
  hjmCompositionStyleKeys,
  type ContainerProps,
  type GridProps,
  type HjmCompositionStyle,
  type HjmCompositionStyleProp,
  type StackProps,
  type SurfaceProps,
  type TextProps,
} from "../src/index.js";

describe("web composition style", () => {
  it("accepts layout-only placement on the component roots that apps place directly", () => {
    // 배치 전용 style은 컴포넌트마다 따로 열지 않는다. 하나라도 빠지면 소비 앱이
    // 그 컴포넌트에서만 legacy `style`을 쓰게 되어 계약이 무너진다.
    expectTypeOf<StackProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<SurfaceProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<ContainerProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<GridProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<TextProps["layoutStyle"]>()
      .toEqualTypeOf<HjmCompositionStyleProp | undefined>();
  });

  it("keeps physical direction out of the key set so RTL placement stays logical", () => {
    expect(hjmCompositionStyleKeys).toEqual(expect.arrayContaining([
      "alignSelf",
      "flexGrow",
      "marginInline",
      "marginInlineStart",
      "marginTop",
      "width",
    ]));
    expect(hjmCompositionStyleKeys).not.toContain("marginLeft");
    expect(hjmCompositionStyleKeys).not.toContain("marginRight");
  });

  it("excludes the visual keys the recipe owns", () => {
    type Controlled = HjmCompositionStyle[
      | "backgroundColor"
      | "borderRadius"
      | "color"
      | "gap"
      | "height"
      | "padding"
    ];
    expectTypeOf<Controlled>().toEqualTypeOf<undefined>();
  });

  it("applies placement after the legacy style so layout wins", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Stack layoutStyle={{ marginTop: 8, width: "100%" }} style={{ marginTop: 2 }}>
          <Text>content</Text>
        </Stack>
      </HjmProvider>,
    );
    expect(markup).toContain("margin-top:8px");
    expect(markup).toContain("width:100%");
  });

  it("places every root the apps use, not only Stack", () => {
    // 한 컴포넌트만 렌더로 확인하면 나머지는 타입만 맞고 실제 적용이 빠져도 통과한다.
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Container layoutStyle={{ marginTop: 4 }}>
          <Surface layoutStyle={{ marginInlineStart: 6 }}>
            <Grid columns={{ compact: 1, medium: 2 }} layoutStyle={{ marginBottom: 5 }}>
              <Text layoutStyle={{ alignSelf: "center" }}>content</Text>
            </Grid>
          </Surface>
        </Container>
      </HjmProvider>,
    );
    expect(markup).toContain("margin-top:4px");
    expect(markup).toContain("margin-inline-start:6px");
    expect(markup).toContain("margin-bottom:5px");
    expect(markup).toContain("align-self:center");
  });

  it("places the remaining roots that pass style through to the element", () => {
    // 이 컴포넌트들은 `style`을 직접 다루지 않고 `...props`로 흘려보내므로,
    // 타입만 열고 병합을 빼먹기 쉽다. 마크업으로 실제 적용을 확인한다.
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Badge layoutStyle={{ marginTop: 11 }}>badge</Badge>
        <Tag layoutStyle={{ marginTop: 12 }}>tag</Tag>
        <Button layoutStyle={{ marginTop: 13 }}>button</Button>
        <IconButton label="icon" layoutStyle={{ marginTop: 14 }}>
          <span>i</span>
        </IconButton>
        <CounterBadge count={3} layoutStyle={{ marginTop: 15 }} />
        <Switch checked={false} label="switch" layoutStyle={{ marginTop: 16 }} />
        <ListRow title="row" layoutStyle={{ marginTop: 17 }} />
      </HjmProvider>,
    );
    for (const px of [11, 12, 13, 14, 15, 16, 17]) {
      expect(markup).toContain(`margin-top:${px}px`);
    }
  });

  it("places the form, selection, and disclosure roots on their outer frame, not the inner control", () => {
    // 2026-10-06 사용 지침 점검: 이 컴포넌트들은 layoutStyle이 없어 소비 앱이 wrapper를
    // 덧대거나 내부 input에 걸리는 `style`을 썼다. 루트(라벨·fieldset·field frame)에
    // 붙는지 태그 단위로 확인한다 — 마크업 어딘가에 있다는 것만으로는 내부 input에 붙어도 통과한다.
    const roots: ReadonlyArray<readonly [number, string]> = [
      [21, "hjm-card"], [22, "hjm-chip"], [23, "hjm-choice"], [24, "hjm-choice"],
      [25, "hjm-checkbox-group"], [26, "hjm-radio-group"], [27, "hjm-segmented"],
      [28, "hjm-combobox"], [29, "hjm-select"], [30, "hjm-select"], [31, "hjm-color-picker"],
      [32, "hjm-collapsible"], [33, "hjm-field"], [34, "hjm-field"], [35, "hjm-search-field"],
      [36, "hjm-password-field"], [37, "hjm-number-field"], [38, "hjm-field"],
      [39, "hjm-toggle-group"], [40, "hjm-heading"], [41, "hjm-section"], [42, "hjm-load-more"],
      [43, "hjm-image"], [44, "hjm-auth-screen"],
    ];
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <Card title="card" layoutStyle={{ marginTop: 21 }} />
        <Chip label="chip" layoutStyle={{ marginTop: 22 }} />
        <Checkbox label="checkbox" layoutStyle={{ marginTop: 23 }} />
        <Radio label="radio" layoutStyle={{ marginTop: 24 }} />
        <CheckboxGroup label="group" items={[{ id: "one", label: "One" }]} layoutStyle={{ marginTop: 25 }} />
        <RadioGroup label="radios" items={[{ value: "one", label: "One" }]} layoutStyle={{ marginTop: 26 }} />
        <SegmentedControl label="segments" items={[{ value: "one", label: "One" }]} layoutStyle={{ marginTop: 27 }} />
        <Combobox label="combo" items={[{ value: "one", label: "One" }]} emptyMessage="none" loadingMessage="loading"
          selectionRequiredMessage="required" layoutStyle={{ marginTop: 28 }} />
        <NativeSelect label="native" options={[{ value: "one", label: "One" }]} layoutStyle={{ marginTop: 29 }} />
        <Select label="select" placeholder="Choose" emptySelectionLabel="None"
          items={[{ id: "one", label: "One", textValue: "One" }]} layoutStyle={{ marginTop: 30 }} />
        <ColorPicker label="color" labels={{ color: "c", hex: "h", opacity: "o", invalid: "i" }} value="#b94627"
          onValueChange={() => {}} layoutStyle={{ marginTop: 31 }} />
        <Collapsible trigger="more" layoutStyle={{ marginTop: 32 }}>content</Collapsible>
        <TextField label="text" layoutStyle={{ marginTop: 33 }} style={{ marginBottom: 1 }} />
        <TextArea label="area" layoutStyle={{ marginTop: 34 }} />
        <SearchField label="search" clearLabel="clear" layoutStyle={{ marginTop: 35 }} />
        <PasswordField label="password" autofillHint="current" revealLabel="show" concealLabel="hide"
          layoutStyle={{ marginTop: 36 }} />
        <NumberField label="number" min={0} max={9} decrementLabel="-" incrementLabel="+" layoutStyle={{ marginTop: 37 }} />
        <Field controlId="custom" label="field" layoutStyle={{ marginTop: 38 }}><input id="custom" /></Field>
        <ToggleGroup descriptor={{ accessibilityLabel: "toggles", items: [{ id: "bold", label: "Bold" }] }}
          layoutStyle={{ marginTop: 39 }} />
        <Heading level="level2" layoutStyle={{ marginTop: 40 }}>heading</Heading>
        <Section title="section" layoutStyle={{ marginTop: 41 }}>body</Section>
        <LoadMore descriptor={{ state: { status: "complete" }, labels: { complete: "done", loadMore: "more", loading: "…", retry: "retry" } }}
          onLoadMore={async () => undefined} layoutStyle={{ marginTop: 42 }} />
        <Image src="/a.png" width={160} height={90} decorative={false} accessibilityLabel="image" layoutStyle={{ marginTop: 43 }} />
        <AuthScreenLayout hero={<span>hero</span>} main={<span>main</span>} layoutStyle={{ marginTop: 44 }} />
      </HjmProvider>,
    );
    for (const [px, rootClass] of roots) {
      const tag = markup.match(new RegExp(`<[a-z0-9]+ [^>]*margin-top:${px}px[^>]*>`))?.[0];
      expect(tag, `margin-top:${px}px`).toBeDefined();
      expect(tag, `margin-top:${px}px`).toMatch(new RegExp(`class="[^"]*\\b${rootClass}\\b`));
    }
    // TextField keeps `style` on the input, where existing callers put it.
    expect(markup).toMatch(/<input [^>]*margin-bottom:1px/);
  });

  it("keeps a caller style on Heading instead of replacing it with the recipe variables", () => {
    const markup = renderToStaticMarkup(
      <Heading level="level2" style={{ marginBottom: 3 }}>heading</Heading>,
    );
    expect(markup).toContain("margin-bottom:3px");
    expect(markup).toContain("--hjm-heading-size");
  });

  // Components with no in-flow box to place (see composition-style.ts). Every
  // other evidence fixture must carry `layoutStyle` to the root its marker names.
  const unplaceable = new Set([
    "alert-dialog", "celebration", "command-palette", "design-system-provider", "dialog",
    "floating-action-button", "overlay-stack", "popover", "sheet", "side-panel", "skip-nav",
    "toast", "tour", "visually-hidden",
  ]);

  // Fixture markers that name an inner element; placement belongs on the outer root.
  // "field" renders a Fragment of two fields, so the explicit test above covers it.
  const rootMarkers: Readonly<Record<string, string>> = {
    "text-area": "hjm-field", tabs: "hjm-tabs", menu: "hjm-menu", mentions: "hjm-mentions",
  };

  it.each(defaultRenderFixtures.filter(({ componentId }) => !unplaceable.has(componentId) && componentId !== "field"))(
    "places the $componentId root with layoutStyle",
    ({ componentId, marker, ssrMarker, render }) => {
      // 2026-10-06 sweep: a component without the prop made apps wrap it or reach for
      // `style`, which on several roots lands on an inner control instead.
      const element = render();
      expect(isValidElement(element), componentId).toBe(true);
      const placed = cloneElement(element as ReactElement<{ layoutStyle?: HjmCompositionStyleProp }>, {
        layoutStyle: { marginTop: 997 },
      });
      const markup = renderToStaticMarkup(<HjmProvider theme="light" systemTheme="light">{placed}</HjmProvider>);
      const tag = markup.match(/<[a-z0-9]+ [^>]*margin-top:997px[^>]*>/)?.[0];
      expect(tag, componentId).toBeDefined();
      expect(tag, componentId).toContain(rootMarkers[componentId] ?? ssrMarker ?? marker);
    },
  );

  it("places the companion and optional roots that have no evidence fixture", () => {
    // Root markers per value; the tag that carries the margin must be that root.
    const roots: ReadonlyArray<readonly [number, string]> = [
      [101, 'role="region"'], [102, "hjm-asset-group"], [103, "hjm-avatar-group"], [104, "<section"],
      [105, "<fieldset"], [106, "data-hjm-effect-surface"], [107, "hjm-button"], [108, "hjm-navigation-bar"],
      [109, "position:relative"], [110, 'role="group"'], [111, "hjm-progress"], [112, "hjm-statistic-group"],
      [113, "hjm-stack"], [114, 'aria-label="Row"'], [115, "hjm-table-scroll"], [116, 'role="tabpanel"'],
      [117, "hjm-list"], [118, "<div"], [119, "hjm-surface"], [120, "hjm-collapsible"], [121, "<span"],
      [122, "<div"],
    ];
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <ActivityHeatmap descriptor={{ startDate: "2026-10-01", endDate: "2026-10-02", days: [{ date: "2026-10-02", value: 0 }] }}
          label="Activity" formatDay={(date) => date} layoutStyle={{ marginTop: 101 }} />
        <AssetGroup label="assets" layoutStyle={{ marginTop: 102 }}><span>a</span></AssetGroup>
        <AvatarGroup label="people" layoutStyle={{ marginTop: 103 }}><Avatar name="A" /></AvatarGroup>
        <CodeBlock code="x" label="Source" layoutStyle={{ marginTop: 104 }} />
        <DurationField value={60} onValueChange={() => {}} max={600} layoutStyle={{ marginTop: 105 }}
          labels={{ label: "Duration", hours: "h", minutes: "m", seconds: "s", increment: (u) => `${u}+`, decrement: (u) => `${u}-` }} />
        <EffectSurface layoutStyle={{ marginTop: 106 }}><span>effect</span></EffectSurface>
        <InlineConfirm label="Delete" prompt="Delete?" confirmLabel="Yes" cancelLabel="No" pendingLabel="…" successLabel="Done"
          errorLabel="Retry" onConfirm={() => {}} layoutStyle={{ marginTop: 107 }} />
        <NavigationBar label="site" brand={<span>HJM</span>} layoutStyle={{ marginTop: 108 }}>links</NavigationBar>
        <NotificationBell label="0 unread" count={0} icon={<span>bell</span>} onPress={() => {}} layoutStyle={{ marginTop: 109 }} />
        <ReactionPicker label="Reactions" options={[{ id: "like", emoji: "👍", label: "Like", count: 1 }]} value={null}
          onValueChange={() => {}} layoutStyle={{ marginTop: 110 }} />
        <ScrollProgress label="Reading" metrics={{ offset: 0, contentSize: 200, viewportSize: 100 }} layoutStyle={{ marginTop: 111 }} />
        <StatisticGroup label="summary" descriptor={{ items: [{ id: "a", label: "A", value: "1" }] }} layoutStyle={{ marginTop: 112 }} />
        <StepPlayer descriptor={{ steps: [{ id: "a", label: "First" }, { id: "b", label: "Second" }], currentStepId: "a" }}
          statusLabels={{ pending: "P", current: "C", complete: "D", error: "E" }} composeAccessibleName={({ label }) => label}
          labels={{ play: "Play", pause: "Pause", replay: "Replay", progress: "Playback" }} progress={0} playing={false}
          onPlayingChange={() => {}} onReplay={() => {}} layoutStyle={{ marginTop: 113 }} />
        <SwipeActions label="Row" actions={[{ id: "save", label: "Save" }]} onAction={() => {}} onError={() => {}}
          layoutStyle={{ marginTop: 114 }}>Record</SwipeActions>
        <Table columns={[{ id: "name", header: "Name", cell: (row: string) => row }]} rows={["A"]} getRowKey={(row) => row}
          emptyState="Empty" layoutStyle={{ marginTop: 115 }} />
        <TabPanel tabsId="tabs" value="one" activeValue="one" layoutStyle={{ marginTop: 116 }}>panel</TabPanel>
        <TaskList label="Tasks" items={[{ id: "a", label: "First", completed: false }]} onCompletedChange={() => {}}
          layoutStyle={{ marginTop: 117 }} />
        <TextTransition text="hello" layoutStyle={{ marginTop: 118 }} />
        <VoiceNote descriptor={{ title: "Memo", state: "paused", duration: 84, position: 12 }}
          labels={{ play: "Play", pause: "Pause", seek: "Position", loading: "Loading", error: "Failed", retry: "Retry", backward: "Back", forward: "Forward" }}
          formatTime={(seconds) => `${seconds}s`} onPlayingChange={() => {}} onSeek={() => {}} layoutStyle={{ marginTop: 119 }} />
        <FolderPreview label="Folder" open={false} onOpenChange={() => {}} previews={[]} layoutStyle={{ marginTop: 120 }}>inside</FolderPreview>
        <GravityLetters glyphs={["a"]} layoutStyle={{ marginTop: 121 }} />
        <GridReveal ready layoutStyle={{ marginTop: 122 }}>grid</GridReveal>
      </HjmProvider>,
    );
    for (const [px, rootMarker] of roots) {
      const tag = markup.match(new RegExp(`<[a-z0-9]+ [^>]*margin-top:${px}px[^>]*>`))?.[0];
      expect(tag, `margin-top:${px}px`).toBeDefined();
      expect(tag, `margin-top:${px}px`).toContain(rootMarker);
    }
  });

  it("types layoutStyle on the optional-peer roots that this SSR suite does not render", () => {
    // These need optional peers (embla, bloom-menu, dnd-kit, number-flow) at runtime;
    // their browser tests cover behaviour, so here only the public prop is pinned.
    expectTypeOf<CarouselMotionProps["layoutStyle"]>().toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<MorphingMenuProps["layoutStyle"]>().toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<SortableCollectionProps["layoutStyle"]>().toEqualTypeOf<HjmCompositionStyleProp | undefined>();
    expectTypeOf<AnimatedStatisticProps["layoutStyle"]>().toEqualTypeOf<HjmCompositionStyleProp | undefined>();
  });
  it("lets layoutStyle win over the root defaults it shares keys with", () => {
    // Review 2026-10-06: these roots spread layoutStyle first, so their own minWidth/alignSelf/
    // flexWrap silently replaced the caller's placement.
    const tagWith = (markup: string, px: number) => markup.match(new RegExp(`<[a-z0-9]+ [^>]*margin-top:${px}px[^>]*>`))?.[0] ?? "";
    const markup = renderToStaticMarkup(
      <HjmProvider theme="light" systemTheme="light">
        <CodeBlock code="x" label="Source" layoutStyle={{ marginTop: 201, minWidth: 120 }} />
        <ReactionPicker label="Reactions" options={[{ id: "like", emoji: "+", label: "Like" }]} value={null}
          onValueChange={() => {}} layoutStyle={{ marginTop: 202, minWidth: 140 }} />
        <GravityLetters glyphs={["a"]} layoutStyle={{ marginTop: 203, flexWrap: "nowrap" }} />
        <NotificationBell label="0 unread" count={0} icon={<span>bell</span>} onPress={() => {}}
          layoutStyle={{ marginTop: 204, alignSelf: "center", width: 300 }} />
      </HjmProvider>,
    );
    expect(tagWith(markup, 201)).toContain("min-width:120px");
    expect(tagWith(markup, 202)).toContain("min-width:140px");
    expect(tagWith(markup, 203)).toContain("flex-wrap:nowrap");
    expect(tagWith(markup, 204)).toContain("align-self:center");
    // Documented exception: the floating badge needs the root to hug the icon.
    expect(tagWith(markup, 204)).toContain("width:max-content");
  });

  it("places the screen roots from ./screens, ./screen-flows and ./saved-items", () => {
    // Review 2026-10-06: composition-style.ts claimed full coverage while these entries had none.
    const action = { label: "Go", onAction: () => {} };
    const confirm = { mode: "confirm" as const, title: "Leave?", description: "Draft is lost", confirmLabel: "Leave", cancelLabel: "Stay", fallbackErrorMessage: "Failed", onConfirm: () => {} };
    const placed: ReadonlyArray<readonly [number, string, ReactElement]> = [
      [301, "hjm-screen", <ScreenLayout title="Screen" layoutStyle={{ marginTop: 301 }} />],
      [302, "hjm-screen", <SettingsScreen title="Settings" sections={[]} layoutStyle={{ marginTop: 302 }} />],
      [303, "hjm-screen", <NotificationInboxScreen title="Inbox" layoutStyle={{ marginTop: 303 }}>{null}</NotificationInboxScreen>],
      [304, "hjm-screen", <ChatScreen title="Chat" composer={null} layoutStyle={{ marginTop: 304 }} />],
      [305, "hjm-message-composer", <MessageComposer label="Message" sendLabel="Send" value="" onValueChange={() => {}} onSend={() => {}} layoutStyle={{ marginTop: 305 }} />],
      // Swipe-time presentation introduced an outer article that owns placement;
      // hjm-chat-message is the translated inner bubble. Keep the one-root style check.
      [306, "<article", <ChatMessage direction="incoming" author="A" timestamp="now" layoutStyle={{ marginTop: 306 }}>hi</ChatMessage>],
      [307, "<div", <ListDetailScreen title="List" list={null} back={action} layoutStyle={{ marginTop: 307 }} />],
      [308, "hjm-screen", <EditorScreen title="Edit" dirty={false} submit={action} cancel={action} discard={{ ...confirm }} layoutStyle={{ marginTop: 308 }}>body</EditorScreen>],
      [309, "hjm-screen", <ProfileScreen title="Profile" summary={null} edit={action} layoutStyle={{ marginTop: 309 }} />],
      [310, "hjm-screen", <ModerationScreen title="Report" reasons={[]} reason={null} onReasonChange={() => {}} reasonLabel="Reason" submit={action} layoutStyle={{ marginTop: 310 }} />],
      [311, "hjm-screen", <MediaSelectionScreen title="Media" items={[]} add={action} done={action} labels={{ pending: "p", uploading: "u", success: "s", cancel: "c", retry: "r" }}
        actionLabels={{ remove: "r", moveUp: "u", moveDown: "d" }} removeLabel={() => "r"} moveUpLabel={() => "u"} moveDownLabel={() => "d"}
        onRemove={() => {}} onMove={() => {}} onRetry={() => {}} onCancel={() => {}} layoutStyle={{ marginTop: 311 }} />],
      [312, "hjm-screen", <SearchScreen title="Search" query="" queryLabel="Query" queryClearLabel="Clear" onQueryChange={() => {}} onSearch={() => {}} layoutStyle={{ marginTop: 312 }}>{null}</SearchScreen>],
      [313, "hjm-screen", <PermissionScreen title="Camera" status="prompt" explanation="Why" request={action} settings={action} continueAction={action} layoutStyle={{ marginTop: 313 }} />],
      [314, "hjm-screen", <OnboardingScreen steps={[{ id: "a", title: "A", description: "a", content: null }]} index={0} onIndexChange={() => {}} nextLabel="Next" backLabel="Back"
        complete={action} progressLabel={(index, total) => `${index}/${total}`} layoutStyle={{ marginTop: 314 }} />],
      [315, "hjm-screen", <CommentThreadScreen title="Comments" items={[]} expandedIds={[]} onExpandedChange={() => {}} onLike={() => {}} onReply={() => {}} replyLabel="Reply"
        repliesLabel={(count) => `${count}`} layoutStyle={{ marginTop: 315 }} />],
      [316, "<div", <SavedItemsScreen title="Saved" items={[]} collections={[]} labels={{ allItems: "All", back: "Back", createCollection: "New", privateNotice: "Private", empty: "Empty" }}
        onOpenCollection={() => {}} onOpenItem={() => {}} onBack={() => {}} onCreateCollection={() => {}} renderThumbnail={() => null} renderDetail={() => null} layoutStyle={{ marginTop: 316 }} />],
    ];
    for (const [px, rootMarker, element] of placed) {
      const markup = renderToStaticMarkup(<HjmProvider theme="light" systemTheme="light">{element}</HjmProvider>);
      const tag = markup.match(new RegExp(`<[a-z0-9]+ [^>]*margin-top:${px}px[^>]*>`))?.[0];
      expect(tag, `margin-top:${px}px`).toBeDefined();
      expect(tag, `margin-top:${px}px`).toContain(rootMarker);
      // Applied once, to the outermost element: an inner list/detail ScreenLayout must not repeat it.
      expect(markup.split(`margin-top:${px}px`)).toHaveLength(2);
      // The two-pane hosts place the wrapper around the list and detail, not the list screen.
      if (rootMarker === "<div") expect(tag, `margin-top:${px}px`).not.toContain("hjm-screen");
    }
  });
});
