import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vitest/browser";
import { afterEach, beforeEach, expect, it } from "vitest";
import { AuthScreenLayout } from "../src/auth-screen.js";
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

it("keeps one main landmark and leaves consent reachable with long copy at 200%", async () => {
  await page.viewport(320, 568);
  await act(async () => root.render(<HjmProvider textScale={2}>
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
