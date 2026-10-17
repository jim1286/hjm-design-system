// Use normal text for behavior coverage; maximum-text checks are out of scope (2026-10-07).
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "../src/auth-screen.js";
import { HjmProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { Text } from "../src/layout.js";
import "../src/styles.css";

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); await page.viewport(1280, 720); });

it("keeps one main landmark and leaves consent reachable with long copy at normal text size", async () => {
  await page.viewport(320, 568);
  await act(async () => root.render(<HjmProvider textScale={1}>
    <main><AuthScreenLayout as="section" aria-label="로그인"
      hero={<Text variant="titleLarge">기록과 연결을 안전하게 이어가세요</Text>}
      main={<>{Array.from({ length: 4 }, (_, i) => <Button key={i}>계정을 연결하고 계속하기 {i + 1}</Button>)}</>}
      footer={<a href="#policy">개인정보처리방침과 이용약관</a>} /></main>
  </HjmProvider>));
  expect(container.querySelectorAll("main")).toHaveLength(1);
  const layout = container.querySelector<HTMLElement>("section")!;
  const body = layout.querySelector<HTMLElement>(".hjm-auth-screen__main")!;
  const footer = layout.querySelector<HTMLElement>(".hjm-auth-screen__footer")!;
  expect(footer.getBoundingClientRect().top).toBeGreaterThanOrEqual(body.getBoundingClientRect().bottom);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  footer.scrollIntoView();
  expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(568);
});

it("draws the hero tagline on a title step and keeps policy links one recipe gap apart with an invisible 44px target", async () => {
  await page.viewport(402, 874);
  await act(async () => root.render(<HjmProvider textScale={1}><AuthScreenLayout
    hero={<AuthScreenHero eyebrow="이야기" title="당신의 일상을 이야기로 남겨요" description="사진 한 장, 짧은 한 줄로 시작하세요." />}
    main={<Button>Google</Button>}
    footer={<AuthScreenFooter notice="계속하면 동의해요." links={[{ label: "이용약관", href: "#terms" }, { label: "개인정보처리방침", onClick: () => undefined }]} />} /></HjmProvider>));
  const title = container.querySelector<HTMLElement>("h1")!;
  // 2026-10-17 "굵기랑 크기 줄여": 24/32 at 500 fits one line at 402 instead of the 32/40 display heading's two.
  expect(getComputedStyle(title)).toMatchObject({ fontSize: "24px", lineHeight: "32px", fontWeight: "500" });
  expect(title.getBoundingClientRect().height).toBe(32);
  const links = [...container.querySelectorAll<HTMLElement>(".hjm-auth-screen__link")];
  const text = (element: HTMLElement) => { const range = document.createRange(); range.selectNodeContents(element); return range.getBoundingClientRect(); };
  // "간격 줄여": gap + dot + gap (about 19px), not button padding + Stack gap (42px).
  expect(text(links[1]!).left - text(links[0]!).right).toBeLessThan(24);
  for (const link of links) {
    expect(link.getBoundingClientRect().height).toBe(44);
    expect(getComputedStyle(link).paddingInline).toBe("0px");
  }
});
