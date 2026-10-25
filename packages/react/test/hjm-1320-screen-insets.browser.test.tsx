// HJM 1.32.0 on Web: IconTile hands its rendered edge to icon artwork, ScreenLayout contentInset="body-bleed", and
// ScreenLayout as the single owner of the BottomNavigation inset (a scroll="content" list does not add it again).
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { iconTileRecipe, screenPatternRecipe } from "@hjmds/design-contracts/screen-patterns";
import { BottomNavigation, BottomNavigationInsetProvider, HjmProvider } from "../src/index.js";
import { ConversationListScreen, NotificationRow, IconTile, NotificationInboxScreen, ScreenLayout } from "../src/screens.js";
import "../src/styles.css";

import { ConversationRow } from "../src/conversation-row.js";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const gutter = screenPatternRecipe.padding;
const px = (element: Element, property: string) => Number.parseFloat(getComputedStyle(element).getPropertyValue(property));
const nextFrame = () => act(async () => { await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))); });

it("passes the fixed edge, and the filling edge measured before paint and on resize, to a render-function icon", async () => {
  const art = ({ edge }: { edge: number }) => <img alt="" data-edge={edge} width={edge} height={edge} src="data:," />;
  await act(async () => root.render(<HjmProvider><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 57.5px)" }}>
    <IconTile label="Fixed" icon={art} />
    <IconTile label="Fill" size="fill" frame="none" icon={art} />
  </div></HjmProvider>));
  const [fixed, fill] = [...host.querySelectorAll<HTMLImageElement>("img")];
  expect(Number(fixed!.dataset.edge)).toBe(iconTileRecipe.iconSize);
  expect(Number(fill!.dataset.edge)).toBeCloseTo(57.5, 1);
  host.querySelector<HTMLElement>("div[style*=grid]")!.style.gridTemplateColumns = "repeat(2, 200px)";
  await nextFrame();
  expect(Number(host.querySelectorAll<HTMLImageElement>("img")[1]!.dataset.edge)).toBe(iconTileRecipe.fillMaxSize);
});

it("body-bleed drops every body padding while the header, notice and footer keep the gutter", async () => {
  await act(async () => root.render(<HjmProvider><div style={{ height: 480 }}>
    <ScreenLayout title="Map" scroll="content" contentInset="body-bleed" notice={<p>notice</p>} footer={<button type="button">Go</button>}><div style={{ flex: 1 }} /></ScreenLayout>
  </div></HjmProvider>));
  const body = host.querySelector(".hjm-screen__body")!;
  expect(["padding-top", "padding-bottom", "padding-left", "padding-right"].map((side) => px(body, side))).toEqual([0, 0, 0, 0]);
  expect(px(host.querySelector(".hjm-screen__notice")!, "padding-left")).toBe(gutter);
  expect(px(host.querySelector(".hjm-screen__footer")!, "padding-left")).toBe(gutter);
  expect(px(host.querySelector(".hjm-screen__header")!, "padding-left")).toBe(gutter);

  // The shared state group has no inset of its own, so it keeps the gutter when the body hands it to content.
  for (const contentInset of ["body-bleed", "body-edge"] as const) {
    await act(async () => root.render(<HjmProvider><div style={{ height: 480 }}><ScreenLayout title="Map" contentInset={contentInset} state={{ kind: "empty", title: "No route" }} /></div></HjmProvider>));
    expect(px(host.querySelector(".hjm-screen__state")!, "padding-left")).toBe(gutter);
  }
});

it("ScreenLayout applies the bar inset once: scroll=\"content\", a composed screen and a bleeding last body", async () => {
  const bar = <BottomNavigation descriptor={{ accessibilityLabel: "Main", selectedKey: "home", items: [{ id: "home", label: "Home", icon: { name: "home" } }, { id: "me", label: "Me", icon: { name: "person" } }] }}
    getHref={(item) => `/${item.id}`} renderIcon={() => <svg width={24} height={24} />} />;
  const shell = (screen: React.ReactNode) => <HjmProvider systemTheme="light"><BottomNavigationInsetProvider><div style={{ height: 600 }}>{screen}</div>{bar}</BottomNavigationInsetProvider></HjmProvider>;
  const inset = async () => { await nextFrame(); return host.querySelector("nav.hjm-bottom-navigation")!.getBoundingClientRect().height; };
  // Every padding-bottom between the list and the screen root: exactly one carries the bar.
  const paddingsAbove = (selector: string) => {
    const values: number[] = [];
    for (let node = host.querySelector(selector)!.parentElement; node && node !== host; node = node.parentElement) { const value = px(node, "padding-bottom"); if (value > 0) values.push(value); }
    return values;
  };

  await act(async () => root.render(shell(<ScreenLayout title="Feed" scroll="content"><div data-list style={{ flex: 1 }} /></ScreenLayout>)));
  const covered = await inset();
  expect(covered).toBeGreaterThan(0);
  expect(paddingsAbove("[data-list]")).toHaveLength(1);
  expect(paddingsAbove("[data-list]")[0]).toBeCloseTo(gutter + covered, 0);

  await act(async () => root.render(shell(<NotificationInboxScreen title="Inbox" scroll="content"><div data-list style={{ flex: 1 }} /></NotificationInboxScreen>)));
  await inset();
  expect(paddingsAbove("[data-list]")).toHaveLength(1);
  expect(paddingsAbove("[data-list]")[0]).toBeCloseTo(gutter + covered, 0);

  await act(async () => root.render(shell(<ScreenLayout title="Map" scroll="content" contentInset="body-bleed"><div data-list style={{ flex: 1 }} /></ScreenLayout>)));
  await inset();
  expect(paddingsAbove("[data-list]")).toHaveLength(1);
  expect(paddingsAbove("[data-list]")[0]).toBeCloseTo(covered, 0);
});


it("keeps populated conversation and notification previews on one gutter", async () => {
  const shell = (screen: React.ReactNode) => <HjmProvider><div style={{height: 600}}>{screen}</div></HjmProvider>;
  await act(async () => root.render(shell(<ConversationListScreen title="Messages" search={<input aria-label="Search" />}>
    <a href="#peer"><ConversationRow title="Peer" preview="Hello" metadata="Now" avatar={<span>Avatar</span>} /></a>
  </ConversationListScreen>)));
  const body = host.querySelector(".hjm-screen__body")!;
  const row = host.querySelector("[data-hjm-conversation-row]")!;
  expect(px(body, "padding-left")).toBe(0);
  expect(row.firstElementChild!.getBoundingClientRect().left - body.getBoundingClientRect().left).toBe(gutter);
  expect(host.querySelector(".hjm-screen__notice input")!.getBoundingClientRect().left - body.getBoundingClientRect().left).toBe(gutter);
  expect(row.closest(".hjm-card, .hjm-list")).toBeNull();
  await act(async () => root.render(shell(<NotificationInboxScreen title="Inbox" rowPresentation="preview">
    <NotificationRow preview="Reply" metadata="Now" avatar={<span>Avatar</span>} />
  </NotificationInboxScreen>)));
  expect(px(host.querySelector(".hjm-screen__body")!, "padding-left")).toBe(0);
  expect(host.querySelector(".hjm-screen__notice")).toBeNull();
});
