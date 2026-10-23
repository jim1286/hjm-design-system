// HJM 1.31 screen additions: header identity mark, brand loader, IconTile frame options, reaction summary, menu tone,
// composer error announcement, typing indicator and date separator. Normal text only (maximum text is out of scope).
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page, userEvent } from "vitest/browser";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Text } from "../src/layout.js";
import { HjmProvider } from "../src/provider.js";
import { ChatDateSeparator, ChatMessage, ChatScreen, IconTile, MessageComposer, ScreenLayout, TypingIndicator } from "../src/screens.js";
import "../src/styles.css";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

const options = [{ id: "heart", emoji: "❤️", label: "좋아요" }, { id: "laugh", emoji: "😂", label: "웃겨요" }];

it("draws a decorative title mark beside the heading, or as the heading when the title is hidden", async () => {
  await act(async () => root.render(<HjmProvider><div style={{ height: 400 }}><ScreenLayout title="LG 트윈스" titleLeading={<img alt="로고" src="data:," width={28} height={28} />}><p>본문</p></ScreenLayout></div></HjmProvider>));
  const heading = host.querySelector("h1")!;
  expect(heading.textContent).toBe("LG 트윈스");
  const mark = host.querySelector(".hjm-screen__title-leading")!;
  expect(mark.getAttribute("aria-hidden")).toBe("true");
  // Mark and heading share one group (the badge wraps after it).
  expect(mark.parentElement).toBe(heading.parentElement);

  await act(async () => root.render(<HjmProvider><div style={{ height: 400 }}><ScreenLayout title="LG 트윈스" titleVisibility="hidden" titleLeading={<span>LG</span>}><p>본문</p></ScreenLayout></div></HjmProvider>));
  expect(host.querySelector("h1")).toBeNull();
  const standalone = host.querySelector('[role="heading"]')!;
  expect(standalone.getAttribute("aria-label")).toBe("LG 트윈스");
  expect(standalone.getAttribute("aria-level")).toBe("1");
  // A mark needs the titled band, not the compact icon-only band.
  expect(host.querySelector<HTMLElement>(".hjm-screen__header")!.style.minBlockSize).toBe("52px");
});

it("replaces the loading spinner with a brand indicator while keeping the named status", async () => {
  await act(async () => root.render(<HjmProvider><div style={{ height: 400 }}><ScreenLayout title="홈" state={{ kind: "loading", title: "불러오는 중" }} loadingIndicator={<span data-testid="flower">꽃</span>} /></div></HjmProvider>));
  const state = host.querySelector(".hjm-screen__state")!;
  expect(state.querySelector(".hjm-spinner")).toBeNull();
  const status = state.querySelector('[role="status"]')!;
  expect(status.getAttribute("aria-label")).toBe("불러오는 중");
  expect(status.getAttribute("aria-busy")).toBe("true");
  expect(status.querySelector('[aria-hidden="true"] [data-testid="flower"]')).not.toBeNull();
});

it("keeps the chat avatar as ChatScreen's own title mark", async () => {
  await act(async () => root.render(<HjmProvider><div style={{ height: 500 }}><ChatScreen title="서연" avatar={<span data-testid="peer">S</span>} composer={<p>작성창</p>} /></div></HjmProvider>));
  expect(host.querySelector('.hjm-screen__title-leading [data-testid="peer"]')).not.toBeNull();
});

it("offers frameless, shaped and grid-filling IconTile icons from the recipe", async () => {
  await act(async () => root.render(<HjmProvider><div style={{ display: "grid", gridTemplateColumns: "100px 40px 70px", gap: 8 }}>
    <IconTile icon={<span>A</span>} label="기본" />
    <IconTile icon={<span>B</span>} label="채움" size="fill" shape="circle" />
    <IconTile icon={<span>C</span>} label="틀 없음" frame="none" shape="square" />
  </div></HjmProvider>));
  const frames = [...host.querySelectorAll<HTMLElement>("[data-hjm-icon-tile] > span:first-child")];
  expect(frames[0]!.style.borderRadius).toBe("22%");
  expect(frames[0]!.getBoundingClientRect().width).toBe(64);
  // A 40px cell clamps a filling icon to fillMinSize; it stays square and round.
  expect(frames[1]!.getBoundingClientRect().width).toBe(48);
  expect(frames[1]!.getBoundingClientRect().height).toBe(48);
  expect(frames[1]!.style.borderRadius).toBe("50%");
  expect(frames[2]!.style.background).toBe("");
  expect(frames[2]!.style.boxShadow).toBe("");
  expect(frames[2]!.style.borderRadius).toBe("0%");
});

it("opens the hold menu from the reaction summary and gives destructive rows the danger tone", async () => {
  const remove = vi.fn();
  function Message() {
    const [value, setValue] = useState<string | null>("heart");
    return <ChatMessage direction="outgoing" author="" timestamp="오후 3:04"
      reactions={{ label: "메시지에 반응", closeLabel: "닫기", value, onValueChange: setValue, options,
        menuActions: [{ id: "delete", label: "삭제", tone: "danger", onPress: remove }],
        summary: { label: "반응 ❤️ 2개, 😂 1개. 반응 메뉴 열기", items: [{ id: "heart", emoji: "❤️", count: 2 }, { id: "laugh", emoji: "😂", count: 1 }] } }}>
      주말에 같이 가요
    </ChatMessage>;
  }
  await act(async () => root.render(<HjmProvider><Message /></HjmProvider>));
  const summary = page.getByRole("button", { name: "반응 ❤️ 2개, 😂 1개. 반응 메뉴 열기" });
  const element = summary.element() as HTMLElement;
  // Own reaction is among the items; a single reaction shows its emoji alone.
  expect(element.hasAttribute("data-selected")).toBe(true);
  expect(element.textContent).toBe("❤️2😂");
  await summary.click();
  const menuItem = page.getByRole("button", { name: "삭제" });
  await expect.element(menuItem).toBeVisible();
  expect((menuItem.element() as HTMLElement).dataset.tone).toBe("danger");
  await menuItem.click();
  expect(remove).toHaveBeenCalledTimes(1);
});

// 2026-10-18 Utilverse guests cannot react: the counts stay beside the time as text, not as a menu button.
it("draws a read-only summary as named text in the same place", async () => {
  await act(async () => root.render(<HjmProvider><ChatMessage direction="incoming" author="서연" timestamp="오후 3:04"
    reactions={{ label: "메시지에 반응", closeLabel: "닫기", value: null, onValueChange: () => {}, options,
      summary: { label: "반응 ❤️ 2개, 😂 1개", readOnly: true, items: [{ id: "heart", emoji: "❤️", count: 2 }, { id: "laugh", emoji: "😂", count: 1 }] } }}>
    주말에 같이 가요
  </ChatMessage></HjmProvider>));
  const counts = host.querySelector<HTMLElement>(".hjm-chat-message__meta .hjm-chat-message__reaction-counts")!;
  expect(counts.closest("button")).toBeNull();
  expect(host.querySelector(".hjm-chat-message__reaction-summary")).toBeNull();
  expect(counts.querySelector(".hjm-visually-hidden")?.textContent).toBe("반응 ❤️ 2개, 😂 1개");
  expect([...counts.querySelectorAll('[aria-hidden="true"]')].map(node => node.textContent)).toEqual(["❤️2", "😂"]);
});

it("rejects a summary without a label or with invalid counts", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const render = (summary: { label: string; items: { id: string; emoji: string; count: number }[] }) => act(async () => root.render(<HjmProvider>
    <ChatMessage direction="incoming" author="서연" timestamp="지금" reactions={{ label: "반응", closeLabel: "닫기", value: null, onValueChange: () => {}, options, summary }}>안녕</ChatMessage>
  </HjmProvider>));
  await expect(render({ label: "", items: [{ id: "heart", emoji: "❤️", count: 1 }] })).rejects.toThrow(TypeError);
  await expect(render({ label: "반응", items: [{ id: "heart", emoji: "❤️", count: 0 }] })).rejects.toThrow(RangeError);
  error.mockRestore();
});

it("announces a composer send error assertively while the field still shows it", async () => {
  function Composer() {
    const [error, setError] = useState<string | undefined>();
    return <><MessageComposer value="안녕" label="메시지" sendLabel="전송" onValueChange={() => {}} onSend={() => setError("전송하지 못했어요")} {...(error ? { error } : {})} /></>;
  }
  await act(async () => root.render(<HjmProvider><Composer /></HjmProvider>));
  // The shared Field error region (1.31): one alert node, mounted before the error, linked from the input.
  const alerts = () => host.querySelectorAll('.hjm-message-composer [role="alert"]');
  expect(alerts()).toHaveLength(1);
  const alert = alerts()[0]!;
  expect(alert.textContent).toBe("");
  await page.getByRole("button", { name: "전송" }).click();
  expect(alerts()).toHaveLength(1);
  expect(alerts()[0]).toBe(alert);
  expect(alert.textContent).toBe("전송하지 못했어요");
  expect(host.querySelector("textarea")!.getAttribute("aria-describedby")!.split(" ")).toContain(alert.id);
  const visible = host.querySelector(".hjm-field__error")!;
  expect(visible.textContent).toBe("전송하지 못했어요");
  expect(visible.getAttribute("aria-hidden")).toBe("true");
});

it("shows typing dots as a polite named status that stops pulsing under reduced motion", async () => {
  await act(async () => root.render(<HjmProvider reducedMotion><TypingIndicator label="서연님이 입력 중" /></HjmProvider>));
  const status = host.querySelector<HTMLElement>('[role="status"].hjm-typing-indicator')!;
  expect(status.textContent).toBe("서연님이 입력 중");
  expect(status.querySelector(".hjm-typing-indicator__bubble")!.getAttribute("aria-hidden")).toBe("true");
  expect(status.querySelectorAll(".hjm-typing-indicator__dot")).toHaveLength(3);
  expect(getComputedStyle(status.querySelector(".hjm-typing-indicator__dot")!).animationName).toBe("none");
  await act(async () => root.render(<HjmProvider><TypingIndicator label="입력 중" /></HjmProvider>));
  expect(getComputedStyle(host.querySelector(".hjm-typing-indicator__dot")!).animationName).toBe("hjm-typing-pulse");
});

it("centers a product-formatted date between timeline groups", async () => {
  await act(async () => root.render(<HjmProvider><div style={{ width: 320 }}><ChatDateSeparator label="10월 18일 토요일" dateTime="2026-10-18" /></div></HjmProvider>));
  const time = host.querySelector("time")!;
  expect(time.getAttribute("dateTime")).toBe("2026-10-18");
  expect(time.textContent).toBe("10월 18일 토요일");
  const row = host.querySelector<HTMLElement>(".hjm-chat-date-separator")!;
  const text = time.getBoundingClientRect(), box = row.getBoundingClientRect();
  expect(Math.abs((text.left + text.right) / 2 - (box.left + box.right) / 2)).toBeLessThan(2);
});


it("activates an IconTile without clipping its 64px artwork in a narrow cell", async () => {
  const activate = vi.fn();
  const content = (disabled = false) => <HjmProvider><div style={{ width: 68 }}><IconTile label="Long artwork title" activationLabel="Open artwork" onActivate={activate} disabled={disabled} icon={<span>★</span>} /></div></HjmProvider>;
  await act(async () => root.render(content()));
  const button = host.querySelector("button")!;
  const frame = host.querySelector('[data-hjm-icon-tile]')!.firstElementChild!;
  expect(button.getBoundingClientRect().width).toBe(68);
  expect(frame.getBoundingClientRect().width).toBe(64);
  expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(frame.getBoundingClientRect().width);
  expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  await page.getByRole("button", { name: "Open artwork", exact: true }).click();
  await userEvent.keyboard("{Enter}");
  expect(activate).toHaveBeenCalledTimes(2);
  await act(async () => root.render(content(true)));
  expect(button.disabled).toBe(true);
  button.click();
  expect(activate).toHaveBeenCalledTimes(2);
});


it("stacks profile summary actions at full width and gives emoji artwork a profile-sized frame", async () => {
  const follow = vi.fn(), message = vi.fn();
  const { ProfileSummary } = await import("../src/screen-flows.js");
  const { Button } = await import("../src/actions.js");
  await act(async () => root.render(<HjmProvider><div style={{ width: 320 }}><ProfileSummary name="Maker"
    avatar={<span data-testid="profile-emoji">🌼</span>} actionsLayout="stacked"
    actions={<><Button fullWidth onClick={follow}>Follow</Button><Button fullWidth onClick={message}>Message</Button></>} /></div></HjmProvider>));
  const buttons = [...host.querySelectorAll("button")];
  expect(buttons).toHaveLength(2);
  const first = buttons[0]!.getBoundingClientRect(), second = buttons[1]!.getBoundingClientRect();
  expect(first.width).toBe(320); expect(second.width).toBe(first.width);
  expect(second.top).toBeGreaterThan(first.bottom);
  expect(Number.parseFloat(getComputedStyle(host.querySelector('[data-testid="profile-emoji"]')!).fontSize)).toBeGreaterThanOrEqual(40);
  await page.getByRole("button", { name: "Message", exact: true }).click();
  expect(message).toHaveBeenCalledOnce(); expect(follow).not.toHaveBeenCalled();
});

for (const theme of ["light", "dark"] as const) {
  it(`keeps incoming bubbles and tails visible on the ${theme} chat canvas`, async () => {
    await act(async () => root.render(<HjmProvider theme={theme}>
      <ChatMessage direction="incoming" author="서연" timestamp="지금">수신</ChatMessage>
      <ChatMessage direction="outgoing" author="" timestamp="지금" replyQuote={{title:"서연에게 답장",excerpt:"원문"}} replyLink={{label:"원문으로 이동",onPress:()=>{}}}><Text>발신</Text></ChatMessage>
    </HjmProvider>));
    const incoming = host.querySelector<HTMLElement>('[data-direction="incoming"] .hjm-chat-message__bubble')!;
    const outgoing = host.querySelector<HTMLElement>('[data-direction="outgoing"] .hjm-chat-message__bubble')!;
    const palette = getComputedStyle(incoming);
    const resolveColor = (token: string) => {
      const probe = document.createElement("span"); incoming.append(probe); probe.style.backgroundColor = `var(${token})`;
      const color = getComputedStyle(probe).backgroundColor; probe.remove(); return color;
    };
    expect(palette.backgroundColor).not.toBe(resolveColor("--hjm-color-bg"));
    expect(palette.backgroundColor).not.toBe(resolveColor("--hjm-color-surface"));
    expect(getComputedStyle(incoming, "::before").backgroundColor).toBe(palette.backgroundColor);
    expect(getComputedStyle(outgoing).backgroundColor).toBe(resolveColor("--hjm-color-primary"));
    expect(getComputedStyle(outgoing.querySelector(".hjm-text")!).color).toBe(resolveColor("--hjm-color-on-primary"));
    expect(getComputedStyle(outgoing, "::before").backgroundColor).toBe(getComputedStyle(outgoing).backgroundColor);
    const quote = outgoing.querySelector<HTMLElement>(".hjm-chat-message__reply")!;
    expect(getComputedStyle(quote).borderInlineStartWidth).toBe("0px");
    expect(getComputedStyle(quote).overflow).toBe("hidden");
    expect(getComputedStyle(quote, "::before").inlineSize).toBe("3px");
    expect(getComputedStyle(quote, "::before").backgroundColor).toBe(resolveColor("--hjm-color-on-primary"));
  });
}
