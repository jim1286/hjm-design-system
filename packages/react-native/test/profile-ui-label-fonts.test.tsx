import { act, create, type ReactTestRenderer } from "react-test-renderer";
import type { ReactNode } from "react";
import { Pressable, Text as NativeText, TextInput, View } from "react-native";
import { expect, it, vi } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { Heading } from "../src/heading.js";
import { Button, Link } from "../src/actions.js";
import { AuthProviderButton } from "../src/provider-button.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { Checkbox, Switch, SegmentedControl, Chip, TextField } from "../src/inputs.js";
import { Tabs, Menu, TopBar } from "../src/navigation.js";
import { Select, Combobox } from "../src/forms.js";
import { Agreement } from "../src/agreement.js";
import { Toast } from "../src/feedback.js";
import { DatePicker } from "../src/date-picker.js";
import { Calendar } from "../src/calendar.js";
import { Collapsible } from "../src/collapsible.js";
import { Accordion } from "../src/data-display.js";
import { Mentions } from "../src/mentions.js";
import { TagsInput } from "../src/tags-input.js";
import { TransferList } from "../src/transfer-list.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const flatten = (style: unknown): Record<string, unknown> => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
const noop = () => undefined;
const product = defineHjmDesignProfile({ id: "role-product", tokens: { fontFamily: { ui: ["ProductUI"], display: ["ProductDisplay"], reading: ["ProductReading"] } } });
const nearest = defineHjmDesignProfile({ id: "role-nearest", tokens: { fontFamily: { ui: ["NearestUI"], display: ["NearestDisplay"], reading: ["NearestReading"] } } });
const grid = { cells: Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-0${index + 1}` })), weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const, todayDate: "2026-09-01" };
const option = (id: string, label: string) => ({ id, label, textValue: label });
const cases: readonly { name: string; node: ReactNode; labels: readonly string[] }[] = [
  { name: "private button", node: <><Button size="medium">Medium button</Button><Button size="large">Large button</Button></>, labels: ["Medium button", "Large button"] },
  { name: "provider button", node: <AuthProviderButton descriptor={{ provider: "google", label: "Google" }} logo={<View />} onPress={noop} />, labels: ["Google"] },
  { name: "toggle", node: <ToggleGroup descriptor={{ accessibilityLabel: "Toggle", items: [{ id: "bold", label: "Toggle label" }] }} />, labels: ["Toggle label"] },
  { name: "selection and switch", node: <><Checkbox label="Checkbox label" /><Switch label="Switch label" /></>, labels: ["Checkbox label", "Switch label"] },
  { name: "segments and chips", node: <><SegmentedControl label="Segments" items={[{ value: "one", label: "Segment label" }]} /><Chip label="Small chip" size="small" onPress={noop} /><Chip label="Medium chip" size="medium" onPress={noop} /></>, labels: ["Segment label", "Small chip", "Medium chip"] },
  { name: "tabs", node: <Tabs label="Tabs" items={[{ id: "one", label: "Tab label", panel: <Text>Reading panel</Text> }]} />, labels: ["Tab label"] },
  { name: "menu", node: <Menu triggerLabel="Menu trigger" dismissLabel="Close menu" defaultOpen items={[option("one", "Menu label")]} />, labels: ["Menu label"] },
  { name: "select", node: <><Select label="Select field" placeholder="Select trigger" dismissLabel="Close select" defaultOpen items={[option("one", "Select option")]} /><Select label="Large select" placeholder="Large trigger" dismissLabel="Close large" size="large" items={[option("large", "Large option")]} /></>, labels: ["Select trigger", "Select option", "Large trigger"] },
  { name: "combobox", node: <Combobox label="Combobox" clearLabel="Clear" dismissLabel="Close combo" emptyMessage="Empty" loadingMessage="Loading" defaultOpen items={[option("one", "Combo option")]} />, labels: ["Combo option"] },
  { name: "agreement", node: <Agreement descriptor={{ accessibilityLabel: "Consent", allLabel: "All consent", items: [{ id: "one", label: "Consent row", required: true }] }} requiredLabel="required" optionalLabel="optional" />, labels: ["All consent", "Consent row required"] },
  { name: "toast action", node: <Toast descriptor={{ id: "toast", closeLabel: "Close toast", description: "Reading notification", durationMs: null, action: { label: "Toast action", onAction: noop } }} />, labels: ["Toast action"] },
  { name: "link", node: <Link descriptor={{ label: "Link label", destination: { kind: "internal", href: "/destination" } }} onNavigate={noop} />, labels: ["Link label"] },
  { name: "date and calendar", node: <><DatePicker descriptor={{ grid, label: "Date", displayValue: "Date value", placeholder: "Choose date" }} monthLabel="September" clearLabel="Clear date" closeLabel="Close date" composeAccessibleName={({ date }) => date} /><Calendar descriptor={{ grid, monthLabel: "Calendar" }} composeAccessibleName={({ date }) => date} /><Calendar descriptor={{ grid, monthLabel: "Large calendar" }} size="large" composeAccessibleName={({ date }) => date} /></>, labels: ["Date value", "1"] },
  { name: "disclosures", node: <><Collapsible trigger="Disclosure label"><Text>Reading disclosure</Text></Collapsible><Accordion label="Accordion" items={[{ value: "one", title: "Accordion label", content: <Text>Reading accordion</Text> }]} /></>, labels: ["Disclosure label", "Accordion label"] },
  { name: "mentions", node: <Mentions label="Mentions" value="@a" onValueChange={noop} triggers={[{ id: "user", trigger: "@" }]} candidates={[{ id: "one", label: "Mention option", insertText: "Alice" }]} listLabel="Mention choices" emptyMessage="No mentions" />, labels: ["Mention option"] },
  { name: "tags", node: <TagsInput label="Tags" defaultTags={["Existing tag"]} suggestions={[{ id: "next", label: "Tag option" }]} suggestionsLabel="Tag choices" composeRemoveLabel={tag => `Remove ${tag}`} />, labels: ["Existing tag", "Tag option"] },
  { name: "transfer", node: <TransferList items={[option("one", "Transfer option")]} labels={{ source: "Available", target: "Selected", toTarget: "Add", toSource: "Remove", selectAll: "All", empty: "Empty" }} />, labels: ["Transfer option"] },
];
const copy = (children: unknown): string => Array.isArray(children) ? children.map(copy).join("") : typeof children === "string" || typeof children === "number" ? String(children) : "";

it.each(cases)("keeps $name UI labels separate from reading and display families through closest profile changes", ({ node, labels }) => {
  let tree!: ReactTestRenderer;
  try {
    for (const theme of ["light", "dark"] as const) for (const profile of [product, nearest, hjmDesignPresets.neutral, undefined]) {
      const ui = <HjmNativeProvider theme={theme} textScale={1} reducedMotion {...(profile ? { designProfile: product } : {})}>
        <HjmNativeProvider {...(profile ? { designProfile: profile } : {})}><HjmNativeProvider>{node}<Text>Reading sentinel</Text><Heading level="level3">Display sentinel</Heading></HjmNativeProvider></HjmNativeProvider>
      </HjmNativeProvider>;
      act(() => { if (tree) tree.update(ui); else tree = create(ui); });
      if (labels.includes("Tag option")) {
        const editor = tree.root.findByType(TextInput);
        if (!editor.props.value) act(() => editor.props.onChangeText("Tag"));
      }
      const hosts = tree.root.findAllByType(NativeText);
      const expected = profile === product ? "Product" : profile === nearest ? "Nearest" : undefined;
      for (const label of labels) {
        const matching = hosts.filter(host => copy(host.props.children) === label);
        expect(matching.length, label).toBeGreaterThan(0);
        for (const host of matching) expect(flatten(host.props.style).fontFamily, label).toBe(expected ? `${expected}UI` : undefined);
      }
      expect(flatten(hosts.find(host => host.props.children === "Reading sentinel")!.props.style).fontFamily).toBe(expected ? `${expected}Reading` : undefined);
      expect(flatten(hosts.find(host => host.props.children === "Display sentinel")!.props.style).fontFamily).toBe(expected ? `${expected}Display` : undefined);
    }
  } finally { if (tree) act(() => tree.unmount()); }
});

it("keeps selected controls and edited drafts when UI and reading families change", () => {
  let tree!: ReactTestRenderer; const clicked = vi.fn();
  const node = <><Button onPress={clicked}>Action</Button><ToggleGroup descriptor={{ accessibilityLabel: "Toggle", items: [{ id: "bold", label: "Bold" }, { id: "locked", label: "Locked", disabled: true }] }} /><Checkbox label="Choice" /><TextField label="Draft" /><Text>Reading text</Text></>;
  const render = (profile: typeof product) => <HjmNativeProvider designProfile={profile} textScale={1} reducedMotion>{node}</HjmNativeProvider>;
  try {
    act(() => { tree = create(render(product)); });
    const buttons = tree.root.findAllByType(Pressable); const editor = tree.root.findByType(TextInput);
    const press = (label: string) => buttons.find(host => host.findAllByType(NativeText).some(text => copy(text.props.children) === label))!;
    const bold = press("Bold");
    const choice = press("Choice");
    act(() => { bold.props.onPress(); choice.props.onPress(); editor.props.onChangeText("Kept draft"); });
    for (const profile of [nearest, hjmDesignPresets.neutral, product]) {
      act(() => tree.update(render(profile)));
      expect(tree.root.findByType(TextInput)).toBe(editor); expect(editor.props.value).toBe("Kept draft");
      expect(bold.props.accessibilityState.selected).toBe(true); expect(choice.props.accessibilityState.checked).toBe(true);
      expect(press("Locked").props.disabled).toBe(true);
      expect(tree.root.findAllByType(Pressable)).toEqual(buttons);
    }
    act(() => press("Action").props.onPress()); expect(clicked).toHaveBeenCalledOnce();
  } finally { if (tree) act(() => tree.unmount()); }
});

it("keeps clickable TopBar titles on UI and static titles on display while preserving title actions and heading semantics", () => {
  let tree!: ReactTestRenderer; const selectedTitle = vi.fn(); let actionHost: ReturnType<ReactTestRenderer["root"]["find"]> | undefined;
  const content = <><TopBar title="Interactive title" titleAccessibilityLabel="Open title" onTitlePress={selectedTitle} /><TopBar title="Static title" /></>;
  try {
    for (const profile of [product, nearest, hjmDesignPresets.neutral, undefined]) {
      const ui = <HjmNativeProvider textScale={1} reducedMotion {...(profile ? { designProfile: product } : {})}><HjmNativeProvider {...(profile ? { designProfile: profile } : {})}>{content}</HjmNativeProvider></HjmNativeProvider>;
      act(() => { if (tree) tree.update(ui); else tree = create(ui); });
      const hosts = tree.root.findAllByType(NativeText); const interactive = hosts.find(host => host.props.children === "Interactive title")!; const heading = hosts.find(host => host.props.children === "Static title")!;
      const prefix = profile === product ? "Product" : profile === nearest ? "Nearest" : undefined;
      expect(flatten(interactive.props.style).fontFamily).toBe(prefix ? `${prefix}UI` : undefined);
      expect(interactive.props.accessible).toBe(false); expect(interactive.props.accessibilityRole).toBeUndefined();
      expect(flatten(heading.props.style).fontFamily).toBe(prefix ? `${prefix}Display` : undefined); expect(heading.props.accessibilityRole).toBe("header");
      const current = tree.root.findAllByType(Pressable).find(host => host.props.accessibilityLabel === "Open title")!;
      expect(current.props.accessibilityRole).toBe("button"); if (!actionHost) actionHost = current; expect(current).toBe(actionHost);
    }
    act(() => actionHost!.props.onPress({ nativeEvent: {} })); expect(selectedTitle).toHaveBeenCalledOnce();
  } finally { if (tree) act(() => tree.unmount()); }
});
